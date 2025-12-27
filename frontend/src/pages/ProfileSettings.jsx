import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { User, Camera, Lock, Bell, Save, X } from 'lucide-react';

export default function ProfileSettings() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState({
        display_name: '',
        email: '',
        notification_preferences: { email: true, telegram: false }
    });
    const [passwords, setPasswords] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch profile
    const { data: userData, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await api.get('/users/me/');
            return res.data;
        },
        onSuccess: (data) => {
            setProfile({
                display_name: data.display_name || '',
                email: data.email || '',
                notification_preferences: data.notification_preferences || { email: true, telegram: false }
            });
        }
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data) => api.put('/users/me/', data),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'پروفایل با موفقیت به‌روزرسانی شد.' });
            queryClient.invalidateQueries(['profile']);
        },
        onError: (err) => {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'خطا در به‌روزرسانی پروفایل' });
        }
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data) => api.post('/auth/change-password/', data),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد.' });
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        },
        onError: (err) => {
            const errors = err.response?.data;
            if (errors) {
                const errorMsg = Object.values(errors).flat().join(', ');
                setMessage({ type: 'error', text: errorMsg });
            } else {
                setMessage({ type: 'error', text: 'خطا در تغییر رمز عبور' });
            }
        }
    });

    // Upload avatar mutation
    const uploadAvatarMutation = useMutation({
        mutationFn: (formData) => api.post('/users/me/avatar/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            setMessage({ type: 'success', text: 'تصویر پروفایل آپلود شد.' });
            setAvatarPreview(null);
            queryClient.invalidateQueries(['profile']);
        },
        onError: (err) => {
            setMessage({ type: 'error', text: err.response?.data?.avatar?.join(', ') || 'خطا در آپلود تصویر' });
        }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            const formData = new FormData();
            formData.append('avatar', file);
            uploadAvatarMutation.mutate(formData);
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(profile);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            setMessage({ type: 'error', text: 'رمزهای عبور جدید مطابقت ندارند.' });
            return;
        }
        changePasswordMutation.mutate(passwords);
    };

    if (isLoading) return <div className="text-center py-10">در حال بارگذاری...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">تنظیمات حساب کاربری</h1>

            {/* Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Avatar Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-gray-500" />
                    تصویر پروفایل
                </h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                            {(avatarPreview || userData?.avatar) ? (
                                <img
                                    src={avatarPreview || userData?.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 left-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>فرمت‌های مجاز: JPEG, PNG, GIF, WebP</p>
                        <p>حداکثر حجم: ۵ مگابایت</p>
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    اطلاعات پروفایل
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">شماره تلفن</label>
                        <input
                            type="text"
                            value={userData?.phone_number || ''}
                            disabled
                            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">نام نمایشی</label>
                        <input
                            type="text"
                            value={profile.display_name}
                            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="نام شما"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">ایمیل (اختیاری)</label>
                        <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="email@example.com"
                            dir="ltr"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    ذخیره تغییرات
                </button>
            </form>

            {/* Change Password */}
            <form onSubmit={handlePasswordSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-500" />
                    تغییر رمز عبور
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">رمز عبور فعلی</label>
                        <input
                            type="password"
                            value={passwords.current_password}
                            onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">رمز عبور جدید</label>
                        <input
                            type="password"
                            value={passwords.new_password}
                            onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">تکرار رمز عبور جدید</label>
                        <input
                            type="password"
                            value={passwords.confirm_password}
                            onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                    <Lock className="h-4 w-4" />
                    تغییر رمز عبور
                </button>
            </form>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-500" />
                    تنظیمات اعلان‌ها
                </h2>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <span>اعلان‌های ایمیلی</span>
                        <input
                            type="checkbox"
                            checked={profile.notification_preferences?.email || false}
                            onChange={(e) => setProfile({
                                ...profile,
                                notification_preferences: { ...profile.notification_preferences, email: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                        <span>اعلان‌های تلگرام</span>
                        <input
                            type="checkbox"
                            checked={profile.notification_preferences?.telegram || false}
                            onChange={(e) => setProfile({
                                ...profile,
                                notification_preferences: { ...profile.notification_preferences, telegram: e.target.checked }
                            })}
                            className="w-5 h-5 text-emerald-600 rounded"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
