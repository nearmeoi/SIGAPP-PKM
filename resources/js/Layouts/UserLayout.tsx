import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    LogOut,
    Bell,
    Search,
} from 'lucide-react';

interface UserLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Pengajuan Saya', href: '/pengajuan', icon: FileText },
    { label: 'Buat Pengajuan', href: '/pengajuan/create', icon: PlusCircle },
];

const UserLayout: React.FC<UserLayoutProps> = ({ children, title }) => {
    const { url } = usePage();

    const isActive = (href: string) => {
        if (href === '/dashboard') return url === '/dashboard';
        return url.startsWith(href) && href !== '/dashboard';
    };

    return (
        <div className="flex min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" }}>

            {/* Sidebar */}
            <aside className="w-[220px] flex flex-col flex-shrink-0 fixed top-0 left-0 bottom-0 z-50 overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #1b2a4a 0%, #162240 100%)' }}>

                <div className="px-5 pt-5 pb-5 flex items-center gap-3">
                    <img src="/logo-poltekpar.png" alt="Logo" className="w-11 h-11 object-contain flex-shrink-0" />
                    <div>
                        <div className="text-white font-extrabold text-[17px] tracking-wide leading-tight">SIGAP</div>
                        <div className="text-slate-300 text-[11px] font-medium tracking-wide">Portal Pengguna</div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-[14px] transition-all duration-200 ${active
                                    ? 'bg-white/20 text-white font-bold shadow-sm'
                                    : 'text-slate-300 font-semibold hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <Icon size={19} className={active ? 'text-white' : 'text-slate-400'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/10">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={17} />
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 ml-[220px] flex flex-col min-h-screen" style={{ backgroundColor: '#eef2f6' }}>
                <header className="h-[60px] bg-white border-b border-slate-200/80 flex items-center justify-between px-7 sticky top-0 z-40 shadow-sm">
                    <h1 className="text-[15px] font-bold text-slate-800">{title || ''}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden lg:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={15} className="text-slate-400" />
                            </div>
                            <input type="text" placeholder="Search..." className="bg-slate-100 w-56 pl-9 pr-3 py-[7px] rounded-lg border-none text-[13px] focus:ring-2 focus:ring-blue-500 outline-none text-slate-600" />
                        </div>
                        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell size={19} />
                        </button>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ backgroundColor: '#1b2a4a' }}>
                            U
                        </div>
                    </div>
                </header>
                <div className="p-7 flex-1">{children}</div>
                <footer className="px-7 py-4 text-center text-[12px] text-slate-400 border-t border-slate-200/60">
                    © 2024 SIGAP Enterprise Admin Console. All rights reserved.
                </footer>
            </main>
        </div>
    );
};

export default UserLayout;
