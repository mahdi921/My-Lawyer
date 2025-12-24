import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function CasesList() {
    const { data: cases, isLoading } = useQuery({
        queryKey: ['cases'],
        queryFn: async () => {
            const res = await api.get('/cases/');
            return res.data;
        }
    });

    if (isLoading) return <div>در حال بارگذاری...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">لیست پرونده‌ها</h2>
                <Link to="/cases/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                    ایجاد پرونده جدید
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cases?.map((c) => (
                    <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${c.status === 'analyzed' ? 'bg-green-100 text-green-700' :
                                c.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {c.status === 'analyzed' ? 'تحلیل شده' :
                                    c.status === 'processing' ? 'در حال پردازش' : 'باز'}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{c.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-400">
                            <span>{new Date(c.created_at).toLocaleDateString('fa-IR')}</span>
                            {c.analysis && (
                                <span className="flex items-center text-emerald-600 font-medium">
                                    {c.analysis.success_probability}% شانس موفقیت
                                </span>
                            )}
                        </div>
                        {c.status === 'analyzed' && (
                            <Link to={`/cases/${c.id}`} className="block mt-4 text-center text-emerald-600 border border-emerald-600 rounded py-2 hover:bg-emerald-50">
                                مشاهده تحلیل
                            </Link>
                        )}
                        {c.status !== 'analyzed' && c.status !== 'processing' && (
                            <Link to={`/cases/${c.id}/edit`} className="block mt-4 text-center text-slate-600 border border-slate-300 rounded py-2 hover:bg-slate-50">
                                ویرایش / تکمیل مدارک
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
