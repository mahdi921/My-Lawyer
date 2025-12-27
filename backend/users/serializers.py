from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('phone_number', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            password=validated_data['password']
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['phone_number'] = user.phone_number
        token['display_name'] = user.display_name or ''
        return token


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'id', 'phone_number', 'display_name', 'email', 
            'avatar', 'notification_preferences', 'date_joined'
        ]
        read_only_fields = ['id', 'phone_number', 'date_joined']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('رمز عبور فعلی اشتباه است.')
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'رمزهای عبور جدید مطابقت ندارند.'})
        validate_password(data['new_password'], self.context['request'].user)
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class AvatarUploadSerializer(serializers.ModelSerializer):
    """Serializer for avatar upload."""
    
    class Meta:
        model = User
        fields = ['avatar']

    def validate_avatar(self, value):
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError('فرمت تصویر پشتیبانی نمی‌شود. فقط JPEG، PNG، GIF، WebP مجاز است.')
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('حجم تصویر نباید بیشتر از ۵ مگابایت باشد.')
        return value
