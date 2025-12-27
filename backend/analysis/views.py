"""
Analysis views including progress tracking endpoints.
"""
import json
import time
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.http import require_GET
from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .progress import get_progress, set_cancel_flag, PHASES
from .models import AnalysisResult, AnalysisRequest
from cases.models import Case


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_status(request, task_id):
    """
    Polling endpoint for task progress.
    
    GET /api/tasks/{task_id}/status
    
    Returns:
        {
            "task_id": "...",
            "phase": "extracting",
            "percentage": 25,
            "message": "استخراج متن از مستندات...",
            "state": "running|success|failed",
            "analysis_id": null | id
        }
    """
    progress = get_progress(task_id)
    
    # Determine state
    phase = progress.get('phase', 'unknown')
    if phase == 'complete':
        state = 'success'
    elif phase == 'failed':
        state = 'failed'
    elif phase == 'unknown':
        state = 'unknown'
    else:
        state = 'running'
    
    # Get analysis ID if complete
    analysis_id = None
    if state == 'success':
        case_id = progress.get('case_id')
        if case_id:
            try:
                case = Case.objects.get(id=case_id)
                latest = case.analyses.order_by('-created_at').first()
                if latest:
                    analysis_id = latest.id
            except Case.DoesNotExist:
                pass
    
    return Response({
        'task_id': task_id,
        'case_id': progress.get('case_id'),
        'phase': phase,
        'percentage': progress.get('percentage', 0),
        'message': progress.get('message', ''),
        'state': state,
        'analysis_id': analysis_id,
        'timestamp': progress.get('timestamp'),
        'error': progress.get('error'),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def task_sse(request, task_id):
    """
    Server-Sent Events endpoint for real-time progress updates.
    
    GET /api/tasks/{task_id}/sse
    
    Client usage:
        const evtSource = new EventSource('/api/tasks/xxx/sse');
        evtSource.onmessage = (e) => { ... };
    """
    def event_stream():
        import redis
        from django.conf import settings
        
        redis_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/0')
        r = redis.from_url(redis_url)
        pubsub = r.pubsub()
        
        channel = f"task_updates_{task_id}"
        pubsub.subscribe(channel)
        
        # Send initial state
        initial = get_progress(task_id)
        yield f"data: {json.dumps(initial)}\n\n"
        
        # Listen for updates (timeout after 5 minutes)
        start_time = time.time()
        timeout = 300  # 5 minutes
        
        try:
            while time.time() - start_time < timeout:
                message = pubsub.get_message(timeout=1.0)
                if message and message['type'] == 'message':
                    data = message['data']
                    if isinstance(data, bytes):
                        data = data.decode('utf-8')
                    yield f"data: {data}\n\n"
                    
                    # Check if complete
                    try:
                        parsed = json.loads(data)
                        if parsed.get('phase') in ('complete', 'failed'):
                            break
                    except:
                        pass
        finally:
            pubsub.unsubscribe(channel)
            pubsub.close()
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type='text/event-stream'
    )
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def task_cancel(request, task_id):
    """
    Cancel a running analysis task.
    
    POST /api/tasks/{task_id}/cancel
    """
    # Verify user owns the task's case
    progress = get_progress(task_id)
    case_id = progress.get('case_id')
    
    if case_id:
        try:
            case = Case.objects.get(id=case_id)
            if case.user != request.user:
                return Response(
                    {'error': 'شما اجازه لغو این تحلیل را ندارید'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Case.DoesNotExist:
            pass
    
    set_cancel_flag(task_id)
    
    return Response({
        'status': 'cancelled',
        'task_id': task_id,
        'message': 'درخواست لغو ارسال شد'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retry_analysis(request, case_id, analysis_id):
    """
    Retry a failed analysis.
    
    POST /api/cases/{case_id}/analyses/{analysis_id}/retry
    """
    try:
        case = Case.objects.get(id=case_id)
        if case.user != request.user:
            return Response(
                {'error': 'دسترسی غیرمجاز'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Queue new analysis
        from .tasks import task_reanalyze_case
        task = task_reanalyze_case.delay(str(case_id))
        
        return Response({
            'status': 'queued',
            'task_id': task.id,
            'message': 'تحلیل مجدد در صف قرار گرفت'
        })
        
    except Case.DoesNotExist:
        return Response(
            {'error': 'پرونده یافت نشد'},
            status=status.HTTP_404_NOT_FOUND
        )
