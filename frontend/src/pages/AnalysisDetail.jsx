import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import {
    ChevronDown, ChevronUp, Clock, Coins, AlertTriangle,
    CheckCircle, FileText, User, Scale, Download, Share2, ArrowRight
} from 'lucide-react';

export default function AnalysisDetail() {
    const { id: caseId, analysisId } = useParams();
    const [expandedSteps, setExpandedSteps] = useState({});

    const { data: analysis, isLoading, error } = useQuery({
        queryKey: ['analysis', caseId, analysisId],
        queryFn: async () => {
            const res = await api.get(`/cases/${caseId}/analyses/${analysisId}/`);
            return res.data;
        }
    });

    const toggleStep = (stepId) => {
        setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
    };

    const getActorLabel = (actor) => {
        const labels = {
            'user': 'شما',
            'lawyer': 'وکیل',
            'court': 'دادگاه',
            'third_party': 'شخص ثالث'
        };
        return labels[actor] || actor;
    };

    const getRiskColor = (risk) => {
        const colors = {
            'low': 'text-green-600 bg-green-50',
            'medium': 'text-yellow-600 bg-yellow-50',
            'high': 'text-red-600 bg-red-50'
        };
        return colors[risk] || 'text-gray-600 bg-gray-50';
    };

    if (isLoading) return <div className="text-center py-10">در حال بارگذاری تحلیل...</div>;
    if (error) return <div className="text-center py-10 text-red-500">خطا در دریافت تحلیل</div>;

    const resultJson = analysis?.result_json || {};
    const paths = resultJson.paths || [];
    const recommendedPathId = resultJson.recommended_path;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link to={`/cases/${caseId}`} className="text-emerald-600 hover:underline mb-2 inline-block">
                    ← بازگشت به پرونده
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">تحلیل حقوقی پرونده</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>نسخه {analysis?.version}</span>
                    <span className={`px-2 py-1 rounded ${analysis?.source === 'ai-engine' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {analysis?.source === 'ai-engine' ? 'تحلیل هوشمند' : 'تحلیل آزمایشی'}
                    </span>
                    <span>{new Date(analysis?.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm">
                        {resultJson.disclaimer || 'این راهنمایی مشاوره‌ای است و جایگزین مشاوره حقوقی رسمی نیست.'}
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                <h2 className="font-bold text-lg mb-3">خلاصه تحلیل</h2>
                <p className="text-gray-700 leading-relaxed">{resultJson.summary || analysis?.summary_text}</p>
            </div>

            {/* Paths */}
            <div className="space-y-6">
                {paths.map((path, pathIndex) => (
                    <div
                        key={path.id}
                        className={`bg-white rounded-xl shadow-sm border overflow-hidden ${path.id === recommendedPathId ? 'ring-2 ring-emerald-500' : ''}`}
                    >
                        {/* Path Header */}
                        <div className="p-6 border-b bg-gradient-to-l from-slate-50 to-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    {path.id === recommendedPathId && (
                                        <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full mb-2 inline-block">
                                            پیشنهاد ما
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-slate-800">{path.title}</h3>
                                    <p className="text-gray-600 mt-1">{path.summary}</p>
                                </div>
                                <div className="text-left">
                                    <div className="text-3xl font-bold text-emerald-600">{path.overall_probability}%</div>
                                    <div className="text-xs text-gray-500">احتمال موفقیت</div>
                                </div>
                            </div>

                            {/* Path Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{path.total_estimated_time_days} روز</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Coins className="h-4 w-4 text-gray-400" />
                                    <span dir="ltr">
                                        {path.total_estimated_cost_range?.[0]?.toLocaleString('fa-IR')} - {path.total_estimated_cost_range?.[1]?.toLocaleString('fa-IR')} ریال
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm col-span-2">
                                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                                    <span className="truncate">{path.primary_risks?.join('، ') || '-'}</span>
                                </div>
                            </div>

                            {/* Rationale */}
                            {path.rationale && (
                                <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
                                    <strong>دلیل پیشنهاد:</strong> {path.rationale}
                                </div>
                            )}
                        </div>

                        {/* Steps */}
                        <div className="divide-y">
                            {path.steps?.map((step, stepIndex) => (
                                <div key={step.id} className="p-4">
                                    {/* Step Header - Always Visible */}
                                    <button
                                        onClick={() => toggleStep(step.id)}
                                        className="w-full flex items-start justify-between text-right"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {stepIndex + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-800">{step.title}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {getActorLabel(step.actor)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {step.estimated_time_days} روز
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Coins className="h-3 w-3" />
                                                        {step.estimated_cost?.toLocaleString('fa-IR')} ریال
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-emerald-600">{step.success_probability}%</span>
                                            {expandedSteps[step.id] ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                        </div>
                                    </button>

                                    {/* Step Details - Expandable */}
                                    {expandedSteps[step.id] && (
                                        <div className="mt-4 mr-11 space-y-4">
                                            {/* Description */}
                                            <div>
                                                <h5 className="text-sm font-medium text-gray-700 mb-1">توضیحات</h5>
                                                <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                                            </div>

                                            {/* Required Documents */}
                                            {step.required_documents?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">مدارک مورد نیاز</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.required_documents.map((doc, i) => (
                                                            <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded inline-flex items-center gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {doc}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Legal Basis */}
                                            {step.legal_basis?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">مستندات قانونی</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.legal_basis.map((basis, i) => (
                                                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-flex items-center gap-1">
                                                                <Scale className="h-3 w-3" />
                                                                {basis}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Risks */}
                                            {step.risks?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">ریسک‌ها</h5>
                                                    <ul className="text-sm text-red-600 space-y-1">
                                                        {step.risks.map((risk, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                                {risk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Next Actions */}
                                            {step.next_actions?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">اقدامات بعدی</h5>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {step.next_actions.map((action, i) => (
                                                            <li key={i} className="flex items-center gap-2">
                                                                <ArrowRight className="h-4 w-4 text-emerald-500" />
                                                                {action}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition">
                    <Download className="h-5 w-5" />
                    دانلود PDF
                </button>
                <button className="flex items-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition">
                    <Share2 className="h-5 w-5" />
                    اشتراک‌گذاری با وکیل
                </button>
            </div>
        </div>
    );
}
