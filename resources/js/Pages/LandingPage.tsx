import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import LandingCharts from '@/Components/LandingCharts';
import MapLegend from '@/Components/MapLegend';
import CTABanner from '@/Components/CTABanner';
import { resolvePublicPkmData } from '@/data/sigapData';
import { createPkmMarkerIcon } from '@/data/pkmMapVisuals';
import { PkmData } from '@/types';
import '../../css/landing.css';

// Leaflet Setup
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
    (L.Icon.Default.prototype as any)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

interface MapSizeInvalidatorProps {
    watchKey: string;
}

function MapSizeInvalidator({ watchKey }: MapSizeInvalidatorProps): null {
    const map = useMap();
    useEffect(() => {
        const runInvalidate = () => { map.invalidateSize(); };
        const timeoutId = window.setTimeout(runInvalidate, 200);
        return () => window.clearTimeout(timeoutId);
    }, [map, watchKey]);
    return null;
}

const MapSummaryOverlay: React.FC<{ total: number; selesai: number; berlangsung: number }> = ({ total, selesai, berlangsung }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="absolute bottom-8 left-8 z-[1000] flex items-end gap-3">
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 mb-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex items-center justify-center text-slate-500 hover:text-sigappa-primary hover:scale-105 active:scale-95 transition-all outline-none z-10"
                title={isCollapsed ? "Tampilkan Informasi Map" : "Sembunyikan Informasi Map"}
            >
                <i className={`fa-solid ${isCollapsed ? 'fa-chart-pie' : 'fa-chevron-left'} transition-transform duration-300`}></i>
            </button>

            {/* Container for Cards */}
            <div className={`flex items-end gap-3 transition-all duration-500 origin-bottom-left ${isCollapsed ? 'opacity-0 scale-y-0 translate-y-10 pointer-events-none absolute left-12 bottom-0' : 'opacity-100 scale-y-100 translate-y-0 relative'}`}>
                {/* Legend Card - Minimized Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/40 whitespace-nowrap">
                    <MapLegend className="bg-transparent border-none shadow-none" compact />
                </div>

                {/* Summary Card - Ultra Compact Horizontal Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/40 flex items-center gap-5 whitespace-nowrap mb-1">
                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-sigappa-primary/20 to-sigappa-primary/5 rounded-lg flex items-center justify-center text-sigappa-primary shadow-sm">
                            <i className="fa-solid fa-layer-group text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{total}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total PKM</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200/50"></div>

                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center text-green-600 shadow-sm">
                            <i className="fa-solid fa-circle-check text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{selesai}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Selesai</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-slate-200/50"></div>

                    <div className="flex items-center gap-2 px-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                            <i className="fa-solid fa-clock text-[10px]"></i>
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 leading-none">{berlangsung}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Berlangsung</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function LandingPage({ publicPkmData = null }: { publicPkmData?: PkmData[] | null }) {
    const [pkmData] = useState<PkmData[]>(() => resolvePublicPkmData(publicPkmData));
    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);

    const totalPkm = pkmData.length;
    const totalSelesai = pkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = pkmData.filter((item) => item.status === 'berlangsung').length;

    return (
        <Layout mainClassName="site-main-content" mainStyle={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Head title="Geospatial PKM Dashboard" />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col py-8">
                {/* Combined Map + Dashboard Card */}
                <div className="bg-white rounded-[48px] shadow-2xl shadow-sigappa-navy/5 border border-slate-100 overflow-hidden mb-8 p-6">
                    {/* Dashboard Evaluasi PKM Header */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Dashboard Evaluasi <span className="text-poltekpar-primary">PKM</span>
                        </h2>
                    </div>

                    {/* Map Section */}
                    <div className="relative w-full h-[70vh] overflow-hidden z-10">
                        <MapContainer
                            center={[-2.5, 118]}
                            zoom={5}
                            className="w-full h-full"
                            zoomControl={true}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            {pkmData.map((pkm) => (
                                <Marker
                                    key={pkm.id}
                                    position={[parseFloat(String(pkm.lat)), parseFloat(String(pkm.lng))]}
                                    icon={createPkmMarkerIcon(pkm.status)}
                                    eventHandlers={{ click: () => setSidebarPkm(pkm) }}
                                />
                            ))}
                            <MapSizeInvalidator watchKey="landing-map" />
                        </MapContainer>

                        {/* Summary & Legend Overlay - Bottom Left */}
                        <MapSummaryOverlay total={totalPkm} selesai={totalSelesai} berlangsung={totalBerlangsung} />

                        {/* Sidebar PKM Detail Overlay - Right Side to avoid overlap with Legend */}
                        <div className={`pk-detail-sidebar absolute top-8 bottom-8 right-8 w-[400px] max-w-[calc(100%-64px)] bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl z-[1100] p-8 overflow-y-auto transition-transform duration-700 border border-white/60 ${!sidebarPkm ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                            {sidebarPkm && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center justify-between">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sidebarPkm.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{sidebarPkm.status}</span>
                                        <button onClick={() => setSidebarPkm(null)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
                                    </div>
                                    <div className="aspect-video rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-slate-50 group">
                                        {sidebarPkm.thumbnail ? (
                                            <img src={sidebarPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-5xl"></i></div>
                                        )}
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{sidebarPkm.nama}</h3>
                                        <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Kegiatan</span>
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">{sidebarPkm.deskripsi}</p>
                                        </div>
                                        <div className="flex flex-col gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-location-dot"></i></div> {sidebarPkm.desa}, {sidebarPkm.kecamatan}, {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}</div>
                                            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-calendar"></i></div> Tahun {sidebarPkm.tahun}</div>
                                        </div>

                                        {/* Testimoni */}
                                        {sidebarPkm.testimoni && sidebarPkm.testimoni.length > 0 && (
                                            <div className="pt-4 border-t border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Testimoni</span>
                                                <div className="space-y-3">
                                                    {sidebarPkm.testimoni.map((t, i) => (
                                                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-bold text-slate-700">{t.nama_pemberi}</span>
                                                                <div className="flex gap-0.5">
                                                                    {[...Array(5)].map((_, si) => (
                                                                        <i key={si} className={`fa-solid fa-star text-[10px] ${si < t.rating ? 'text-poltekpar-gold' : 'text-slate-200'}`}></i>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 leading-relaxed">{t.pesan_ulasan}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Evaluasi PKM */}
                    <div className="border-t border-slate-100">
                        <LandingCharts pkmData={pkmData} />
                    </div>
                </div>

                {/* CTA Section */}
                <CTABanner />
            </div>
        </Layout>
    );
}
