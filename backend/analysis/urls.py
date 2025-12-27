from django.urls import path
from . import views

urlpatterns = [
    # Progress tracking
    path('tasks/<str:task_id>/status/', views.task_status, name='task-status'),
    path('tasks/<str:task_id>/sse/', views.task_sse, name='task-sse'),
    path('tasks/<str:task_id>/cancel/', views.task_cancel, name='task-cancel'),
    
    # Retry
    path('cases/<uuid:case_id>/analyses/<int:analysis_id>/retry/', views.retry_analysis, name='retry-analysis'),
]
