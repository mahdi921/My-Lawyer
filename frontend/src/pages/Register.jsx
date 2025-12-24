import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('رمز عبور و تکرار آن مطابقت ندارند.');
            return;
        }
        try {
            await api.post('/auth/register/', { phone_number: phone, password });
            navigate('/login');
        } catch (err) {
            setError('خطا در ثبت‌نام. ممکن است شماره تکراری باشد.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">ثبت‌نام</h2>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تکرار رمز عبور</label>
                        <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">
                        ثبت‌نام
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    حساب دارید؟ <Link to="/login" className="text-emerald-600">وارد شوید</Link>
                </div>
            </div>
        </div>
    );
}
