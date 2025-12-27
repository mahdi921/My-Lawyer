from rest_framework import viewsets, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Case, CaseFile, CaseEvent, CaseEventAttachment, CaseDecision
from .serializers import (
    CaseSerializer, CaseDetailSerializer, CaseFileSerializer, 
    CaseEventSerializer, CaseEventCreateSerializer, CaseDecisionSerializer
)
from analysis.tasks import analyze_case_task, task_reanalyze_case
from analysis.models import AnalysisResult, AnalysisRequest
from analysis.serializers import AnalysisResultSerializer, AnalysisResultListSerializer


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(user=self.request.user).prefetch_related('analyses', 'files', 'events', 'decisions')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaseDetailSerializer
        return CaseSerializer

    @action(detail=True, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload_file(self, request, pk=None):
        """
        Upload one or more files to a case.
        
        Query params:
            auto_submit: bool (default True) - Automatically queue for analysis after upload
        """
        case = self.get_object()
        files = request.FILES.getlist('file')
        
        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check auto_submit parameter (default: True)
        auto_submit = request.query_params.get('auto_submit', 'true').lower() != 'false'
        
        created_files = []
        for file_obj in files:
            file_type = 'document'
            if file_obj.content_type.startswith('audio/'):
                file_type = 'audio'
            elif file_obj.content_type.startswith('image/'):
                file_type = 'image'
            
            case_file = CaseFile.objects.create(case=case, file=file_obj, file_type=file_type)
            created_files.append(case_file)
        
        response_data = {
            'files': CaseFileSerializer(created_files, many=True).data,
            'auto_submitted': auto_submit
        }
        
        if auto_submit:
            # Queue for analysis immediately
            task = task_reanalyze_case.delay(str(case.id))
            response_data['task_id'] = task.id
            response_data['message'] = 'فایل‌ها آپلود و تحلیل آغاز شد'
            case.status = 'processing'
            case.save(update_fields=['status'])
        else:
            response_data['message'] = 'فایل‌ها آپلود شدند. می‌توانید بعداً تحلیل را شروع کنید.'
            case.status = 'open'  
            case.save(update_fields=['status'])
        
        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Manually trigger analysis for a case."""
        case = self.get_object()
        task = task_reanalyze_case.delay(str(case.id))
        return Response({'status': 'Analysis started', 'task_id': task.id})

    @action(detail=True, methods=['delete'], url_path='files/(?P<file_id>[^/.]+)')
    def delete_file(self, request, pk=None, file_id=None):
        """Delete a specific file from a case."""
        case = self.get_object()
        try:
            file_obj = CaseFile.objects.get(id=file_id, case=case)
            file_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CaseFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

    # =============== V3 Endpoints ===============

    @action(detail=True, methods=['get', 'post'], url_path='events')
    def events(self, request, pk=None):
        """Get all events or create a new event for a case."""
        case = self.get_object()

        if request.method == 'GET':
            events = case.events.all()
            serializer = CaseEventSerializer(events, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CaseEventCreateSerializer(
                data=request.data,
                context={'request': request, 'case': case}
            )
            if serializer.is_valid():
                event = serializer.save()
                return Response(CaseEventSerializer(event).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='events/(?P<event_id>[^/.]+)/upload')
    def upload_event_files(self, request, pk=None, event_id=None):
        """Upload files to a specific case event."""
        case = self.get_object()
        try:
            event = CaseEvent.objects.get(id=event_id, case=case)
        except CaseEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist('file')
        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)

        created_files = []
        for file_obj in files:
            file_type = 'document'
            if file_obj.content_type.startswith('audio/'):
                file_type = 'audio'
            elif file_obj.content_type.startswith('image/'):
                file_type = 'image'
            
            event_file = CaseEventAttachment.objects.create(event=event, file=file_obj, file_type=file_type)
            created_files.append(event_file)

        return Response({'uploaded': len(created_files)}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='analyses')
    def analyses(self, request, pk=None):
        """List all analyses for a case."""
        case = self.get_object()
        analyses = case.analyses.all()
        serializer = AnalysisResultListSerializer(analyses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='analyses/(?P<analysis_id>[^/.]+)')
    def analysis_detail(self, request, pk=None, analysis_id=None):
        """Get detailed analysis result."""
        case = self.get_object()
        try:
            analysis = AnalysisResult.objects.get(id=analysis_id, case=case)
        except AnalysisResult.DoesNotExist:
            return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = AnalysisResultSerializer(analysis)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='reanalyze')
    def reanalyze(self, request, pk=None):
        """Trigger a reanalysis for the case."""
        case = self.get_object()
        
        analysis_request = AnalysisRequest.objects.create(
            case=case,
            requested_by=request.user,
            trigger_type=request.data.get('trigger_type', 'USER_MANUAL'),
            status='queued'
        )
        
        task = task_reanalyze_case.delay(str(case.id), mode=request.data.get('mode', 'experimental'))
        
        return Response({
            'status': 'Reanalysis queued',
            'request_id': str(analysis_request.id),
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'], url_path='analyses/(?P<analysis_id>[^/.]+)/choose')
    def choose_option(self, request, pk=None, analysis_id=None):
        """User chooses an option from the analysis."""
        case = self.get_object()
        option_id = request.data.get('option_id')
        notes = request.data.get('notes', '')

        if not option_id:
            return Response({'error': 'option_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        decision = CaseDecision.objects.create(
            case=case,
            user=request.user,
            analysis_id=analysis_id,
            option_id=option_id,
            notes=notes
        )
        return Response(CaseDecisionSerializer(decision).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='analyses/(?P<analysis_id>[^/.]+)/export')
    def export_analysis(self, request, pk=None, analysis_id=None):
        """Export analysis to PDF (Placeholder)."""
        # Logic to generate PDF would go here
        # Return dummy URL for now
        return Response({'download_url': f'/media/exports/analysis_{analysis_id}.pdf'}, status=status.HTTP_200_OK)
