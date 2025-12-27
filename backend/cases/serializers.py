from rest_framework import serializers
from .models import Case, CaseFile, CaseEvent, CaseEventAttachment, CaseDecision
from analysis.serializers import AnalysisResultSerializer


class CaseFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseFile
        fields = ['id', 'file', 'file_type', 'uploaded_at']


class CaseEventAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseEventAttachment
        fields = ['id', 'file', 'file_type', 'uploaded_at']


class CaseEventSerializer(serializers.ModelSerializer):
    attachments = CaseEventAttachmentSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CaseEvent
        fields = [
            'id', 'event_type', 'summary', 'details', 
            'timestamp', 'created_at', 'created_by_name', 'attachments'
        ]
        read_only_fields = ['id', 'created_at']

    def get_created_by_name(self, obj):
        return obj.created_by.display_name or obj.created_by.phone_number


class CaseEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating CaseEvents with optional reanalysis trigger."""
    trigger_reanalysis = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = CaseEvent
        fields = ['event_type', 'summary', 'details', 'timestamp', 'trigger_reanalysis']

    def create(self, validated_data):
        trigger_reanalysis = validated_data.pop('trigger_reanalysis', False)
        case = self.context['case']
        user = self.context['request'].user
        
        event = CaseEvent.objects.create(
            case=case,
            created_by=user,
            **validated_data
        )
        
        # Handle reanalysis trigger if requested
        if trigger_reanalysis:
            from analysis.tasks import task_reanalyze_case
            task_reanalyze_case.delay(str(case.id), triggering_event_id=str(event.id))
        
        return event


class CaseDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseDecision
        fields = ['id', 'analysis_id', 'option_id', 'notes', 'selected_at']
        read_only_fields = ['id', 'selected_at']


class CaseSerializer(serializers.ModelSerializer):
    files = CaseFileSerializer(many=True, read_only=True)
    analysis = serializers.SerializerMethodField()
    events_count = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'category', 'description', 'status', 
            'created_at', 'updated_at', 'files', 'analysis', 'events_count'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

    def get_analysis(self, obj):
        latest = obj.analyses.first()
        if latest:
            return AnalysisResultSerializer(latest).data
        return None

    def get_events_count(self, obj):
        return obj.events.count()

    def create(self, validated_data):
        user = self.context['request'].user
        return Case.objects.create(user=user, **validated_data)


class CaseDetailSerializer(CaseSerializer):
    analyses = AnalysisResultSerializer(many=True, read_only=True)
    events = CaseEventSerializer(many=True, read_only=True)
    decisions = CaseDecisionSerializer(many=True, read_only=True)

    class Meta(CaseSerializer.Meta):
        fields = CaseSerializer.Meta.fields + ['analyses', 'events', 'decisions']
