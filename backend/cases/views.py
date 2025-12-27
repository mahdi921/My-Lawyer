from rest_framework import viewsets, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Case, CaseFile, CaseUpdate, CaseUpdateFile
from .serializers import (
    CaseSerializer, CaseDetailSerializer, CaseFileSerializer, 
    CaseUpdateSerializer, CaseUpdateCreateSerializer
)
from analysis.tasks import analyze_case_task
from analysis.models import AnalysisResult, AnalysisRequest
from analysis.serializers import AnalysisResultSerializer, AnalysisResultListSerializer


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(user=self.request.user).prefetch_related('analyses', 'files', 'updates')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CaseDetailSerializer
        return CaseSerializer

    @action(detail=True, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload_file(self, request, pk=None):
        """Upload one or more files to a case."""
        case = self.get_object()
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
            
            case_file = CaseFile.objects.create(case=case, file=file_obj, file_type=file_type)
            created_files.append(case_file)
        
        analyze_case_task.delay(str(case.id))
        
        return Response(CaseFileSerializer(created_files, many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Manually trigger analysis for a case."""
        case = self.get_object()
        task = analyze_case_task.delay(str(case.id))
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

    # =============== V2 Endpoints ===============

    @action(detail=True, methods=['get', 'post'], url_path='updates')
    def updates(self, request, pk=None):
        """Get all updates or create a new update for a case."""
        case = self.get_object()

        if request.method == 'GET':
            updates = case.updates.all()
            serializer = CaseUpdateSerializer(updates, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = CaseUpdateCreateSerializer(
                data=request.data,
                context={'request': request, 'case': case}
            )
            if serializer.is_valid():
                update = serializer.save()
                return Response(CaseUpdateSerializer(update).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='updates/(?P<update_id>[^/.]+)/upload')
    def upload_update_files(self, request, pk=None, update_id=None):
        """Upload files to a specific case update."""
        case = self.get_object()
        try:
            update = CaseUpdate.objects.get(id=update_id, case=case)
        except CaseUpdate.DoesNotExist:
            return Response({'error': 'Update not found'}, status=status.HTTP_404_NOT_FOUND)

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
            
            update_file = CaseUpdateFile.objects.create(update=update, file=file_obj, file_type=file_type)
            created_files.append(update_file)

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
        
        # Create analysis request record
        analysis_request = AnalysisRequest.objects.create(
            case=case,
            requested_by=request.user,
            trigger_type=request.data.get('trigger_type', 'USER_MANUAL'),
            status='queued'
        )
        
        # Trigger the analysis task
        task = analyze_case_task.delay(str(case.id))
        
        return Response({
            'status': 'Reanalysis queued',
            'request_id': str(analysis_request.id),
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)
