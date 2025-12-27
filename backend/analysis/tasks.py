from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from .services import MockAnalysisService, AIAnalysisService
from .extractors import ContentExtractor
from .models import AnalysisResult, AnalysisRequest
from cases.models import Case, CaseFile, CaseEvent
import logging
import os

logger = logging.getLogger(__name__)


@shared_task
def analyze_case_task(case_id):
    """
    Analyzes a case with full content extraction.
    Legacy task name preserved for compatibility.
    """
    logger.info(f"Starting analysis for case {case_id}")
    
    try:
        case = Case.objects.get(id=case_id)
        
        # Extract content from all files
        files = []
        for case_file in case.files.all():
            if case_file.file:
                files.append({
                    'path': case_file.file.path,
                    'filename': os.path.basename(case_file.file.name)
                })
        
        # Build context from case + extracted content
        context_parts = [
            f"عنوان پرونده: {case.title}",
            f"دسته‌بندی: {case.get_category_display()}",
            f"توضیحات: {case.description or 'ندارد'}"
        ]
        
        # Extract content from files
        if files:
            extraction = ContentExtractor.extract_all(files)
            if extraction['summary']:
                context_parts.append(f"\n\n=== محتوای مستندات ===\n{extraction['summary']}")
            if extraction['errors']:
                logger.warning(f"Extraction errors: {extraction['errors']}")
        
        # Add events history
        events = case.events.all().order_by('timestamp')
        if events.exists():
            events_text = "\n".join([f"- {e.summary}: {e.details}" for e in events])
            context_parts.append(f"\n\n=== تاریخچه رویدادها ===\n{events_text}")
        
        full_context = "\n".join(context_parts)
        logger.info(f"Built context with {len(full_context)} characters")
        
        # Call AI/Mock service
        result_data = AIAnalysisService.analyze(full_context, case.category)
        
        # Save result
        AnalysisResult.objects.create(
            case=case,
            result_json=result_data,
            source=result_data.get('source', 'experimental-mock'),
            version=case.analyses.count() + 1,
            summary_text=result_data.get('comparison_rationale', '')[:500],
            is_mock=(result_data.get('source') == 'experimental-mock')
        )
        
        # Update case status
        case.status = 'analyzed'
        case.save(update_fields=['status'])
        
        logger.info(f"Analysis completed for case {case_id}")
        return {'status': 'success', 'case_id': str(case_id)}
        
    except Case.DoesNotExist:
        logger.error(f"Case {case_id} not found")
        return {'status': 'error', 'message': 'Case not found'}
    except Exception as e:
        logger.exception(f"Analysis task failed: {e}")
        return {'status': 'error', 'message': str(e)}


