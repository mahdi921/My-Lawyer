import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react';

const PHASE_LABELS = {
    queued: 'در صف انتظار',
    validating: 'اعتبارسنجی فایل‌ها',
    extracting: 'استخراج متن',
    transcribing: 'رونویسی صوت',
    analyzing: 'تحلیل حقوقی',
    packaging: 'آماده‌سازی',
    complete: 'تکمیل شد',
    failed: 'خطا',
    unknown: 'نامشخص'
};

export default function AnalysisProgress({ taskId, onComplete, onCancel }) {
    const [progress, setProgress] = useState({
        percentage: 0,
        phase: 'queued',
        message: 'در حال شروع...',
        state: 'running'
    });
    const [error, setError] = useState(null);
    const [connectionType, setConnectionType] = useState('polling');

    const handleProgressUpdate = useCallback((data) => {
        setProgress({
            percentage: data.percentage || 0,
            phase: data.phase || 'unknown',
            message: data.message || '',
            state: data.phase === 'complete' ? 'success' :
                data.phase === 'failed' ? 'failed' : 'running',
            analysisId: data.analysis_id
        });

        if (data.phase === 'complete' && onComplete) {
            onComplete(data.analysis_id);
        }

        if (data.error) {
            setError(data.error);
        }
    }, [onComplete]);

    // Try SSE first, fallback to polling
    useEffect(() => {
        if (!taskId) return;

        let eventSource = null;
        let pollingInterval = null;

        const startSSE = () => {
            try {
                eventSource = new EventSource(`/api/tasks/${taskId}/sse/`);
                setConnectionType('sse');

                eventSource.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        handleProgressUpdate(data);
                    } catch (err) {
                        console.error('SSE parse error:', err);
                    }
                };

                eventSource.onerror = () => {
                    console.warn('SSE connection failed, falling back to polling');
                    eventSource.close();
                    startPolling();
                };

            } catch (err) {
                console.warn('SSE not available, using polling');
                startPolling();
            }
        };

        const startPolling = () => {
            setConnectionType('polling');

            const poll = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const res = await fetch(`/api/tasks/${taskId}/status/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    handleProgressUpdate(data);

                    if (data.state === 'success' || data.state === 'failed') {
                        clearInterval(pollingInterval);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            };

            poll();
            pollingInterval = setInterval(poll, 3000);
        };

        startSSE();

        return () => {
            if (eventSource) eventSource.close();
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [taskId, handleProgressUpdate]);

    const handleCancel = async () => {
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`/api/tasks/${taskId}/cancel/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (onCancel) onCancel();
        } catch (err) {
            console.error('Cancel error:', err);
        }
    };

    const isComplete = progress.state === 'success';
    const isFailed = progress.state === 'failed';
    const isRunning = progress.state === 'running';

    return (
        <div
            className="bg-white rounded-xl shadow-lg border p-6"
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="پیشرفت تحلیل"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {isRunning && <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />}
                    {isComplete && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                    {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
                    تحلیل پرونده
                </h3>

                {isRunning && (
                    <button
                        onClick={handleCancel}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="لغو تحلیل"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                    className={`absolute inset-y-0 right-0 transition-all duration-500 rounded-full ${isFailed ? 'bg-red-500' :
                            isComplete ? 'bg-emerald-500' :
                                'bg-gradient-to-l from-emerald-400 to-emerald-600'
                        }`}
                    style={{ width: `${progress.percentage}%` }}
                />
                {isRunning && (
                    <div className="absolute inset-0 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
                )}
            </div>

            {/* Percentage & Phase */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-slate-700">
                    {progress.percentage}%
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${isFailed ? 'bg-red-100 text-red-700' :
                        isComplete ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                    }`}>
                    {PHASE_LABELS[progress.phase] || progress.phase}
                </span>
            </div>

            {/* Message */}
            <p className="text-slate-600 text-sm">
                {progress.message}
            </p>

            {/* Error */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Connection Type (debug) */}
            <div className="mt-4 text-xs text-slate-400 text-left">
                اتصال: {connectionType === 'sse' ? 'SSE' : 'Polling'}
            </div>
        </div>
    );
}
