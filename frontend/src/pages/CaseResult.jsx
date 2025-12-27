import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ArrowLeft, Clock, AlertTriangle, FileText, ChevronLeft } from 'lucide-react';
import CaseEventForm from '../components/CaseEventForm';

export default function CaseResult() {
    const { id } = useParams();

    const { data: caseData, isLoading, refetch } = useQuery({
        queryKey: ['case', id],
        queryFn: async () => {
            const res = await api.get(`/cases/${id}/`);
            return res.data;
        }
    });

    if (isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
    if (!caseData) return <div className="p-8 text-center text-red-500">پرونده یافت نشد.</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/dashboard">داشبورد</Link>
                        <span>/</span>
                        <span>پرونده‌ها</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{caseData.title}</h1>
                </div>
                <Link to="/cases" className="flex items-center text-emerald-600 hover:text-emerald-700">
                    بازگشت
                    <ArrowLeft className="h-4 w-4 mr-1" />
                </Link>
            </div>

            {/* Analysis History Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center justify-between">
                    تحلیل‌های حقوقی
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {caseData.analyses?.length || 0} نسخه
                    </span>
                </h2>

                {caseData.analyses?.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {caseData.analyses.map((analysis) => (
                            <Link
                                key={analysis.id}
                                to={`/cases/${id}/analysis/${analysis.id}`}
                                className="block group border rounded-lg p-4 hover:border-emerald-500 hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold">
                                        نسخه {analysis.version}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(analysis.created_at).toLocaleDateString('fa-IR')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 group-hover:text-emerald-600">
                                    {analysis.result_json?.summary?.substring(0, 60)}...
                                </h3>
                                <div className="flex items-center gap-1 text-emerald-600 text-sm mt-3">
                                    مشاهده جزئیات کامل
                                    <ChevronLeft className="h-4 w-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-2">هنوز هیچ تحلیلی برای این پرونده انجام نشده است.</p>
                        <button className="text-emerald-600 font-medium hover:underline">درخواست تحلیل اولیه</button>
                    </div>
                )}
            </div>

            {/* Add Event / Update Section */}
            <div className="mb-8">
                <CaseEventForm onSuccess={refetch} />
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold mb-6 text-slate-800">تاریخچه رویدادها</h2>

                {caseData.events?.length > 0 ? (
                    <div className="relative border-r-2 border-slate-200 mr-3 space-y-8 pr-6">
                        {caseData.events.map((event) => (
                            <div key={event.id} className="relative">
                                {/* Dot */}
                                <div className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white lg:hover:scale-125 transition-transform"></div>

                                <div className="bg-slate-50 p-4 rounded-lg border hover:border-emerald-300 transition-colors">
                                    <div className="flex flex-wrap justify-between items-start mb-2">
                                        <h4 className="font-bold text-slate-800">{event.summary || "بدون عنوان"}</h4>
                                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                                            {new Date(event.timestamp).toLocaleDateString('fa-IR')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                        {event.details}
                                    </p>

                                    {/* Attachments */}
                                    {event.attachments?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200">
                                            {event.attachments.map(att => (
                                                <div key={att.id} className="flex items-center gap-1 text-xs bg-white border px-2 py-1 rounded text-slate-600">
                                                    <FileText className="h-3 w-3" />
                                                    {att.file?.split('/').pop()}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">هنوز رویدادی ثبت نشده است.</p>
                )}
            </div>
        </div>
    );
}
