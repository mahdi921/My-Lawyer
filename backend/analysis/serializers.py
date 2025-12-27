from rest_framework import serializers
from .models import AnalysisResult, AnalysisRequest


class AnalysisResultSerializer(serializers.ModelSerializer):
    """Serializer for analysis results with full detail."""
    
    class Meta:
        model = AnalysisResult
        fields = [
            'id', 'result_json', 'summary_text', 'success_probability',
            'version', 'source', 'schema_version', 'is_mock', 'created_at'
        ]


class AnalysisResultListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing analyses."""
    
    class Meta:
        model = AnalysisResult
        fields = ['id', 'summary_text', 'success_probability', 'source', 'version', 'created_at']


class AnalysisRequestSerializer(serializers.ModelSerializer):
    """Serializer for analysis requests."""
    requested_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AnalysisRequest
        fields = [
            'id', 'trigger_type', 'status', 'requested_at', 
            'completed_at', 'analysis', 'error_message', 'requested_by_name'
        ]

    def get_requested_by_name(self, obj):
        return obj.requested_by.display_name or obj.requested_by.phone_number


class ReanalysisRequestSerializer(serializers.Serializer):
    """Serializer for triggering reanalysis."""
    trigger_type = serializers.ChoiceField(
        choices=['USER_MANUAL', 'SYSTEM_EVENT'],
        default='USER_MANUAL'
    )
