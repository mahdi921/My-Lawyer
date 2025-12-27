from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid

class AuditLog(models.Model):
    """Tracks critical user actions."""
    ACTION_TYPES = [
        ('create_case', 'Create Case'),
        ('update_case', 'Update Case'),
        ('create_event', 'Create Event'),
        ('request_analysis', 'Request Analysis'),
        ('view_analysis', 'View Analysis'),
        ('select_option', 'Select Option'),
        ('export_pdf', 'Export PDF'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Optional link to specific objects (generic or specific)
    case_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.timestamp}"
