from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid

class Case(models.Model):
    STATUS_CHOICES = [
        ('open', _('Open')),
        ('processing', _('Processing')),
        ('analyzed', _('Analyzed')),
        ('closed', _('Closed')),
    ]

    CATEGORY_CHOICES = [
        ('civil', _('Civil')),
        ('criminal', _('Criminal')),
        ('family', _('Family')),
        ('administrative', _('Administrative')),
        ('other', _('Other')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cases')
    title = models.CharField(_('Title'), max_length=255)
    category = models.CharField(_('Category'), max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(_('Description'), blank=True, null=True)
    status = models.CharField(_('Status'), max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('Case')
        verbose_name_plural = _('Cases')
        ordering = ['-created_at']

def case_file_path(instance, filename):
    return f'cases/{instance.case.id}/{filename}'

class CaseFile(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(_('File'), upload_to=case_file_path)
    file_type = models.CharField(max_length=50, blank=True) # e.g. 'document', 'audio'
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.case.title} - {self.file.name}'


# --- Legacy Support for Migrations ---
def case_update_file_path(instance, filename):
    return f'cases/updates/legacy/{filename}'
# -------------------------------------


class CaseEvent(models.Model):
    """Represents a post-hearing update, new evidence, or event in a case."""
    EVENT_TYPES = [
        ('court_verdict', _('Court Verdict')),
        ('hearing_outcome', _('Hearing Outcome')),
        ('evidence_submitted', _('Evidence Submitted')),
        ('note', _('Note')),
        ('settlement', _('Settlement')),
        ('other', _('Other')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(_('Event Type'), max_length=50, choices=EVENT_TYPES)
    summary = models.CharField(_('Summary'), max_length=255)
    details = models.TextField(_('Details'), blank=True)
    timestamp = models.DateTimeField(_('Timestamp'), default=models.functions.Now)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='case_events')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Case Event')
        verbose_name_plural = _('Case Events')
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.case.title} - {self.summary}'


def case_event_file_path(instance, filename):
    return f'cases/{instance.event.case.id}/events/{instance.event.id}/{filename}'


class CaseEventAttachment(models.Model):
    """Attachments for a CaseEvent."""
    event = models.ForeignKey(CaseEvent, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(_('File'), upload_to=case_event_file_path)
    file_type = models.CharField(max_length=50, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.event.summary} - {self.file.name}'


class CaseDecision(models.Model):
    """Tracks user decisions on analysis options."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='decisions')
    analysis_id = models.CharField(max_length=100) # Reference to the AnalysisResult.id (or custom ID)
    option_id = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    selected_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Decision: {self.option_id} for Case {self.case.title}"

