import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

export default function ProfileMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fallback for avatar/name
    const displayName = user?.first_name || user?.phone_number || 'کاربر';
    const initials = displayName.charAt(0).toUpperCase();

    return (
        <Menu as="div" className="relative inline-block text-right">
            <div>
                <Menu.Button className="inline-flex items-center gap-3 justify-center w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-opacity-75 transition-all shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                        {initials}
                    </div>
                    <span className="hidden md:block">{displayName}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-slate-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    to="/dashboard"
                                    className={clsx(
                                        'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                                        active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-900'
                                    )}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    داشبورد
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    to="/settings"
                                    className={clsx(
                                        'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                                        active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-900'
                                    )}
                                >
                                    <Settings className="w-4 h-4" />
                                    تنظیمات
                                </Link>
                            )}
                        </Menu.Item>
                    </div>
                    <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={handleLogout}
                                    className={clsx(
                                        'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                                        active ? 'bg-red-50 text-red-900' : 'text-slate-900'
                                    )}
                                >
                                    <LogOut className="w-4 h-4" />
                                    خروج
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
