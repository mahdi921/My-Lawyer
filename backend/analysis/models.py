from django.db import models
from django.conf import settings
from cases.models import Case
from django.utils.translation import gettext_lazy as _
import uuid


class AnalysisResult(models.Model):
    """Stores the result of a legal analysis for a case."""
    SOURCE_CHOICES = [
        ('ai-engine', _('AI Engine')),
        ('experimental-mock', _('Experimental Mock')),
    ]

    # Keep default auto id for backwards compatibility with existing records
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='analyses')
    
    # JSON now strictly holds: options[], flowchart_json, provenance, comparison_rationale
    result_json = models.JSONField(_('Analysis Result JSON'))
    
    # Metadata extracted for indexing/querying
    summary_text = models.TextField(_('Summary Text'), blank=True)
    success_probability = models.IntegerField(_('Success Probability'), default=0)
    
    # V3 provenance fields
    derived_from_analysis = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='successors')
    derived_from_event_id = models.CharField(max_length=100, null=True, blank=True) # ID of CaseEvent
    
    version = models.PositiveIntegerField(_('Version'), default=1)
    source = models.CharField(_('Source'), max_length=20, choices=SOURCE_CHOICES, default='experimental-mock')
    schema_version = models.CharField(_('Schema Version'), max_length=10, default='3.0')
    is_mock = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Analysis Result')
        verbose_name_plural = _('Analysis Results')
        ordering = ['-created_at']

    def __str__(self):
        return f'Analysis v{self.version} for {self.case.title}'


class AnalysisRequest(models.Model):
    """Tracks reanalysis requests for a case."""
    STATUS_CHOICES = [
        ('queued', _('Queued')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    ]
    TRIGGER_CHOICES = [
        ('USER_MANUAL', _('User Manual')),
        ('SYSTEM_EVENT', _('System Event')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='analysis_requests')
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trigger_type = models.CharField(_('Trigger Type'), max_length=20, choices=TRIGGER_CHOICES)
    status = models.CharField(_('Status'), max_length=20, choices=STATUS_CHOICES, default='queued')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    analysis = models.ForeignKey(
        AnalysisResult, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='request'
    )
    error_message = models.TextField(blank=True)

    class Meta:
        verbose_name = _('Analysis Request')
        verbose_name_plural = _('Analysis Requests')
        ordering = ['-requested_at']

    def __str__(self):
        return f'Request {self.id} for {self.case.title} ({self.status})'
