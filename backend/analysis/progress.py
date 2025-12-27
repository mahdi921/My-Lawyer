"""
Progress tracking for analysis tasks.

Provides:
- Redis-backed progress storage
- Pub/sub for real-time updates
- Phase-based progress tracking
"""
import json
import logging
from datetime import datetime
from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

# Progress phases with percentage ranges
PHASES = {
    'queued': (0, 2),
    'validating': (3, 10),
    'extracting': (10, 40),
    'transcribing': (40, 60),
    'analyzing': (60, 90),
    'packaging': (90, 98),
    'complete': (100, 100),
    'failed': (0, 0),
}

PHASE_MESSAGES = {
    'queued': 'در صف انتظار...',
    'validating': 'اعتبارسنجی فایل‌ها...',
    'extracting': 'استخراج متن از مستندات...',
    'transcribing': 'رونویسی فایل‌های صوتی...',
    'analyzing': 'تحلیل حقوقی در حال انجام...',
    'packaging': 'آماده‌سازی نتایج...',
    'complete': 'تحلیل کامل شد',
    'failed': 'خطا در تحلیل',
}


def get_progress_key(task_id: str) -> str:
    """Get Redis key for task progress."""
    return f"task_progress:{task_id}"


def get_channel_name(task_id: str) -> str:
    """Get channel name for WebSocket updates."""
    return f"task_updates_{task_id}"


def update_progress(
    task_id: str,
    case_id: str,
    phase: str,
    percentage: int = None,
    message: str = None,
    subtask_id: str = None,
    evidence_refs_processed: int = 0,
    error: str = None
):
    """
    Update task progress in Redis and publish to channel.
    
    Args:
        task_id: Celery task ID
        case_id: Case UUID
        phase: One of PHASES keys
        percentage: Override percentage (otherwise calculated from phase)
        message: Custom message (otherwise use default for phase)
        subtask_id: ID of current subtask
        evidence_refs_processed: Number of files processed
        error: Error message if failed
    """
    # Calculate percentage from phase if not provided
    if percentage is None:
        phase_range = PHASES.get(phase, (0, 0))
        percentage = phase_range[0]
    
    # Use default message if not provided
    if message is None:
        message = PHASE_MESSAGES.get(phase, '')
    
    progress_data = {
        'task_id': task_id,
        'case_id': str(case_id),
        'phase': phase,
        'percentage': percentage,
        'message': message,
        'subtask_id': subtask_id,
        'evidence_refs_processed': evidence_refs_processed,
        'timestamp': datetime.now().isoformat(),
        'error': error,
    }
    
    # Store in Redis cache (5 minute TTL)
    cache_key = get_progress_key(task_id)
    cache.set(cache_key, json.dumps(progress_data), timeout=300)
    
    # Publish to Redis pub/sub for WebSocket consumers
    try:
        import redis
        redis_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/0')
        r = redis.from_url(redis_url)
        channel = get_channel_name(task_id)
        r.publish(channel, json.dumps(progress_data))
        logger.debug(f"Published progress to {channel}: {phase} {percentage}%")
    except Exception as e:
        logger.warning(f"Failed to publish progress: {e}")
    
    return progress_data


def get_progress(task_id: str) -> dict:
    """Get current progress for a task."""
    cache_key = get_progress_key(task_id)
    data = cache.get(cache_key)
    
    if data:
        return json.loads(data)
    
    return {
        'task_id': task_id,
        'phase': 'unknown',
        'percentage': 0,
        'message': 'وضعیت نامشخص',
        'timestamp': datetime.now().isoformat(),
    }


def set_cancel_flag(task_id: str) -> bool:
    """Set cancel flag for a task."""
    cache_key = f"task_cancel:{task_id}"
    cache.set(cache_key, "true", timeout=600)
    return True


def check_cancel_flag(task_id: str) -> bool:
    """Check if task should be cancelled."""
    cache_key = f"task_cancel:{task_id}"
    return cache.get(cache_key) == "true"


def clear_cancel_flag(task_id: str):
    """Clear cancel flag after task completion."""
    cache_key = f"task_cancel:{task_id}"
    cache.delete(cache_key)
