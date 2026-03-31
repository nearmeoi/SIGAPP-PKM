import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
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
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

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



const Dashboard: React.FC<any> = ({ pkmMapData = [], pieChartData = [], barChartData = null, recentLogs = [] }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const statusCfg: Record<string, { label: string; text: string; bg: string; dot: string }> = {
        diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
        diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
        direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
        ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
        selesai: { label: 'Selesai', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // To prevent hydration mismatch issues for charts and leaflet
    if (!isMounted) return null;

    return (
        <AdminLayout title="Overview">
            {/* Interactive Map */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm mb-8 overflow-hidden flex flex-col items-stretch z-10 w-full relative">
                <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50">
                    <h2 className="text-[14px] font-semibold text-zinc-900">Sebaran Lokasi PKM</h2>
                    <p className="text-[12px] text-zinc-500 mt-0.5">Titik lokasi PKM yang berlangsung & selesai (Hover atau klik penanda untuk melihat wilayah detail)</p>
                </div>
                <div className="h-[500px] w-full relative z-0">
                    <MapContainer
                        center={[-1.5, 121]}
                        zoom={5}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
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
                                    <div className="min-w-[150px]">
                                        <div className="font-semibold text-[13px] text-zinc-900 mb-1 leading-tight">{pkm.nama}</div>
                                        <div className="text-[11px] text-zinc-500 mb-2">{pkm.jenis_nama}</div>
                                        <div className="flex gap-2 text-[10px] font-medium uppercase tracking-wider">
                                            <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">TH {pkm.tahun}</span>
                                            <span className={`px-1.5 py-0.5 rounded text-white ${pkm.status === 'selesai' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                                {pkm.status}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>



            {/* Bottom Row: Visualizations (Pie + Bar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                
                {/* Pie Chart: Sebaran Jenis PKM */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 relative flex flex-col h-full min-h-[300px]">
                        <div className="mb-4">
                            <h2 className="text-[14px] font-semibold text-zinc-900">Sebaran Jenis PKM</h2>
                            <p className="text-[12px] text-zinc-500 mt-0.5">Distribusi total pengajuan</p>
                        </div>
                        <div className="flex-1 w-full flex items-center justify-center">
                            <Doughnut 
                                data={{
                                    labels: pieChartData.map((d: any) => d.label),
                                    datasets: [{
                                        data: pieChartData.map((d: any) => d.count),
                                        backgroundColor: pieChartData.map((d: any) => d.color),
                                        borderColor: '#ffffff',
                                        borderWidth: 2,
                                        hoverOffset: 4,
                                    }]
                                }} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: '65%',
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { usePointStyle: true, pointStyle: 'circle', padding: 15, font: { size: 11, family: "'Inter', sans-serif" } }
                                        }
                                    }
                                }} 
                            />
                        </div>
                    </div>

                    {/* Bar Chart: Tren Pertahun */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 relative flex flex-col h-full min-h-[300px]">
                        <div className="mb-4">
                            <h2 className="text-[14px] font-semibold text-zinc-900">Tren PKM per Tahun</h2>
                            <p className="text-[12px] text-zinc-500 mt-0.5">Jumlah PKM berdasarkan jenis</p>
                        </div>
                        <div className="flex-1 w-full">
                            {barChartData?.labels ? (
                                <Bar 
                                    data={barChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: { usePointStyle: true, pointStyle: 'circle', padding: 15, font: { size: 11, family: "'Inter', sans-serif" } }
                                            }
                                        },
                                        scales: {
                                            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                                            y: { beginAtZero: true, border: { dash: [4, 4] }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1, font: { size: 11 } } }
                                        }
                                    }} 
                                />
                            ) : (
                                <div className="text-[12px] text-zinc-400 flex items-center justify-center h-full">Tidak ada data</div>
                            )}
                        </div>
                    </div>


            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-leaflet-marker {
                    background: transparent;
                    border: none;
                }
                .marker-pin {
                    width: 32px;
                    height: 32px;
                    border-radius: 50% 50% 50% 0;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -16px 0 0 -16px;
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }
                .marker-pin i {
                    transform: rotate(45deg); /* correct icon rotation */
                    margin-top: 0 !important;
                }
                .marker-pulse {
                    width: 40px;
                    height: 40px;
                    border: 2px solid;
                    border-radius: 50%;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    margin: -20px 0 0 -20px;
                    animation: pulse 2s infinite ease-out;
                    z-index: 1;
                    opacity: 0.8;
                }
                @keyframes pulse {
                    0% {
                        transform: scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                    }
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .leaflet-popup-content {
                    margin: 12px 14px;
                }
                .leaflet-popup-tip {
                    background: white;
                }
            `}} />
        </AdminLayout>
    );
};

export default Dashboard;