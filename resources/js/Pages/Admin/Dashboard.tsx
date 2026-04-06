import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    Layers,
    CalendarClock,
    ClipboardList,
    LoaderCircle,
    CircleCheck,
    TrendingUp,
} from 'lucide-react';
import PkmMapDashboardCard from '../../Components/PkmMapDashboardCard';
import { PkmData } from '../../types';
import '../../../css/landing.css';

interface DashboardProps {
    stats: {
        totalPengajuan: number;
        pengajuanDiproses: number;
        pengajuanDiterima: number;
        pengajuanDitolak: number;
        pengajuanDirevisi: number;
        totalAktivitas: number;
        aktivitasBelumMulai: number;
        aktivitasPersiapan: number;
        aktivitasBerjalan: number;
        aktivitasSelesai: number;
    };
    recentPengajuan: any[];
    pkmMapData: any[];
    pieChartData: any[];
    barChartData: any;
}

export default function Dashboard({
    stats = {
        totalPengajuan: 0,
        pengajuanDiproses: 0,
        pengajuanDiterima: 0,
        pengajuanDitolak: 0,
        pengajuanDirevisi: 0,
        totalAktivitas: 0,
        aktivitasBelumMulai: 0,
        aktivitasPersiapan: 0,
        aktivitasBerjalan: 0,
        aktivitasSelesai: 0,
    },
    pkmMapData = [],
}: DashboardProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <AdminLayout title="Overview"><div className="h-screen bg-white animate-pulse rounded-xl" /></AdminLayout>;
    }

    const pengajuanCards = [
        { label: 'Pengajuan', value: stats.totalPengajuan, icon: FileText, color: 'text-poltekpar-primary', bg: 'bg-poltekpar-primary/10', iconBg: 'bg-poltekpar-primary', trend: 'Total semua pengajuan', filter: undefined },
        { label: 'Reviu', value: stats.pengajuanDiproses, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'Perlu tindakan segera', filter: 'diproses' },
        { label: 'Diterima', value: stats.pengajuanDiterima, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', trend: 'Sudah diverifikasi', filter: 'diterima' },
        { label: 'Ditolak', value: stats.pengajuanDitolak, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', iconBg: 'bg-rose-500', trend: 'Tidak memenuhi syarat', filter: 'ditolak' },
        { label: 'Direvisi', value: stats.pengajuanDirevisi, icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50', iconBg: 'bg-orange-500', trend: 'Menunggu perbaikan', filter: 'direvisi' },
    ];

    const aktivitasCards = [
        { label: 'Total Aktivitas', value: stats.totalAktivitas, icon: Layers, color: 'text-poltekpar-navy', bg: 'bg-poltekpar-navy/10', iconBg: 'bg-poltekpar-navy', trend: 'Seluruh kegiatan tercatat', filter: undefined },
        { label: 'PKM Belum Mulai', value: stats.aktivitasBelumMulai, icon: CalendarClock, color: 'text-slate-500', bg: 'bg-slate-100', iconBg: 'bg-slate-400', trend: 'Diterima, belum ada kegiatan', filter: 'belum_mulai' },
        { label: 'PKM Persiapan', value: stats.aktivitasPersiapan, icon: ClipboardList, color: 'text-sky-600', bg: 'bg-sky-50', iconBg: 'bg-sky-500', trend: 'Tahap persiapan kegiatan', filter: 'persiapan' },
        { label: 'PKM Berjalan', value: stats.aktivitasBerjalan, icon: LoaderCircle, color: 'text-blue-600', bg: 'bg-blue-50', iconBg: 'bg-blue-500', trend: 'Sedang berlangsung', filter: 'berjalan' },
        { label: 'PKM Selesai', value: stats.aktivitasSelesai, icon: CircleCheck, color: 'text-violet-600', bg: 'bg-violet-50', iconBg: 'bg-violet-500', trend: 'Telah diselesaikan', filter: 'selesai' },
    ];

    const handleCardClick = (type: 'pengajuan' | 'aktivitas', status?: string) => {
        const params: Record<string, string | undefined> = {};
        if (status) params.status = status;
        const url = type === 'pengajuan' ? '/admin/pengajuan' : '/admin/aktivitas';
        router.get(url, params, { preserveState: true });
    };

    const pkmData: PkmData[] = pkmMapData.map((pkm: any) => ({
        id: pkm.id,
        nama: pkm.nama,
        tahun: pkm.tahun,
        status: pkm.status,
        deskripsi: pkm.deskripsi || '',
        thumbnail: pkm.thumbnail || null,
        jenis_pkm: pkm.jenis_pkm || pkm.jenis_nama || '',
        provinsi: pkm.provinsi || '',
        kabupaten: pkm.kabupaten || '',
        kecamatan: pkm.kecamatan || '',
        desa: pkm.desa || '',
        lat: pkm.lat,
        lng: pkm.lng,
        total_anggaran: Number(pkm.total_anggaran || 0),
        tim_kegiatan: pkm.tim_kegiatan || [],
        testimoni: pkm.testimoni || [],
        arsip_laporan: pkm.arsip_laporan || null,
        dokumentasi: pkm.dokumentasi || null,
        tambahan: pkm.tambahan || [],
    }));

    return (
        <AdminLayout title="System Overview">
            {/* Pengajuan Stats */}
            <div className="mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Status Pengajuan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {pengajuanCards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleCardClick('pengajuan', card.filter)}
                            className="group bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-poltekpar-primary/5 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.98] text-left w-full"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                            <div className="flex items-center justify-between relative z-10 mb-4">
                                <div className={`w-12 h-12 rounded-xl ${card.iconBg} text-white flex items-center justify-center shadow-lg shadow-inherit`}>
                                    <card.icon size={20} />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{card.value}</h3>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[12px] font-extrabold text-slate-500 mb-0.5 uppercase tracking-wider">{card.label}</p>
                                <p className={`text-[10px] font-bold ${card.color} opacity-80 flex items-center gap-1`}>
                                    <TrendingUp size={10} />
                                    {card.trend}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Aktivitas Stats */}
            <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Status Aktivitas PKM</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {aktivitasCards.map((card, index) => (
                        <button
                            key={index}
                            onClick={() => handleCardClick('aktivitas', card.filter)}
                            className="group bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-poltekpar-primary/5 transition-all duration-300 flex flex-col relative overflow-hidden cursor-pointer active:scale-[0.98] text-left w-full"
                        >
                            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                            <div className="flex items-center justify-between relative z-10 mb-4">
                                <div className={`w-12 h-12 rounded-xl ${card.iconBg} text-white flex items-center justify-center shadow-lg shadow-inherit`}>
                                    <card.icon size={20} />
                                </div>
                                <div className="text-right">
                                    <h3 className="text-2xl font-black text-slate-900 leading-none tracking-tight">{card.value}</h3>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[12px] font-extrabold text-slate-500 mb-0.5 uppercase tracking-wider">{card.label}</p>
                                <p className={`text-[10px] font-bold ${card.color} opacity-80 flex items-center gap-1`}>
                                    <TrendingUp size={10} />
                                    {card.trend}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Map + Chart */}
            <PkmMapDashboardCard pkmData={pkmData} watchKey="admin-map" />
        </AdminLayout>
    );
}
