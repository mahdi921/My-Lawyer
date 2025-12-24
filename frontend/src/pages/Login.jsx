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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">ورود به حساب</h2>
                {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left"
                            placeholder="0912..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">
                        ورود
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    حساب ندارید؟ <Link to="/register" className="text-emerald-600">ثبت‌نام کنید</Link>
                </div>
            </div>
        </div>
    );
}
