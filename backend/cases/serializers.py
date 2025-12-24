from rest_framework import serializers
from .models import Case, CaseFile
from analysis.serializers import AnalysisResultSerializer

class CaseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseFile
        fields = ['id', 'file', 'file_type', 'uploaded_at']

class CaseSerializer(serializers.ModelSerializer):
    files = CaseFileSerializer(many=True, read_only=True)
    analysis = AnalysisResultSerializer(read_only=True)

    class Meta:
        model = Case
        fields = ['id', 'title', 'category', 'description', 'status', 'created_at', 'files', 'analysis']
        read_only_fields = ['status', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return Case.objects.create(user=user, **validated_data)
