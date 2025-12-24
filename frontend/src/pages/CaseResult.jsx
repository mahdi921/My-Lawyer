import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function CaseResult() {
    const { id } = useParams();

    const { data: caseData, isLoading } = useQuery({
        queryKey: ['case', id],
        queryFn: async () => {
            const res = await api.get(`/cases/${id}/`);
            return res.data;
        }
    });

    if (isLoading) return <div>در حال بارگذاری...</div>;
    if (!caseData?.analysis) return <div>تحلیلی برای این پرونده یافت نشد.</div>;

    const { result_json } = caseData.analysis;

    return (
        <div>
            <div className="flex items-center mb-6 text-gray-500">
                <Link to="/dashboard" className="flex items-center hover:text-gray-900">
                    داشبورد
                    <span className="mx-2">/</span>
                </Link>
                <span>{caseData.title}</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                <h2 className="text-xl font-bold mb-4 text-slate-800">خلاصه تحلیل هوشمند</h2>
                <p className="text-gray-600 leading-relaxed">{result_json.summary}</p>
            </div>

            <h3 className="text-lg font-bold mb-4">مسیرهای پیشنهادی</h3>
            <div className="grid gap-6 lg:grid-cols-2">
                {result_json.paths.map((path) => (
                    <div key={path.id} className={`p-6 rounded-xl border-2 transition ${path.probability > 60 ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-slate-800">{path.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${path.probability > 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {path.probability}% موفقیت
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{path.description}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center"><Clock className="h-4 w-4 ml-1" /> {path.duration}</div>
                            <div className="flex items-center"><AlertTriangle className="h-4 w-4 ml-1" /> ریسک: {path.risk}</div>
                        </div>

                        <div className="space-y-3">
                            <h5 className="font-bold text-sm text-gray-700">مراحل:</h5>
                            {path.steps.map((step, idx) => (
                                <div key={idx} className="flex items-center text-sm">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs ml-3 text-slate-600">{idx + 1}</div>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
