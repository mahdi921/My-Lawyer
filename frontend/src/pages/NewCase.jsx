import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Upload, FileText, ArrowLeft } from 'lucide-react';
import AnalysisProgress from '../components/AnalysisProgress';

export default function NewCase() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ title: '', category: 'other', description: '' });
    const [caseId, setCaseId] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [autoSubmit, setAutoSubmit] = useState(true);
    const [taskId, setTaskId] = useState(null);
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
            const res = await api.post(
                `/cases/${caseId}/upload_file/?auto_submit=${autoSubmit}`,
                data,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (res.data.task_id) {
                // Auto-submitted - show progress
                setTaskId(res.data.task_id);
                setStep(3);
            } else {
                // Saved as draft - go to dashboard
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.error) {
                alert(`خطا: ${err.response.data.error}`);
            } else if (err.response?.status === 413) {
                alert('حجم فایل‌ها بیش از حد مجاز است.');
            } else {
                alert('خطا در آپلود فایل‌ها. لطفاً دوباره تلاش کنید.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAnalysisComplete = (analysisId) => {
        // Navigate to the case result page
        navigate(`/cases/${caseId}`);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Steps Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <div className="flex items-center justify-between relative overflow-hidden">
                    {/* Progress Line Background */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>

                    {/* Step 1 */}
                    <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all ${step >= 1 ? 'bg-emerald-600 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'
                            }`}>1</div>
                        <span className="text-sm font-bold">مشخصات</span>
                    </div>

                    {/* Step 2 */}
                    <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all ${step >= 2 ? 'bg-emerald-600 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'
                            }`}>2</div>
                        <span className="text-sm font-bold">مدارک</span>
                    </div>

                    {/* Step 3 */}
                    <div className={`relative z-10 flex flex-col items-center gap-2 ${step >= 3 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all ${step >= 3 ? 'bg-emerald-600 text-white border-emerald-100' : 'bg-white text-slate-400 border-slate-100'
                            }`}>3</div>
                        <span className="text-sm font-bold">تحلیل</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">
                    {step === 1 && 'مشخصات پرونده'}
                    {step === 2 && 'آپلود مدارک'}
                    {step === 3 && 'تحلیل هوشمند'}
                </h2>

                {step === 1 ? (
                    <form onSubmit={handleCreateCase} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">عنوان پرونده</label>
                            <input
                                required
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                placeholder="مثلاً: شکایت از کارفرما..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">دسته‌بندی موضوعی</label>
                            <div className="relative">
                                <select
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none transition-all"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="other">سایر موارد</option>
                                    <option value="civil">حقوقی (ملک، قرارداد)</option>
                                    <option value="criminal">کیفری (جرایم)</option>
                                    <option value="family">خانواده (طلاق، مهریه)</option>
                                    <option value="administrative">دیوان عدالت اداری</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">شرح مختصر مشکل</label>
                            <textarea
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none h-32 resize-none transition-all"
                                placeholder="توضیح دهید چه اتفاقی افتاده است..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'در حال ثبت...' : (
                                <>
                                    <span>مرحله بعد</span>
                                    <ArrowLeft className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                ) : step === 2 ? (
                    <div className="space-y-8">
                        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-emerald-400 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                            />
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-10 w-10 text-emerald-600" />
                            </div>
                            <p className="font-bold text-slate-700 text-lg">مدارک خود را اینجا رها کنید</p>
                            <p className="text-sm text-slate-400 mt-2">یا برای انتخاب کلیک کنید (تصویر، PDF، صوت)</p>
                        </div>

                        {files.length > 0 && (
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-500" />
                                    فایل‌های انتخاب شده:
                                </h4>
                                {files.map((f, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-slate-500">{f.name.split('.').pop().toUpperCase()}</span>
                                            </div>
                                            <span className="truncate max-w-xs font-medium text-slate-700">{f.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(index)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold">حذف</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-emerald-800 block mb-1">تحلیل خودکار توسط هوش مصنوعی</span>
                                    <p className="text-xs text-emerald-600/80">شروع فرآیند تحلیل بلافاصله پس از آپلود</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAutoSubmit(!autoSubmit)}
                                    className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${autoSubmit ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 ${autoSubmit ? 'translate-x-[-4px]' : 'translate-x-[28px]'}`} />
                                    {/* Note: In RTL translate-x works inversely visually if dir=rtl, or we use right/left positioning. 
                                        Let's stick to absolute positioning for robustness in RTL.
                                     */}
                                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200 ${autoSubmit ? 'left-1' : 'left-7'}`}></span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => { setAutoSubmit(false); handleUpload(); }}
                                className="flex-1 py-3.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold transition"
                            >
                                ذخیره و تحلیل در آینده
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={files.length === 0 || loading}
                                className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                            >
                                {loading ? 'در حال پردازش...' : (autoSubmit ? 'آپلود و شروع تحلیل' : 'ثبت مدارک')}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Step 3: Analysis Progress */
                    <div className="py-8">
                        <AnalysisProgress
                            taskId={taskId}
                            onComplete={handleAnalysisComplete}
                            onCancel={() => navigate(`/cases/${caseId}`)}
                        />

                        <div className="text-center mt-8">
                            <button
                                onClick={() => navigate(`/cases/${caseId}`)}
                                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm bg-emerald-50 px-6 py-2 rounded-lg transition-colors border border-emerald-100"
                            >
                                مشاهده جزئیات پرونده (در پس‌زمینه)
                            </button>
                            <p className="text-xs text-slate-400 mt-3">می‌توانید صفحه را ببندید، تحلیل ادامه خواهد داشت.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

