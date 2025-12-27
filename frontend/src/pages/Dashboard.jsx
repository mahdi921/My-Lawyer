import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
    const { data: cases, isLoading } = useQuery({
        queryKey: ['cases'],
        queryFn: async () => {
            const res = await api.get('/cases/');
            return res.data;
        }
    });

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
    );

    const totalCases = cases?.length || 0;
    const processingCases = cases?.filter(c => c.status === 'processing').length || 0;
    const analyzedCases = cases?.filter(c => c.status === 'analyzed').length || 0;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">داشبورد وضعیت</h2>
                    <p className="text-slate-500 mt-1">نمای کلی فعالیت‌های حقوقی شما</p>
                </div>
                <Link
                    to="/cases/new"
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
                >
                    پرونده جدید
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">کل پرونده‌ها</p>
                        <h3 className="text-4xl font-bold text-slate-800">{totalCases}</h3>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Activity className="h-7 w-7" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">در حال پردازش</p>
                        <h3 className="text-4xl font-bold text-amber-500">{processingCases}</h3>
                    </div>
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <Clock className="h-7 w-7" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">تحلیل شده</p>
                        <h3 className="text-4xl font-bold text-emerald-600">{analyzedCases}</h3>
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <CheckCircle className="h-7 w-7" />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        فعالیت‌های اخیر
                    </h3>
                    <Link to="/cases" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                        مشاهده همه
                    </Link>
                </div>

                {totalCases === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 mb-4">هنوز پرونده‌ای ثبت نکرده‌اید</p>
                        <Link
                            to="/cases/new"
                            className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                        >
                            ثبت اولین پرونده
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cases.slice(0, 5).map(c => (
                            <Link
                                key={c.id}
                                to={`/cases/${c.id}`}
                                className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${c.status === 'analyzed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {c.title.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{c.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                            <span>{new Date(c.created_at).toLocaleDateString('fa-IR')}</span>
                                            <span>•</span>
                                            <span>{c.get_category_display || c.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${c.status === 'analyzed'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {c.status === 'analyzed' ? 'تحلیل شده' : 'در جریان'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
