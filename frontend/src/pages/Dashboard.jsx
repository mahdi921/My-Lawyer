import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
    // Ideally user profile and summary stats would be fetched here
    // For now we can fetch cases to generate stats
    const { data: cases, isLoading } = useQuery({
        queryKey: ['cases'],
        queryFn: async () => {
            const res = await api.get('/cases/');
            return res.data;
        }
    });

    if (isLoading) return <div>در حال بارگذاری اطلاعات داشبورد...</div>;

    const totalCases = cases?.length || 0;
    const processingCases = cases?.filter(c => c.status === 'processing').length || 0;
    const analyzedCases = cases?.filter(c => c.status === 'analyzed').length || 0;

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-8">داشبورد وضعیت</h2>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 mb-2">کل پرونده‌ها</p>
                        <h3 className="text-3xl font-bold text-slate-800">{totalCases}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 mb-2">در حال پردازش</p>
                        <h3 className="text-3xl font-bold text-yellow-600">{processingCases}</h3>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                        <Clock className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 mb-2">تحلیل شده</p>
                        <h3 className="text-3xl font-bold text-emerald-600">{analyzedCases}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Quick Actions or Recent Cases */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">فعالیت‌های اخیر</h3>
                    <Link to="/cases" className="text-sm text-emerald-600 hover:underline">
                        مشاهده همه پرونده‌ها
                    </Link>
                </div>
                {totalCases === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        هنوز پرونده‌ای ثبت نکرده‌اید.
                        <div className="mt-4">
                            <Link to="/cases/new" className="text-emerald-600 font-medium hover:underline">
                                ثبت اولین پرونده
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {cases.slice(0, 3).map(c => (
                            <li key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition">
                                <div>
                                    <h4 className="font-medium text-slate-700">{c.title}</h4>
                                    <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'analyzed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {c.status === 'analyzed' ? 'تحلیل شده' : 'در جریان'}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
