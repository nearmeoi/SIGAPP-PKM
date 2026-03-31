import React, { useState, useEffect, useRef } from 'react';
import { router, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types/index';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user ?? null;
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    if (!user) return null;

    const initial = user.name?.charAt(0)?.toUpperCase() || 'A';

    return (
        <div ref={dropdownRef} className="relative">
            {/* Avatar Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:bg-zinc-100 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-200"
            >
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-[13px] font-bold shadow-sm">
                    {initial}
                </div>
                <div className="hidden md:flex flex-col items-start pr-1 text-left">
                    <span className="text-[13px] font-semibold text-zinc-900 leading-none mb-1 max-w-[100px] truncate">{user.name}</span>
                    <span className="text-[10px] font-medium text-zinc-500 leading-none uppercase tracking-wide">{user.role}</span>
                </div>
                <ChevronDown size={14} className="text-zinc-400 hidden md:block" />
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex flex-shrink-0 items-center justify-center text-indigo-600 text-[16px] font-bold border border-indigo-100">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <div className="text-[14px] font-bold text-zinc-900 truncate">
                                {user.name}
                            </div>
                            <div className="text-[12px] font-medium text-zinc-500 truncate mb-1">
                                {user.email}
                            </div>
                            <div className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                {user.role}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-100" />

                    <div className="p-2 space-y-0.5">
                        <Link
                            href="/admin/profile"
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
                            onClick={() => setOpen(false)}
                        >
                            <Settings size={16} className="text-zinc-400 flex-shrink-0" />
                            Pengaturan Profil
                        </Link>
                    </div>

                    <div className="h-px bg-zinc-100" />

                    <div className="p-2">
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <LogOut size={16} className="text-red-500 flex-shrink-0" />
                            Sign Out
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}