import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Upload, FileText, ArrowLeft } from 'lucide-react';

export default function NewCase() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ title: '', category: 'other', description: '' });
    const [caseId, setCaseId] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateCase = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/cases/', formData);
            setCaseId(res.data.id);
            setStep(2);
        } catch (err) {
            alert('خطا در ایجاد پرونده');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);
        const data = new FormData();
        files.forEach(file => {
            data.append('file', file);
        });

        try {
            await api.post(`/cases/${caseId}/upload_file/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.error) {
                alert(`خطا: ${err.response.data.error}`);
            } else if (err.response && err.status === 413) {
                alert('حجم فایل‌ها بیش از حد مجاز است.');
            } else {
                alert('خطا در آپلود فایل‌ها. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-8 border-b pb-4">
                <h2 className="text-xl font-bold">پرونده جدید</h2>
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                    <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>1. مشخصات</span>
                    <span className="text-gray-300">-----</span>
                    <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>2. مدارک</span>
                </div>
            </div>

            {step === 1 ? (
                <form onSubmit={handleCreateCase} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">عنوان پرونده</label>
                        <input
                            required
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
                    <div>
                        <label className="block text-sm font-medium mb-1">توضیحات مختصر</label>
                        <textarea
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <button disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition flex justify-center">
                        {loading ? 'در حال ثبت...' : <span className="flex items-center">مرحله بعد <ArrowLeft className="mr-2 h-4 w-4" /></span>}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Upload className="h-12 w-12 mb-4 text-gray-400" />
                        <p>فایل‌های مدارک و توضیحات صوتی را اینجا رها کنید</p>
                        <p className="text-xs text-gray-400 mt-2">PDF, JPG, MP3 (چند فایل مجاز است)</p>
                    </div>

                    {files.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <h4 className="font-medium text-sm text-gray-700 mb-2">فایل‌های انتخاب شده:</h4>
                            {files.map((f, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-100">
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 ml-2 text-emerald-500" />
                                        <span className="truncate max-w-xs">{f.name}</span>
                                    </div>
                                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">حذف</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 border rounded-lg hover:bg-gray-50">بعداً آپلود می‌کنم</button>
                        <button onClick={handleUpload} disabled={files.length === 0 || loading} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                            {loading ? 'در حال آپلود...' : 'ثبت نهایی و پردازش'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
