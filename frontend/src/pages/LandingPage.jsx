import { Link } from 'react-router-dom';
import { Scale, FileText, CheckCircle, Shield, ArrowLeft, Activity, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProfileMenu from '../components/ProfileMenu';

export default function LandingPage() {
    const { isAuthenticated, isAuthReady } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 font-sans" dir="rtl">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Scale className="h-8 w-8 text-emerald-600 ml-2" />
                            <span className="text-xl font-bold text-slate-800">وکیل مجازی</span>
                        </div>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            {!isAuthReady ? (
                                <div className="h-10 w-24 bg-slate-100 rounded-lg animate-pulse" />
                            ) : isAuthenticated ? (
                                <div className="flex items-center gap-4">
                                    <Link to="/dashboard" className="hidden md:flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium transition">
                                        <LayoutDashboard className="h-5 w-5" />
                                        <span>داشبورد</span>
                                    </Link>
                                    <ProfileMenu />
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium px-3 py-2">ورود</Link>
                                    <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium">ثبت نام</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-slate-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
                        مشاور حقوقی هوشمند شما، <br />
                        <span className="text-emerald-400">همیشه در دسترس</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                        با استفاده از هوش مصنوعی، پرونده‌های حقوقی خود را تحلیل کنید و بهترین مسیرهای قانونی را با تخمین شانس موفقیت دریافت کنید.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/register" className="bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-emerald-600 transition flex items-center justify-center">
                            شروع مشاوره رایگان
                            <ArrowLeft className="mr-2 h-5 w-5" />
                        </Link>
                        <Link to="/login" className="bg-slate-800 text-gray-200 border border-slate-700 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-700 transition">
                            ورود به حساب
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">چرا وکیل مجازی؟</h2>
                    <p className="text-gray-600">راهکاری مدرن برای دغدغه‌های حقوقی پیچیده</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">تحلیل هوشمند ریسک</h3>
                        <p className="text-gray-600 leading-relaxed">
                            سیستم با بررسی ده‌ها فاکتور، شانس موفقیت شما را در هر مسیر حقوقی به صورت درصدی تخمین می‌زند.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">بررسی مستندات</h3>
                        <p className="text-gray-600 leading-relaxed">
                            امکان آپلود تصویر، PDF و فایل صوتی. موتور پردازش متن ما محتوای اسناد شما را استخراج و تحلیل می‌کند.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">حریم خصوصی امن</h3>
                        <p className="text-gray-600 leading-relaxed">
                            تمامی اطلاعات شما رمزنگاری شده و تنها برای تحلیل خودکار استفاده می‌شود. حریم خصوصی اولویت ماست.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="bg-slate-50 border-t border-gray-200 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">چطور کار می‌کند؟</h2>
                    </div>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {/* Step 1 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                1
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2 text-slate-800">ثبت‌نام و ایجاد حساب</h3>
                                <p className="text-gray-600 text-sm">با شماره موبایل خود وارد شوید. این فرآیند کمتر از ۱ دقیقه زمان می‌برد.</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                2
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2 text-slate-800">شرح ماجرا</h3>
                                <p className="text-gray-600 text-sm">موضوع پرونده را انتخاب کنید و مدارک یا فایل صوتی توضیحات خود را آپلود کنید.</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                3
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2 text-slate-800">دریافت تحلیل هوشمند</h3>
                                <p className="text-gray-600 text-sm">سیستم مسیرهای مختلف (سازش، شکایت، دعوی حقوقی) را با درصد موفقیت به شما نمایش می‌دهد.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 text-center">
                <p className="mb-4">وکیل مجازی؛ دستیار هوشمند حقوقی شما</p>
                <p className="text-sm">© ۲۰۲۵ تمامی حقوق محفوظ است.</p>
            </footer>
        </div>
    );
}
