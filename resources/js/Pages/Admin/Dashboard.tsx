import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Users, 
    Activity,
    ChevronRight,
    TrendingUp
} from 'lucide-react';
import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    ChartTitle,
    Tooltip,
    Legend,
    Filler
);

// Fix leaflet icons natively
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

const createCustomIcon = (status: string, color: string) => {
    const markerColor = status === 'berlangsung' ? '#f59e0b' : color;
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="marker-pin" style="background-color: ${markerColor}">
                <i class="fa-solid fa-hands-holding-child"></i>
            </div>
            <div class="marker-pulse" style="border-color: ${markerColor}"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

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
    recentLogs: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
    stats = { totalPengajuan: 0, pengajuanDiproses: 0, pengajuanDiterima: 0, pengajuanDitolak: 0, totalPegawai: 0, totalAktivitas: 0 },
    pkmMapData = [], 
    pieChartData = [], 
    barChartData = null, 
    recentLogs = [] 
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const timeAgo = (dateString: string) => {
        if (!dateString) return '-';
        try {
            const now = new Date();
            const date = new Date(dateString);
            const diffMs = now.getTime() - date.getTime();
            if (isNaN(diffMs)) return '-';

            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return `${diffMins} menit yang lalu`;
            if (diffHours < 24) return `${diffHours} jam yang lalu`;
            if (diffDays < 7) return `${diffDays} hari yang lalu`;

            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return '-'; }
    };

    if (!isMounted) return <AdminLayout title="Overview"><div className="h-screen bg-white animate-pulse rounded-xl" /></AdminLayout>;

    const statCards = [
        { label: 'Total Pengajuan', value: stats.totalPengajuan, icon: FileText, color: 'text-zinc-600', bg: 'bg-zinc-50' },
        { label: 'Menunggu Review', value: stats.pengajuanDiproses, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Diterima', value: stats.pengajuanDiterima, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Ditolak', value: stats.pengajuanDitolak, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];

    return (
        <AdminLayout title="Overview">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[12px] font-medium text-zinc-500 mb-1 uppercase tracking-wider">{card.label}</p>
                            <h3 className="text-[24px] font-bold text-zinc-900 leading-none">{card.value}</h3>
                        </div>
                        <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.color} flex items-center justify-center`}>
                            <card.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                {/* Map Section */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Sebaran Lokasi PKM</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Lokasi pengabdian masyarakat di seluruh wilayah</p>
                        </div>
                        <Activity size={16} className="text-zinc-400" />
                    </div>
                    <div className="flex-1 relative z-0">
                        <MapContainer
                            center={[-1.5, 121]}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                attribution='Map data &copy; <a href="https://www.google.com/maps">Google</a>'
                                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            />
                            {pkmMapData.map((pkm: any) => (
                                <Marker
                                    key={`map-admin-${pkm.id}`}
                                    position={[pkm.lat, pkm.lng]}
                                    icon={createCustomIcon(pkm.status, pkm.warna_icon)}
                                >
                                    <Popup>
                                        <div className="min-w-[150px] p-1">
                                            <div className="font-bold text-[13px] text-zinc-900 mb-1 leading-tight">{pkm.nama}</div>
                                            <div className="text-[11px] text-zinc-500 mb-2">{pkm.jenis_nama}</div>
                                            <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white ${pkm.status === 'selesai' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                {pkm.status.toUpperCase()}
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Recent Activity Logs */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col h-[500px]">
                    <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Log Aktivitas Terbaru</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Pembaruan status pengajuan sistem</p>
                        </div>
                        <TrendingUp size={16} className="text-zinc-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {recentLogs.length > 0 ? recentLogs.map((log: any) => (
                            <div key={log.id} className="flex gap-3 relative">
                                <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_0_4px_rgba(99,102,241,0.1)]"></div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[13px] font-bold text-zinc-900">{log.title}</span>
                                        <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap uppercase tracking-tighter">{timeAgo(log.time)}</span>
                                    </div>
                                    <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">{log.desc}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Clock size={32} className="mb-2" />
                                <p className="text-[13px]">Belum ada aktivitas</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
                        <button className="w-full py-2 text-[12px] font-bold text-zinc-600 hover:text-zinc-900 transition-colors">Lihat Semua Riwayat</button>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm min-h-[350px] flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Komposisi Jenis PKM</h2>
                            <p className="text-[11px] text-zinc-500 mt-0.5">Persentase berdasarkan kategori pengajuan</p>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-[220px] h-[220px]">
                            <Doughnut 
                                data={{
                                    labels: pieChartData.map((d: any) => d.label),
                                    datasets: [{
                                        data: pieChartData.map((d: any) => d.count),
                                        backgroundColor: pieChartData.map((d: any) => d.color),
                                        borderColor: '#ffffff',
                                        borderWidth: 2,
                                        hoverOffset: 8,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: '70%',
                                    plugins: {
                                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { size: 11, weight: '600' } } },
                                        tooltip: { backgroundColor: '#18181b', padding: 10, titleFont: { size: 12 }, bodyFont: { size: 12 }, usePointStyle: true }
                                    }
                                }} 
                            />
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm min-h-[350px] flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Tren Pertumbuhan PKM</h2>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Statistik pertumbuhan data tahun ke tahun</p>
                    </div>
                    <div className="flex-1">
                        {barChartData?.labels ? (
                            <Bar 
                                data={barChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { backgroundColor: '#18181b', padding: 10, cornerRadius: 8 }
                                    },
                                    scales: {
                                        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '500' } } },
                                        y: { beginAtZero: true, border: { dash: [4, 4] }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1, font: { size: 11 } } }
                                    }
                                }} 
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-zinc-400 text-[13px] italic">Data tren belum tersedia</div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-leaflet-marker { background: transparent; border: none; }
                .marker-pin {
                    width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
                    position: absolute; transform: rotate(-45deg);
                    left: 50%; top: 50%; margin: -16px 0 0 -16px;
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                    display: flex; align-items: center; justify-content: center; z-index: 2;
                }
                .marker-pin i { transform: rotate(45deg); color: white; font-size: 14px; }
                .marker-pulse {
                    width: 40px; height: 40px; border: 2px solid; border-radius: 50%;
                    position: absolute; left: 50%; top: 50%; margin: -20px 0 0 -20px;
                    animation: pulse 2s infinite ease-out; z-index: 1; opacity: 0.8;
                }
                @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
                .leaflet-popup-content-wrapper { border-radius: 12px; }
            `}} />
        </AdminLayout>
    );
};

export default Dashboard;
