import React, { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { UserCircle, Settings, FileText, Edit3, Activity, CheckCircle2, X } from 'lucide-react';

interface NotificationCounts {
    pengajuan_baru: number;
    perlu_direvisi: number;
    diterima: number;
    kegiatan_berjalan: number;
    selesai: number;
}

export default function ProfileDropdown() {
    const { auth } = usePage().props as any;
    const user = auth?.user ?? null;
    const [open, setOpen] = useState(false);
    const [counts, setCounts] = useState<NotificationCounts | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notification counts
    useEffect(() => {
        if (!open) return;
        fetch('/admin/api/notifications')
            .then(r => r.json())
            .then(setCounts)
            .catch(() => {});
    }, [open]);

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
    const badgeCount = (counts?.pengajuan_baru ?? 0) + (counts?.perlu_direvisi ?? 0);

    const navigateTo = (url: string) => {
        setOpen(false);
        router.visit(url);
    };

    const notificationItems = [
        { icon: FileText, label: 'Pengajuan Baru', count: counts?.pengajuan_baru, url: '/admin/pengajuan?status=diproses', color: '#3b82f6' },
        { icon: Edit3, label: 'Perlu Direvisi', count: counts?.perlu_direvisi, url: '/admin/pengajuan?status=direvisi', color: '#f59e0b' },
        { icon: Activity, label: 'Kegiatan Berjalan', count: counts?.kegiatan_berjalan, url: '/admin/aktivitas', color: '#3b82f6' },
        { icon: CheckCircle2, label: 'Selesai', count: counts?.selesai, url: '/admin/pengajuan?status=selesai', color: '#10b981' },
    ];

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* Avatar Button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    backgroundColor: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#52525b', border: '1px solid #e4e4e7', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#e4e4e7'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = '#f4f4f5'; }}
            >
                {initial}
                {/* Badge */}
                {badgeCount > 0 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        backgroundColor: '#ef4444', color: 'white',
                        fontSize: '10px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid white',
                    }}>
                        {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: '300px', backgroundColor: 'white',
                    borderRadius: '14px', boxShadow: '0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
                    overflow: 'hidden', zIndex: 9999,
                    animation: 'dropSlide 0.12s ease',
                }}>
                    {/* Profile Info */}
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#2563eb', fontSize: '16px', fontWeight: 700, flexShrink: 0,
                        }}>
                            {initial}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </div>
                            <div style={{
                                display: 'inline-block', marginTop: '4px', padding: '2px 8px',
                                borderRadius: '4px', backgroundColor: user.role === 'admin' ? '#fef3c7' : '#dbeafe',
                                color: user.role === 'admin' ? '#92400e' : '#1e40af',
                                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                {user.role}
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                    {/* Notifications */}
                    <div style={{ padding: '12px 0' }}>
                        <div style={{ padding: '0 16px 8px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Aktivitas Terkini
                        </div>
                        {counts ? notificationItems.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={i}
                                    onClick={() => navigateTo(item.url)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '8px 16px', border: 'none', background: 'none',
                                        cursor: 'pointer', transition: 'background 0.1s', textAlign: 'left',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget).style.backgroundColor = '#f8fafc'; }}
                                    onMouseLeave={e => { (e.currentTarget).style.backgroundColor = 'transparent'; }}
                                >
                                    <Icon size={15} style={{ color: item.color, flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontSize: '13px', color: '#334155', fontWeight: 500 }}>{item.label}</span>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 700, color: (item.count ?? 0) > 0 ? '#0f172a' : '#94a3b8',
                                        minWidth: '20px', textAlign: 'right',
                                    }}>
                                        {item.count ?? 0}
                                    </span>
                                </button>
                            );
                        }) : (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                Memuat...
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

                    {/* Profile Link */}
                    <div style={{ padding: '8px 0' }}>
                        <button
                            onClick={() => navigateTo('/admin/profile')}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '8px 16px', border: 'none', background: 'none',
                                cursor: 'pointer', transition: 'background 0.1s', textAlign: 'left',
                            }}
                            onMouseEnter={e => { (e.currentTarget).style.backgroundColor = '#f8fafc'; }}
                            onMouseLeave={e => { (e.currentTarget).style.backgroundColor = 'transparent'; }}
                        >
                            <Settings size={15} style={{ color: '#64748b', flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>Pengaturan Akun</span>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes dropSlide { from { opacity: 0; transform: translateY(-4px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </div>
    );
}
