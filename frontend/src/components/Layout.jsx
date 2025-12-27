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
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-xl z-10">
                <div className="p-6 border-b border-slate-800">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-900/20 text-xl">V</div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">وکیل مجازی</h1>
                            <span className="text-xs text-slate-400">دستیار هوشمند حقوقی</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium group",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 translate-x-[-4px]"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-[-4px]"
                                )}
                            >
                                <Icon className={clsx("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-emerald-400")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-xl transition duration-200 group"
                    >
                        <LogOut className="h-5 w-5 group-hover:text-red-300" />
                        <span>خروج از حساب</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center md:hidden z-20 sticky top-0">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl active:scale-95 transition"
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label="منو"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    <h1 className="text-lg font-bold text-slate-800">وکیل مجازی</h1>

                    <Link
                        to="/cases/new"
                        className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                        aria-label="پرونده جدید"
                    >
                        <Plus className="h-5 w-5" />
                    </Link>
                </header>

                {/* Mobile Slide-out Menu (RTL: opens from right) */}
                <div
                    className={clsx(
                        "fixed inset-0 z-30 md:hidden transition-all duration-300 ease-spring",
                        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <nav
                        ref={menuRef}
                        id="mobile-menu"
                        className={clsx(
                            "absolute top-0 right-0 bottom-0 w-[80%] max-w-xs bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                        )}
                    >
                        {/* Profile Preview */}
                        <div className="p-6 border-b border-slate-800 flex items-center gap-4 bg-slate-800/50">
                            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/20 text-white">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-lg">کاربر مهمان</div>
                                <Link to="/settings" className="text-sm text-emerald-400 hover:text-emerald-300">مشاهده پروفایل</Link>
                            </div>
                        </div>

                        {/* Nav Items */}
                        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            <Link
                                to="/cases/new"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 mb-6 hover:brightness-110 transition"
                            >
                                <Plus className="h-5 w-5" />
                                <span>ایجاد پرونده جدید</span>
                            </Link>

                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium",
                                            isActive
                                                ? "bg-slate-800 text-white border-r-4 border-emerald-500"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Icon className={clsx("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-500")} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Logout */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl transition font-medium"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>خروج از حساب</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 p-4 md:p-8 scroll-smooth">
                    <div className="max-w-6xl mx-auto w-full pb-20 md:pb-0">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center py-2 fixed bottom-0 left-0 right-0 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    {[
                        { name: 'داشبورد', path: '/dashboard', icon: Home },
                        { name: 'پرونده‌ها', path: '/cases', icon: FolderOpen },
                        { name: 'جدید', path: '/cases/new', icon: Plus, highlight: true },
                        { name: 'تنظیمات', path: '/settings', icon: Settings },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex flex-col items-center gap-1 min-w-[64px] py-1 rounded-xl transition-all relative",
                                    item.highlight ? "text-emerald-600 -mt-6" : (isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600")
                                )}
                            >
                                {item.highlight ? (
                                    <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white mb-1">
                                        <Icon className="h-7 w-7" />
                                    </div>
                                ) : (
                                    <Icon className={clsx("h-6 w-6 transition-transform", isActive && "scale-110")} />
                                )}
                                <span className={clsx("text-[10px] font-medium", item.highlight && "font-bold")}>{item.name}</span>
                                {isActive && !item.highlight && (
                                    <span className="absolute -top-3 w-1 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
