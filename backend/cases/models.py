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


def case_update_file_path(instance, filename):
    return f'cases/{instance.update.case.id}/updates/{instance.update.id}/{filename}'


class CaseUpdate(models.Model):
    """Represents a post-hearing update, new evidence, or event in a case."""
    UPDATE_TYPE_CHOICES = [
        ('DOCUMENT', _('Document')),
        ('AUDIO', _('Audio Recording')),
        ('EVENT_NOTE', _('Event Note')),
        ('COURT_RULING', _('Court Ruling')),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    update_type = models.CharField(_('Update Type'), max_length=20, choices=UPDATE_TYPE_CHOICES)
    title = models.CharField(_('Title'), max_length=255)
    description = models.TextField(_('Description'), blank=True)
    effective_date = models.DateField(_('Effective Date'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Case Update')
        verbose_name_plural = _('Case Updates')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.case.title} - {self.title}'


class CaseUpdateFile(models.Model):
    """Files attached to a CaseUpdate."""
    update = models.ForeignKey(CaseUpdate, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(_('File'), upload_to=case_update_file_path)
    file_type = models.CharField(max_length=50, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.update.title} - {self.file.name}'

