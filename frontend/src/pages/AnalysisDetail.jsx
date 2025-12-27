import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../api';
import { ArrowLeft, Clock, AlertTriangle, FileText, CheckCircle, ChevronDown, ChevronUp, Share2, Download, GitMerge, Info } from 'lucide-react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

// Simple edge/node setup for flowchart visualization
const FlowchartView = ({ flowchartJson }) => {
    if (!flowchartJson?.nodes || !flowchartJson?.edges) return null;

    // Safety check for nodes/edges format
    const nodes = flowchartJson.nodes.map(n => ({
        ...n,
        data: { label: n.data?.label || n.label || '' }
    }));
    const edges = flowchartJson.edges;

    return (
        <div className="h-64 md:h-80 w-full border rounded-xl bg-slate-50 mb-8 overflow-hidden">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#aaa" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default function AnalysisDetail() {
    const { id, analysisId } = useParams();
    const [expandedOption, setExpandedOption] = useState(null);
    const [expandedStep, setExpandedStep] = useState(null);

    const { data: analysis, isLoading, error } = useQuery({
        queryKey: ['analysis', analysisId],
        queryFn: async () => {
            const res = await api.get(`/cases/${id}/analyses/${analysisId}/`);
            // Parse JSON if it comes as string, or use directly if object
            const json = typeof res.data.result_json === 'string'
                ? JSON.parse(res.data.result_json)
                : res.data.result_json;
            return { ...res.data, result_json: json };
        }
    });

    const chooseOptionMutation = useMutation({
        mutationFn: (optionId) => api.post(`/cases/${id}/analyses/${analysisId}/choose`, { option_id: optionId }),
        onSuccess: () => alert('مسیر انتخاب شد (ثبت در سیستم).')
    });

    if (isLoading) return <div className="p-8 text-center">درحال دریافت تحلیل دقیق...</div>;
    if (error) return <div className="p-8 text-center text-red-600">خطا در دریافت تحلیل: {error.message}</div>;

    const { result_json, created_at, source, version } = analysis;
    const { options, flowchart_json, comparison_rationale, summary } = result_json;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Link to={`/cases/${id}`} className="hover:text-emerald-600 flex items-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        بازگشت به پرونده
                    </Link>
                    <span>•</span>
                    <span>نسخه {version}</span>
                    <span>•</span>
                    <span className="uppercase text-xs bg-slate-100 px-2 py-0.5 rounded">{source}</span>
                    <span>•</span>
                    <span>{new Date(created_at).toLocaleDateString('fa-IR')}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">تحلیل حقوقی پرونده</h1>
                <p className="text-gray-600">{summary || "تحلیل هوشمند بر اساس مستندات ارائه شده."}</p>
            </div>

            {/* Comparison Logic */}
            {comparison_rationale && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3">
                    <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-blue-800 mb-1">جمع‌بندی و مقایسه راهکارها</h3>
                        <p className="text-blue-700 text-sm leading-relaxed">{comparison_rationale}</p>
                    </div>
                </div>
            )}

            {/* Flowchart Visualization */}
            {flowchart_json && (
                <div className="mb-8">
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-slate-800">
                        <GitMerge className="h-5 w-5 text-emerald-600" />
                        نقشه راه پرونده
                    </h3>
                    <FlowchartView flowchartJson={flowchart_json} />
                </div>
            )}

            {/* Options List */}
            <div className="space-y-8">
                {options?.map((option) => (
                    <div
                        key={option.option_id}
                        className={`border rounded-xl transition-all duration-300 overflow-hidden ${expandedOption === option.option_id
                                ? 'bg-white shadow-lg ring-1 ring-emerald-500/20'
                                : 'bg-white shadow-sm hover:shadow-md'
                            }`}
                    >
                        {/* Option Header Card */}
                        <div className="p-6 cursor-pointer" onClick={() => setExpandedOption(expandedOption === option.option_id ? null : option.option_id)}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        {option.title}
                                        {expandedOption !== option.option_id && (
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-normal">
                                                احتمال موفقیت: {option.estimated_success_probability}%
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-gray-500 text-sm">{option.summary}</p>
                                </div>
                                <div className="flex gap-2">
                                    {expandedOption === option.option_id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                </div>
                            </div>

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-emerald-50 p-3 rounded-lg">
                                    <div className="text-gray-500 mb-1">احتمال موفقیت</div>
                                    <div className="font-bold text-emerald-700 text-lg">{option.estimated_success_probability}% <span className="text-xs font-normal text-emerald-600">(اطمینان: {option.confidence_score * 100}%)</span></div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <div className="text-gray-500 mb-1">زمان تخمینی</div>
                                    <div className="font-bold text-slate-700">
                                        {/* Summing steps time */}
                                        {option.detailed_steps.reduce((acc, s) => acc + (s.estimated_duration_days || 0), 0)} روز
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                                    <div className="text-gray-500 mb-1">هزینه تخمینی</div>
                                    <div className="font-bold text-slate-700 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                        <span>{Number(option.cost_estimate?.amount).toLocaleString()} {option.cost_estimate?.currency}</span>
                                        <span className="text-xs text-gray-400 font-normal truncate" title={option.cost_estimate?.explanation}>
                                            ({option.cost_estimate?.explanation})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions (Visible if Expanded) */}
                            {expandedOption === option.option_id && (
                                <div className="mt-6 flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); chooseOptionMutation.mutate(option.option_id); }}
                                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        انتخاب این مسیر
                                    </button>
                                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                        <Download className="h-4 w-4" />
                                        دانلود PDF
                                    </button>
                                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                        <Share2 className="h-4 w-4" />
                                        اشتراک‌گذاری
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Detailed Steps (Visible if Expanded) */}
                        {expandedOption === option.option_id && (
                            <div className="bg-slate-50 border-t p-6">
                                <h3 className="font-bold text-lg mb-4 text-slate-800">مراحل اجرایی دقیق</h3>
                                <div className="relative border-r-2 border-slate-200 mr-3 space-y-8 pr-6">
                                    {option.detailed_steps.map((step, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Timeline dot */}
                                            <div className="absolute -right-[31px] top-1 w-6 h-6 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center text-xs font-bold text-slate-600">
                                                {step.step_number}
                                            </div>

                                            {/* Step Card */}
                                            <div
                                                className="bg-white p-5 rounded-xl border shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
                                                onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                                                        <p className="text-sm text-slate-600 line-clamp-2">{step.description}</p>
                                                    </div>
                                                    <div className="text-xs text-slate-400 whitespace-nowrap bg-slate-100 px-2 py-1 rounded">
                                                        {step.estimated_duration_days} روز
                                                    </div>
                                                </div>

                                                {/* Expanded Step Details */}
                                                {expandedStep === idx && (
                                                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm space-y-3">
                                                        <p className="text-slate-700 leading-relaxed">{step.description}</p>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <span className="block font-medium text-slate-900 mb-1">مدارک مورد نیاز:</span>
                                                                <ul className="list-disc list-inside text-slate-600">
                                                                    {step.required_documents?.map((doc, i) => (
                                                                        <li key={i} className="flex items-center gap-2">
                                                                            <FileText className="h-3 w-3" />
                                                                            {doc}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <span className="block font-medium text-slate-900 mb-1">اقدامات حقوقی:</span>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {step.legal_actions?.map((act, i) => (
                                                                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{act}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {step.risk_notes && (
                                                            <div className="bg-red-50 text-red-800 p-3 rounded-lg flex gap-2 items-start mt-2">
                                                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                                                <span>{step.risk_notes}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Legal References Footer */}
                                {option.legal_references?.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-200">
                                        <h4 className="font-bold text-sm text-slate-900 mb-2">مستندات قانونی:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {option.legal_references.map((ref, i) => (
                                                <span key={i} className="bg-slate-200 text-slate-700 px-3 py-1 rounded text-xs font-mono">
                                                    {ref.code} - ماده {ref.article}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="mt-6 text-xs text-gray-400 bg-gray-50 p-3 rounded text-center">
                                    {option.limitations_and_disclaimer}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reanalysis CTA */}
            <div className="mt-12 text-center">
                <p className="text-gray-500 mb-4">اطلاعات پرونده تغییر کرده؟</p>
                <div className="flex justify-center gap-4">
                    <button className="text-emerald-600 hover:underline">افزودن رویداد جدید</button>
                    <span className="text-gray-300">|</span>
                    <button className="text-emerald-600 hover:underline">تحلیل مجدد</button>
                </div>
            </div>
        </div>
    );
}