@shared_task(bind=True)
def task_reanalyze_case(self, case_id, triggering_event_id=None, mode='experimental'):
    """
    V3 Re-analysis task with content extraction, locking, progress, and provenance.
    """
    from .progress import update_progress, check_cancel_flag, clear_cancel_flag
    
    task_id = self.request.id
    lock_id = f"lock:case:{case_id}"
    
    # Emit queued status
    update_progress(task_id, case_id, 'queued', 0, 'در صف انتظار...')
    
    # Acquire lock (10 minutes expire)
    if not cache.add(lock_id, "true", timeout=600):
        logger.warning(f"Analysis already running for case {case_id}")
        update_progress(task_id, case_id, 'failed', 0, 'تحلیل قبلی در حال اجراست', error='locked')
        return {'status': 'locked'}
    
    # Find or create AnalysisRequest for tracking
    request = None
    
    try:
        logger.info(f"Re-analyzing case {case_id} triggered by event {triggering_event_id}")
        case = Case.objects.get(id=case_id)
        
        # Update progress: validating
        update_progress(task_id, str(case_id), 'validating', 5, 'اعتبارسنجی فایل‌ها...')
        
        # Check for cancellation
        if check_cancel_flag(task_id):
            update_progress(task_id, str(case_id), 'failed', 0, 'لغو شده توسط کاربر', error='cancelled')
            return {'status': 'cancelled'}
        
        # Update case status
        case.status = 'processing'
        case.save(update_fields=['status'])
        
        # Try to find pending request
        request = AnalysisRequest.objects.filter(
            case=case, 
            status='queued'
        ).order_by('-requested_at').first()
        
        if request:
            request.status = 'processing'
            request.save(update_fields=['status'])
        
        # Build context from case metadata
        context_parts = [
            f"عنوان پرونده: {case.title}",
            f"دسته‌بندی: {case.get_category_display()}",
            f"توضیحات: {case.description or 'ندارد'}"
        ]
        
        # Update progress: extracting
        update_progress(task_id, str(case_id), 'extracting', 15, 'استخراج متن از مستندات...')
        
        # Extract content from all case files
        files = []
        for case_file in case.files.all():
            if case_file.file:
                files.append({
                    'path': case_file.file.path,
                    'filename': os.path.basename(case_file.file.name)
                })
        
        if files:
            extraction = ContentExtractor.extract_all(files)
            if extraction['summary']:
                context_parts.append(f"\n\n=== محتوای مستندات ===\n{extraction['summary']}")
            if extraction['errors']:
                logger.warning(f"Extraction errors: {extraction['errors']}")
            
            update_progress(
                task_id, str(case_id), 'extracting', 35, 
                f'استخراج {len(extraction["documents"])} سند و {len(extraction["transcripts"])} فایل صوتی',
                evidence_refs_processed=len(files)
            )
        
        # Check for cancellation
        if check_cancel_flag(task_id):
            update_progress(task_id, str(case_id), 'failed', 0, 'لغو شده توسط کاربر', error='cancelled')
            return {'status': 'cancelled'}
        
        # Update progress: transcribing (if audio files)
        if any(f.get('filename', '').endswith(('.mp3', '.m4a', '.wav', '.ogg')) for f in files):
            update_progress(task_id, str(case_id), 'transcribing', 50, 'رونویسی فایل‌های صوتی...')
        
        # Add triggering event context
        new_event = None
        if triggering_event_id:
            try:
                new_event = CaseEvent.objects.get(id=triggering_event_id)
                context_parts.append(f"\n\n=== رویداد جدید ===\nنوع: {new_event.get_event_type_display()}\nخلاصه: {new_event.summary}\nجزئیات: {new_event.details}")
                
                # Extract content from event attachments
                event_files = []
                for att in new_event.attachments.all():
                    if att.file:
                        event_files.append({
                            'path': att.file.path,
                            'filename': os.path.basename(att.file.name)
                        })
                if event_files:
                    event_extraction = ContentExtractor.extract_all(event_files)
                    if event_extraction['summary']:
                        context_parts.append(f"\n{event_extraction['summary']}")
                        
            except CaseEvent.DoesNotExist:
                logger.warning(f"Triggering event {triggering_event_id} not found")
        
        # Add existing events history
        events = case.events.exclude(id=triggering_event_id).order_by('timestamp') if triggering_event_id else case.events.all().order_by('timestamp')
        if events.exists():
            events_text = "\n".join([f"- [{e.timestamp.strftime('%Y-%m-%d')}] {e.summary}: {e.details}" for e in events[:10]])
            context_parts.append(f"\n\n=== تاریخچه رویدادها ===\n{events_text}")
        
        # Update progress: analyzing
        update_progress(task_id, str(case_id), 'analyzing', 65, 'تحلیل حقوقی در حال انجام...')
        
        full_context = "\n".join(context_parts)
        logger.info(f"Built context with {len(full_context)} characters for reanalysis")
        
        # Perform Analysis
        result_data = AIAnalysisService.analyze(full_context, case.category)
        
        # Update progress: packaging
        update_progress(task_id, str(case_id), 'packaging', 92, 'آماده‌سازی نتایج...')
        
        # Save Result with provenance
        last_analysis = case.analyses.order_by('-created_at').first()
        
        analysis = AnalysisResult.objects.create(
            case=case,
            result_json=result_data,
            source=result_data.get('source', 'experimental-mock'),
            version=(last_analysis.version + 1) if last_analysis else 1,
            derived_from_analysis=last_analysis,
            derived_from_event_id=str(triggering_event_id) if triggering_event_id else None,
            summary_text=result_data.get('comparison_rationale', '') or "تحلیل مجدد بر اساس اطلاعات جدید.",
            is_mock=(result_data.get('source') == 'experimental-mock')
        )
        
        # Update case status
        case.status = 'analyzed'
        case.save(update_fields=['status'])
        
        # Update request if exists
        if request:
            request.status = 'completed'
            request.completed_at = timezone.now()
            request.analysis = analysis
            request.save()
        
        # Update progress: complete
        update_progress(task_id, str(case_id), 'complete', 100, 'تحلیل کامل شد')
        
        # Notify User
        task_notify_user.delay(
            case.user.id, 
            f"تحلیل جدید برای پرونده «{case.title}» آماده است.", 
            "analysis_ready"
        )
        
        logger.info(f"Reanalysis completed for case {case_id}, version {analysis.version}")
        return {'status': 'success', 'analysis_id': analysis.id}
        
    except Case.DoesNotExist:
        logger.error(f"Case {case_id} not found")
        update_progress(task_id, str(case_id), 'failed', 0, 'پرونده یافت نشد', error='case_not_found')
        if request:
            request.status = 'failed'
            request.error_message = 'پرونده یافت نشد'
            request.save()
        return {'status': 'error', 'message': 'Case not found'}
        
    except Exception as e:
        logger.exception(f"Reanalysis failed: {e}")
        update_progress(task_id, str(case_id), 'failed', 0, f'خطا: {str(e)[:100]}', error=str(e))
        if request:
            request.status = 'failed'
            request.error_message = str(e)[:1000]
            request.save()
        return {'status': 'error', 'error': str(e)}
        
    finally:
        cache.delete(lock_id)
        clear_cancel_flag(task_id)


@shared_task
def task_notify_user(user_id, message, notification_type):
    """
    Sends notification to user.
    TODO: Integrate with email/push/Telegram
    """
    logger.info(f"NOTIFY USER {user_id}: {message} ({notification_type})")
    # In production: create Notification model, send email/push
    return {"status": "sent", "user": user_id}
