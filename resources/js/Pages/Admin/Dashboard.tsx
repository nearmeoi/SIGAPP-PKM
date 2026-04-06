import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Activity, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import PkmMapDashboardCard from '../../Components/PkmMapDashboardCard';
import { PkmData } from '../../types';
import '../../../css/landing.css';

interface DashboardProps {
    stats: {
        totalPengajuan: number;
        pengajuanDiproses: number;
        pengajuanDiterima: number;
        pengajuanDitolak: number;
        totalPegawai: number;
        totalAktivitas: number;
    };
    recentPengajuan: any[];
    pkmMapData: any[];
    pieChartData: any[];
    barChartData: any;
}

export default function Dashboard({
    stats = { totalPengajuan: 0, pengajuanDiproses: 0, pengajuanDiterima: 0, pengajuanDitolak: 0, totalPegawai: 0, totalAktivitas: 0 },
    pkmMapData = [],
}: DashboardProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <AdminLayout title="Overview"><div className="h-screen bg-white animate-pulse rounded-xl" /></AdminLayout>;
    }

    const statCards = [
        { label: 'Pengajuan', value: stats.totalPengajuan, icon: FileText, color: 'text-poltekpar-primary', bg: 'bg-poltekpar-primary/10', iconBg: 'bg-poltekpar-primary', trend: 'Sistem Terpusat' },
        { label: 'Reviu', value: stats.pengajuanDiproses, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-500', trend: 'Perlu tindakan segera' },
        { label: 'Diterima', value: stats.pengajuanDiterima, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', trend: 'Sudah diverifikasi' },
        { label: 'Aktivitas PKM', value: stats.totalAktivitas, icon: Activity, color: 'text-poltekpar-navy', bg: 'bg-poltekpar-navy/10', iconBg: 'bg-poltekpar-navy', trend: 'Kegiatan berlangsung' },
    ];

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
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, index) => (
                    <div key={index} className="group bg-white p-7 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-poltekpar-primary/5 transition-all duration-300 flex flex-col relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                        <div className="flex items-center justify-between relative z-10 mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${card.iconBg} text-white flex items-center justify-center shadow-lg shadow-inherit`}>
                                <card.icon size={24} />
                            </div>
                            <div className="text-right">
                                <h3 className="text-[32px] font-black text-slate-900 leading-none tracking-tight">{card.value}</h3>
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[14px] font-extrabold text-slate-500 mb-1 uppercase tracking-widest">{card.label}</p>
                            <p className={`text-[11px] font-bold ${card.color} opacity-80 flex items-center gap-1`}>
                                <TrendingUp size={12} />
                                {card.trend}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Map + Chart (LandingCharts menggunakan pkmData dari MySQL) */}
            <PkmMapDashboardCard pkmData={pkmData} watchKey="admin-map" />
        </AdminLayout>
    );
}
