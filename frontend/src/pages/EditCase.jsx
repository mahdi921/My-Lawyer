import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Upload, FileText, ArrowLeft, Trash2, Save } from 'lucide-react';

export default function EditCase() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ title: '', category: 'other', description: '' });
    const [newFiles, setNewFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { data: caseData, isLoading } = useQuery({
        queryKey: ['case', id],
        queryFn: async () => {
            const res = await api.get(`/cases/${id}/`);
            return res.data;
        }
    });

    useEffect(() => {
        if (caseData) {
            setFormData({
                title: caseData.title,
                category: caseData.category,
                description: caseData.description || ''
            });
        }
    }, [caseData]);

    const updateCaseMutation = useMutation({
        mutationFn: (data) => api.patch(`/cases/${id}/`, data),
        onSuccess: () => {
            alert('تغییرات با موفقیت ذخیره شد.');
        }
    });

    const handleUpdateDetails = (e) => {
        e.preventDefault();
        updateCaseMutation.mutate(formData);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewFile = (index) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const deleteExistingFile = async (fileId) => {
        if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;
        try {
            await api.delete(`/cases/${id}/files/${fileId}/`);
            queryClient.invalidateQueries(['case', id]);
        } catch (err) {
            alert('خطا در حذف فایل');
        }
    };

    const handleUpload = async () => {
        if (newFiles.length === 0) return;
        setUploading(true);
        const data = new FormData();
        newFiles.forEach(file => {
            data.append('file', file);
        });

        try {
            await api.post(`/cases/${id}/upload_file/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewFiles([]);
            queryClient.invalidateQueries(['case', id]);
            alert('فایل‌ها با موفقیت آپلود شدند');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                alert(`خطا: ${err.response.data.error}`);
            } else if (err.response && err.status === 413) {
                alert('حجم فایل‌ها بیش از حد مجاز است.');
            } else {
                alert('خطا در آپلود فایل‌ها');
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitForAnalysis = async () => {
        try {
            // Simply creating/updating files triggers analysis in current backend logic (upload_file calls task).
            // But if user just changed text description?
            // We should probably explicitly call analyze endpoint if exists, OR depend on backend task.
            // The visual lawyer logic says "upload file -> triggers analysis".
            // If manual trigger is needed:
            await api.post(`/cases/${id}/analyze/`);
            navigate('/dashboard');
        } catch (err) {
            alert('خطا در ارسال برای تحلیل');
        }
    };

    if (isLoading) return <div>در حال بارگذاری...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                ویرایش پرونده
                <span className="text-sm font-normal text-gray-400">({caseData?.status === 'open' ? 'باز' : 'در جریان'})</span>
            </h2>

            <div className="space-y-8">
                {/* Section 1: Details */}
                <form onSubmit={handleUpdateDetails} className="space-y-4 border-b border-gray-100 pb-8">
                    <h3 className="font-bold text-lg text-emerald-700">۱. مشخصات پرونده</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">عنوان</label>
                            <input
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">دسته‌بندی</label>
                            <select
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="other">سایر</option>
                                <option value="civil">حقوقی</option>
                                <option value="criminal">کیفری</option>
                                <option value="family">خانواده</option>
                                <option value="administrative">دیوان عدالت</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">توضیحات</label>
                        <textarea
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="flex items-center text-emerald-600 hover:text-emerald-700 px-4 py-2 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                            <Save className="h-4 w-4 ml-2" />
                            ذخیره تغییرات متنی
                        </button>
                    </div>
                </form>

                {/* Section 2: Files */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-emerald-700">۲. مدیریت مدارک و مستندات</h3>

                    {/* Existing Files */}
                    {caseData?.files?.length > 0 ? (
                        <div className="grid gap-2">
                            {caseData.files.map(f => (
                                <div key={f.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm truncate max-w-xs md:max-w-md" dir="ltr">{f.file.split('/').pop()}</span>
                                        <span className="text-xs text-gray-400">({new Date(f.uploaded_at).toLocaleDateString('fa-IR')})</span>
                                    </div>
                                    <button onClick={() => deleteExistingFile(f.id)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">هیچ فایلی آپلود نشده است.</p>
                    )}

                    {/* New Upload */}
                    <div className="mt-6 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Upload className="h-10 w-10 mb-2 text-gray-400" />
                        <p className="text-sm">افزودن فایل جدید</p>
                    </div>

                    {newFiles.length > 0 && (
                        <div className="space-y-2">
                            {newFiles.map((f, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 text-emerald-700 bg-emerald-50 rounded border border-emerald-100">
                                    <span>{f.name}</span>
                                    <button onClick={() => removeNewFile(i)} className="text-red-500">حذف</button>
                                </div>
                            ))}
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {uploading ? 'در حال آپلود...' : 'آپلود فایل‌های جدید'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Final Action */}
                <div className="pt-8 border-t border-gray-100">
                    <button
                        onClick={handleSubmitForAnalysis}
                        className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                    >
                        ثبت نهایی و پردازش هوشمند
                    </button>
                </div>
            </div>
        </div>
    );
}
