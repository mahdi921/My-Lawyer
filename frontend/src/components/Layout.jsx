import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Settings, LogOut, FileText, PieChart } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const navItems = [
        { name: 'داشبورد', path: '/dashboard', icon: Home },
        { name: 'پرونده‌ها', path: '/cases', icon: FolderOpen },
        { name: 'تحلیل‌ها', path: '/analysis', icon: PieChart }, // Placeholder
        { name: 'تنظیمات', path: '/settings', icon: Settings }, // Placeholder
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
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
                        const isActive = location.pathname === item.path;
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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden z-10">
                    <h1 className="text-xl font-bold text-emerald-600">وکیل مجازی</h1>
                    <button onClick={handleLogout} className="text-gray-600">
                        <LogOut className="h-6 w-6" />
                    </button>
                </header>
                <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
