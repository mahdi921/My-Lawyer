import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Clock, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../api';

export default function AnalysisList() {
    const { data: cases, isLoading, error } = useQuery({
        queryKey: ['user-cases'],
        queryFn: async () => {
            const res = await api.get('/cases/');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-700">خطا در بارگذاری تحلیل‌ها</p>
            </div>
        );
    }

    // Flatten all analyses from all cases
    const allAnalyses = (cases || []).flatMap(caseItem =>
        (caseItem.analyses || []).map(analysis => ({
            ...analysis,
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            caseCategory: caseItem.category
        }))
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">تحلیل‌های حقوقی</h1>
                <p className="text-slate-500">
                    {allAnalyses.length} تحلیل موجود
                </p>
            </div>

            {allAnalyses.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center group hover:bg-slate-100 transition-colors">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">هنوز تحلیلی ندارید</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">برای دریافت مشاوره هوشمند، اولین پرونده خود را ثبت کنید</p>
                    <Link
                        to="/cases/new"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        ایجاد پرونده جدید
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {allAnalyses.map((analysis) => (
                        <Link
                            key={`${analysis.caseId}-${analysis.id}`}
                            to={`/cases/${analysis.caseId}/analysis/${analysis.id}`}
                            className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/5 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Case info */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors mb-1">
                                        {analysis.caseTitle}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                                            نسخه {analysis.version}
                                        </span>
                                        <span className={`${analysis.is_mock ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} px-2.5 py-1 rounded-lg`}>
                                            {analysis.is_mock ? 'تحلیل آزمایشی' : 'تحلیل هوش مصنوعی'}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                    <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                </div>
                            </div>

                            {/* Summary */}
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed pl-4 border-l-2 border-slate-100 group-hover:border-emerald-200 transition-colors">
                                {analysis.summary_text || analysis.result_json?.comparison_rationale || 'توضیحات تحلیل در دسترس نیست...'}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-50 pt-3 mt-auto">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{new Date(analysis.created_at).toLocaleDateString('fa-IR')}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
