from rest_framework import serializers
from .models import AnalysisResult

class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = ['id', 'result_json', 'summary_text', 'success_probability', 'is_mock', 'created_at']
