import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    FolderOpen,
    LogOut,
    Search,
    Activity,
    MessageSquare,
    Grid,
    Database,
    ChevronDown,
    ChevronRight,
    FileText,
    UserCircle,
    Command
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

interface NavItem {
    label: string;
    href?: string;
    icon: React.ElementType;
    children?: { label: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Pengajuan', href: '/admin/pengajuan', icon: FileText },
    { label: 'Kegiatan', href: '/admin/aktivitas', icon: Activity },
    {
        label: 'Database',
        icon: Database,
        children: [
            { label: 'Pegawai', href: '/admin/pegawai', icon: Users },
            { label: 'Users', href: '/admin/users', icon: UserCircle },
            { label: 'Jenis PKM', href: '/admin/master/jenis-pkm', icon: Grid },
        ],
    },
    { label: 'Arsip', href: '/admin/arsip', icon: FolderOpen },
    { label: 'Testimoni', href: '/admin/testimoni', icon: MessageSquare },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
    const { url } = usePage();

    const isActive = (href?: string) => {
        if (!href || href === '#') return false;
        if (href === '/admin') return url === '/admin' || url === '/admin/dashboard';
        return url.startsWith(href);
    };

    const isChildrenActive = (childrenItems?: { href: string }[]) => {
        if (!childrenItems) return false;
        return childrenItems.some(child => isActive(child.href));
    };

    const [openDropdowns, setOpenDropdowns] = React.useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        navItems.forEach(item => {
            if (item.children) init[item.label] = isChildrenActive(item.children) || true; // Keep open by default if you want
        });
        return init;
    });

    const toggleDropdown = (label: string) => {
        setOpenDropdowns(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <div
            className="flex min-h-screen bg-[#fafafa] selection:bg-indigo-100 selection:text-indigo-900"
            style={{ fontFamily: "'Inter', 'Figtree', system-ui, sans-serif" }}
        >
            {/* ─── Sidebar ─── */}
            {/* Sidebar */}
            <aside
                className="w-64 flex flex-col flex-shrink-0 fixed top-0 left-0 h-screen z-40 pt-4 bg-zinc-900 border-r border-zinc-800"
                style={{ overflowY: 'auto', overflowX: 'hidden' }}
            >
                {/* Brand */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-zinc-800 flex-shrink-0">
                    <img src="/logo-poltekpar.png" alt="Poltekpar Logo" className="w-8 h-8 object-contain flex-shrink-0" />
                    <span className="self-center text-[17px] font-bold text-white tracking-tight">SIGAP P3M</span>
                </div>

                {/* Nav Label */}
                <div className="px-5 pt-6 pb-2 flex-shrink-0">
                    <span className="text-[11px] font-semibold text-zinc-500 tracking-wider">Overview</span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-1 space-y-0.5">
                    {navItems.map((item) => {
                        const hasChildren = !!item.children;
                        const childActive = isChildrenActive(item.children);
                        const active = item.href ? isActive(item.href) : childActive;
                        const isOpen = openDropdowns[item.label];
                        const Icon = item.icon;

                        if (hasChildren) {
                            return (
                                <div key={item.label} className="mt-4 mb-2">
                                    <button
                                        onClick={() => toggleDropdown(item.label)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-colors duration-150 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={16} className={active ? 'text-white' : 'text-zinc-500'} />
                                            <span className={active ? 'text-white font-semibold' : ''}>{item.label}</span>
                                        </div>
                                        {isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
                                    </button>

                                    {isOpen && (
                                        <div className="mt-1 ml-4 pl-3 space-y-0.5 border-l border-zinc-700">
                                            {item.children?.map(child => {
                                                const childIsActive = isActive(child.href);
                                                return (
                                                    <Link
                                                        key={child.label}
                                                        href={child.href}
                                                        className={`block px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 ${childIsActive
                                                            ? 'text-white font-medium bg-zinc-800'
                                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                                            }`}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href || '#'}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all duration-150 ${active
                                    ? 'bg-zinc-800 text-white font-medium shadow-sm ring-1 ring-zinc-700'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                                    }`}
                            >
                                <Icon size={16} className={active ? 'text-white' : 'text-zinc-500'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Logout */}
                <div className="p-4 border-t border-zinc-800">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex items-center w-full p-3 rounded-lg text-[14px] font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all group"
                    >
                        <LogOut size={20} className="text-red-500 transition duration-75" />
                        <span className="ms-3">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* ─── Main Content ─── */}
            <main
                className="flex-1 flex flex-col min-h-screen"
                style={{ marginLeft: '256px', minWidth: 0 }}
            >
                {/* Header */}
                <header className="h-[56px] bg-white/80 backdrop-blur-md border-b border-zinc-200/80 flex items-center justify-between px-6 sticky top-0 z-40 flex-shrink-0">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group cursor-text">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-500 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search anything relative to SIGAP..."
                                className="w-full bg-zinc-50 hover:bg-zinc-100 pl-9 pr-12 py-1.5 rounded-md border border-zinc-200 text-[13px] text-zinc-700 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-300 transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                                <kbd className="hidden sm:inline-block bg-white border border-zinc-200 rounded px-1.5 text-[10px] font-sans font-medium text-zinc-500 shadow-sm"><Command size={10} className="inline mb-[2px]" /> K</kbd>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200 shadow-sm text-[12px] font-medium">A</div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6 md:p-8 flex-1 min-w-0 max-w-[1400px] mx-auto w-full">
                    {title && (
                        <div className="mb-6">
                            <h1 className="text-[22px] font-bold text-zinc-900 tracking-tight">{title}</h1>
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
