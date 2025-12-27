import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Settings, LogOut, PieChart, Menu, X, Plus, User } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const navItems = [
        { name: 'داشبورد', path: '/dashboard', icon: Home },
        { name: 'پرونده‌ها', path: '/cases', icon: FolderOpen },
        { name: 'تحلیل‌ها', path: '/analysis', icon: PieChart },
        { name: 'تنظیمات', path: '/settings', icon: Settings },
    ];

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close menu on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        if (mobileMenuOpen) {
            document.addEventListener('keydown', handleEsc);
            return () => document.removeEventListener('keydown', handleEsc);
        }
    }, [mobileMenuOpen]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMobileMenuOpen(false);
            }
        };
        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [mobileMenuOpen]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white">V</div>
                        <h1 className="text-xl font-bold text-emerald-400">وکیل مجازی</h1>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center px-4 py-3 rounded-lg transition duration-200 font-medium",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className="ml-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition"
                    >
                        <LogOut className="ml-3 h-5 w-5" />
                        خروج از حساب
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden z-20 relative">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label="باز/بسته کردن منو"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <h1 className="text-xl font-bold text-emerald-600">وکیل مجازی</h1>
                    <Link
                        to="/cases/new"
                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="ایجاد پرونده جدید"
                    >
                        <Plus className="h-5 w-5" />
                    </Link>
                </header>

                {/* Mobile Slide-out Menu (RTL: opens from right) */}
                <div
                    className={clsx(
                        "fixed inset-0 z-30 md:hidden transition-opacity duration-300",
                        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Menu Panel - Slides from RIGHT for RTL */}
                    <nav
                        ref={menuRef}
                        id="mobile-menu"
                        role="menu"
                        className={clsx(
                            "absolute top-0 right-0 bottom-0 w-72 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        )}
                    >
                        {/* Profile Preview */}
                        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <div className="font-medium text-white">کاربر</div>
                                <div className="text-sm text-slate-400">مشاهده پروفایل</div>
                            </div>
                        </div>

                        {/* Quick CTA */}
                        <div className="p-4 border-b border-slate-800">
                            <Link
                                to="/cases/new"
                                role="menuitem"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 min-h-[44px]"
                            >
                                <Plus className="h-5 w-5" />
                                ایجاد پرونده جدید
                            </Link>
                        </div>

                        {/* Nav Items */}
                        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        role="menuitem"
                                        className={clsx(
                                            "flex items-center px-4 py-3 rounded-lg transition duration-200 font-medium min-h-[44px]",
                                            isActive
                                                ? "bg-emerald-600 text-white"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon className="ml-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Logout */}
                        <div className="p-4 border-t border-slate-800">
                            <button
                                onClick={handleLogout}
                                role="menuitem"
                                className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition min-h-[44px]"
                            >
                                <LogOut className="ml-3 h-5 w-5" />
                                خروج از حساب
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation (fallback for very small screens) */}
                <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around items-center py-2 safe-area-inset-bottom">
                    {[
                        { name: 'داشبورد', path: '/dashboard', icon: Home },
                        { name: 'پرونده‌ها', path: '/cases', icon: FolderOpen },
                        { name: 'جدید', path: '/cases/new', icon: Plus, highlight: true },
                        { name: 'تنظیمات', path: '/settings', icon: Settings },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center gap-1 min-w-[60px] min-h-[44px] justify-center",
                                    item.highlight
                                        ? "text-emerald-600"
                                        : isActive ? "text-emerald-600" : "text-gray-500"
                                )}
                            >
                                <Icon className={clsx("h-5 w-5", item.highlight && "h-6 w-6")} />
                                <span className="text-xs">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
