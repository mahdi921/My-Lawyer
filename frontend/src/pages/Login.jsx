import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login/', { phone_number: phone, password });
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            navigate('/dashboard');
        } catch (err) {
            setError('شماره موبایل یا رمز عبور اشتباه است.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                        <span className="text-3xl font-bold text-white">V</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">خوش آمدید</h2>
                <p className="text-center text-slate-500 text-sm mb-8">برای دسترسی به داشبورد وارد شوید</p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">شماره موبایل</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none dir-ltr text-left transition-all"
                            placeholder="0912..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">رمز عبور</label>
                        <input
                            type="password"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none dir-ltr text-left transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                    >
                        ورود به حساب
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    حساب کاربری ندارید؟{' '}
                    <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                        ثبت‌نام کنید
                    </Link>
                </div>
            </div>
        </div>
    );
}
