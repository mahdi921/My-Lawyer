from celery import shared_task
from cases.models import Case
from .models import AnalysisResult
from .services import AIAnalysisService
import time

@shared_task
def analyze_case_task(case_id):
    try:
        case = Case.objects.get(id=case_id)
        
        # Simulate processing time (optional, remove later if API call is slow enough)
        case.status = 'processing'
        case.save()
        
        # Combine title and description for analysis
        case_text = f"{case.title}\n\n{case.description}"
        
        # Perform Analysis
        result_data = AIAnalysisService.analyze(case_text, case.category)
        
        # Extract success probability from recommended path
        recommended_path_id = result_data.get('recommended_path', 'path_1')
        paths = result_data.get('paths', [])
        success_prob = 0
        for path in paths:
            if path.get('id') == recommended_path_id:
                success_prob = path.get('probability', 0)
                break
        # Fallback: use first path probability if recommended not found
        if success_prob == 0 and paths:
            success_prob = paths[0].get('probability', 0)

        # Save Result
        AnalysisResult.objects.create(
            case=case,
            result_json=result_data,
            summary_text=result_data.get('summary', ''),
            success_probability=success_prob,
            is_mock=False
        )
        
        case.status = 'analyzed'
        case.save()
        
        return f"Case {case_id} analyzed successfully"
    except Case.DoesNotExist:
        return f"Case {case_id} not found"
    except Exception as e:
        if 'case' in locals():
            case.status = 'open' # Revert on failure
            case.save()
        return f"Error: {str(e)}"
