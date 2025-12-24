from django.db import models
from cases.models import Case
from django.utils.translation import gettext_lazy as _

class AnalysisResult(models.Model):
    case = models.OneToOneField(Case, on_delete=models.CASCADE, related_name='analysis')
    # We store the structured graph/paths in JSON format to be flexible for the frontend
    result_json = models.JSONField(_('Analysis Result JSON')) 
    summary_text = models.TextField(_('Summary Text'), blank=True)
    success_probability = models.IntegerField(_('Success Probability'), default=0)
    is_mock = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Analysis for {self.case.title}'
