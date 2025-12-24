from celery import shared_task
from cases.models import Case
from .models import AnalysisResult
from .services import MockAnalysisService
import time

@shared_task
def analyze_case_task(case_id):
    try:
        case = Case.objects.get(id=case_id)
        case.status = 'processing'
        case.save()
        
        # Simulate processing time
        time.sleep(5)
        
        # Extract Text (TODO: Implement OCR here using Tesseract)
        text_content = case.description or "No description"
        
        # Run Analysis
        result = MockAnalysisService.analyze(text_content, case.category)
        
        # Save Result
        AnalysisResult.objects.update_or_create(
            case=case,
            defaults={
                'result_json': result,
                'summary_text': result.get('summary', ''),
                'success_probability': result.get('paths')[0]['probability'], # Approximation
                'is_mock': True
            }
        )
        
        case.status = 'analyzed'
        case.save()
        return f"Analysis complete for case {case_id}"
    except Case.DoesNotExist:
        return "Case not found"
    except Exception as e:
        if 'case' in locals():
            case.status = 'open' # Revert on failure
            case.save()
        return f"Error: {str(e)}"
