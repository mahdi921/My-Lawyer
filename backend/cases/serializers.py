from rest_framework import serializers
from .models import Case, CaseFile, CaseUpdate, CaseUpdateFile
from analysis.serializers import AnalysisResultSerializer


class CaseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseFile
        fields = ['id', 'file', 'file_type', 'uploaded_at']


class CaseUpdateFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseUpdateFile
        fields = ['id', 'file', 'file_type', 'uploaded_at']


class CaseUpdateSerializer(serializers.ModelSerializer):
    files = CaseUpdateFileSerializer(many=True, read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = CaseUpdate
        fields = [
            'id', 'update_type', 'title', 'description', 
            'effective_date', 'created_at', 'author_name', 'files'
        ]
        read_only_fields = ['id', 'created_at']

    def get_author_name(self, obj):
        return obj.author.display_name or obj.author.phone_number


class CaseUpdateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating CaseUpdates with optional reanalysis trigger."""
    trigger_reanalysis = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = CaseUpdate
        fields = ['update_type', 'title', 'description', 'effective_date', 'trigger_reanalysis']

    def create(self, validated_data):
        trigger_reanalysis = validated_data.pop('trigger_reanalysis', False)
        case = self.context['case']
        user = self.context['request'].user
        
        update = CaseUpdate.objects.create(
            case=case,
            author=user,
            **validated_data
        )
        
        # Handle reanalysis trigger if requested
        if trigger_reanalysis:
            from analysis.tasks import analyze_case_task
            analyze_case_task.delay(str(case.id))
        
        return update


class CaseSerializer(serializers.ModelSerializer):
    files = CaseFileSerializer(many=True, read_only=True)
    # Use the latest analysis for backward compatibility
    analysis = serializers.SerializerMethodField()
    updates_count = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'category', 'description', 'status', 
            'created_at', 'updated_at', 'files', 'analysis', 'updates_count'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def get_analysis(self, obj):
        # Return the latest analysis
        latest = obj.analyses.first()
        if latest:
            return AnalysisResultSerializer(latest).data
        return None

    def get_updates_count(self, obj):
        return obj.updates.count()

    def create(self, validated_data):
        user = self.context['request'].user
        return Case.objects.create(user=user, **validated_data)


class CaseDetailSerializer(CaseSerializer):
    """Extended serializer for case detail view with all analyses and updates."""
    analyses = AnalysisResultSerializer(many=True, read_only=True)
    updates = CaseUpdateSerializer(many=True, read_only=True)

    class Meta(CaseSerializer.Meta):
        fields = CaseSerializer.Meta.fields + ['analyses', 'updates']
