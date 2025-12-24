from rest_framework import viewsets, permissions, status, parsers
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Case, CaseFile
from .serializers import CaseSerializer, CaseFileSerializer
from analysis.tasks import analyze_case_task

class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'], parser_classes=[parsers.MultiPartParser])
    def upload_file(self, request, pk=None):
        case = self.get_object()
        files = request.FILES.getlist('file')
        
        if not files:
            return Response({'error': 'No files provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        created_files = []
        for file_obj in files:
            # Determine basic file type
            file_type = 'document'
            if file_obj.content_type.startswith('audio/'):
                file_type = 'audio'
            elif file_obj.content_type.startswith('image/'):
                file_type = 'image'
            
            case_file = CaseFile.objects.create(case=case, file=file_obj, file_type=file_type)
            created_files.append(case_file)
        
        # Trigger analysis
        analyze_case_task.delay(case.id)
        
        return Response(CaseFileSerializer(created_files, many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        case = self.get_object()
        task = analyze_case_task.delay(case.id)
        return Response({'status': 'Analysis started', 'task_id': task.id})

    @action(detail=True, methods=['delete'], url_path='files/(?P<file_id>[^/.]+)')
    def delete_file(self, request, pk=None, file_id=None):
        case = self.get_object()
        try:
            file_obj = CaseFile.objects.get(id=file_id, case=case)
            file_obj.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CaseFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
