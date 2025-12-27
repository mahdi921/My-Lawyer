from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError(_('The Phone Number must be set'))
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone_number, password, **extra_fields)

class User(AbstractUser):
    username = None
    phone_number = models.CharField(
        _('phone number'),
        max_length=11,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^09\d{9}$',
                message=_('Phone number must be in the format 09xxxxxxxxx')
            )
        ]
    )
    
    # Profile fields (V2)
    display_name = models.CharField(_('Display Name'), max_length=100, blank=True)
    avatar = models.ImageField(_('Avatar'), upload_to='avatars/', null=True, blank=True)
    notification_preferences = models.JSONField(
        _('Notification Preferences'),
        default=dict,
        blank=True,
        help_text='{"email": true, "telegram": false}'
    )
    
    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()

    def __str__(self):
        return self.display_name or self.phone_number
