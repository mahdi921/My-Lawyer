import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../api';
import { FilePlus, Save, AlertCircle } from 'lucide-react';

export default function CaseEventForm({ onSuccess }) {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        event_type: 'hearing_outcome',
        summary: '',
        details: '',
        trigger_reanalysis: true
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createEventMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post(`/cases/${id}/events/`, data);
            return res.data; // returns event object
        },
        onError: (err) => setError(err.response?.data?.detail || 'خطا در ثبت رویداد'),
    });

    const uploadFileMutation = useMutation({
        mutationFn: async ({ eventId, file }) => {
            const fd = new FormData();
            fd.append('file', file);
            await api.post(`/cases/${id}/events/${eventId}/upload/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create Event
            const event = await createEventMutation.mutateAsync(formData);

            // 2. Upload Files (if any)
            if (files.length > 0) {
                await Promise.all(
                    Array.from(files).map(file =>
                        uploadFileMutation.mutateAsync({ eventId: event.id, file })
                    )
                );
            }

            // 3. Reset & Notify
            setFormData({ event_type: 'hearing_outcome', summary: '', details: '', trigger_reanalysis: true });
            setFiles([]);
            queryClient.invalidateQueries(['case', id]);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-emerald-600" />
                ثبت رویداد جدید
            </h3>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع رویداد</label>
                        <select
                            className="w-full p-2 border rounded-lg"
                            value={formData.event_type}
                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                        >
                            <option value="hearing_outcome">نتیجه جلسه رسیدگی</option>
                            <option value="court_verdict">رأی دادگاه</option>
                            <option value="evidence_submitted">ارائه مدارک جدید</option>
                            <option value="settlement">توافق/سازش</option>
                            <option value="note">یادداشت شخصی</option>
                            <option value="other">سایر</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">عنوان کوتاه</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            required
                            placeholder="مثلاً: صدور قرار کارشناسی..."
                            value={formData.summary}
                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">شرح جزئیات</label>
                    <textarea
                        className="w-full p-2 border rounded-lg h-24"
                        placeholder="متن رأی، توافقات جلسه یا توضیحات تکمیلی..."
                        value={formData.details}
                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">پیوست فایل</label>
                    <input
                        type="file"
                        multiple
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        onChange={(e) => setFiles(e.target.files)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="reanalyze"
                        checked={formData.trigger_reanalysis}
                        onChange={(e) => setFormData({ ...formData, trigger_reanalysis: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="reanalyze" className="text-sm font-medium text-gray-700">
                        درخواست تحلیل مجدد پرونده پس از ثبت (پیشنهادی)
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? 'درحال ثبت...' : (
                        <>
                            <Save className="h-4 w-4" />
                            ثبت رویداد
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
