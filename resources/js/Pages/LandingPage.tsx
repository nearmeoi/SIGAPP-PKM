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
import { createPkmMarkerIcon, getPkmTypeMeta, getPkmStatusMeta } from '@/data/pkmMapVisuals';
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

const MapSummaryOverlay: React.FC<{
    total: number;
    selesai: number;
    berlangsung: number;
    forceHide?: boolean;
    selectedTypes: string[];
    onToggleType: (t: string) => void;
    selectedStatuses: string[];
    onToggleStatus: (s: string) => void;
}> = ({ total, selesai, berlangsung, forceHide = false, selectedTypes, onToggleType, selectedStatuses, onToggleStatus }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`absolute bottom-8 left-8 z-[1000] flex items-end gap-3 pointer-events-none transition-all duration-500 ease-in-out ${forceHide ? 'opacity-0 translate-y-8 scale-90 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 mb-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex items-center justify-center text-slate-500 hover:text-sigappa-primary hover:scale-105 active:scale-95 transition-all outline-none z-10 pointer-events-auto"
                title={isCollapsed ? "Tampilkan Informasi Map" : "Sembunyikan Informasi Map"}
            >
                <i className={`fa-solid ${isCollapsed ? 'fa-chart-pie' : 'fa-chevron-left'} transition-transform duration-300`}></i>
            </button>

            {/* Container for Cards */}
            <div className={`flex items-end gap-3 transition-all duration-500 ease-in-out origin-bottom-left ${isCollapsed ? 'opacity-0 scale-0 -translate-x-10 translate-y-6 pointer-events-none absolute left-12 bottom-0' : 'opacity-100 scale-100 translate-x-0 translate-y-0 relative'}`}>
                {/* Legend Card - Minimized Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/40 whitespace-nowrap pointer-events-auto">
                    <MapLegend
                        className="bg-transparent border-none shadow-none"
                        compact
                        selectedTypes={selectedTypes}
                        onToggleType={onToggleType}
                        selectedStatuses={selectedStatuses}
                        onToggleStatus={onToggleStatus}
                    />
                </div>

                {/* Summary Card - Ultra Compact Horizontal Glass */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/40 flex items-center gap-5 whitespace-nowrap mb-1 pointer-events-auto">
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

    const [isListSidebarOpen, setIsListSidebarOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [listSelectedPkm, setListSelectedPkm] = useState<PkmData | null>(null);

    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const toggleType = (key: string) => {
        setSelectedTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleStatus = (key: string) => {
        setSelectedStatuses(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const filteredPkmData = pkmData.filter(pkm => {
        const matchesSearch = pkm.nama.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.desa.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.kabupaten.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkm.provinsi.toLowerCase().includes(searchKeyword.toLowerCase());

        const typeMeta = getPkmTypeMeta(pkm);
        const statusMeta = getPkmStatusMeta(pkm.status);

        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(typeMeta.key);
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusMeta.key);

        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPkm = filteredPkmData.length;
    const totalSelesai = filteredPkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = filteredPkmData.filter((item) => item.status === 'berlangsung').length;

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
                    <div className="relative w-full h-[115vh] overflow-hidden z-10">
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
                            {filteredPkmData.map((pkm) => (
                                <Marker
                                    key={pkm.id}
                                    position={[parseFloat(String(pkm.lat)), parseFloat(String(pkm.lng))]}
                                    icon={createPkmMarkerIcon(pkm)}
                                    eventHandlers={{ click: () => setSidebarPkm(pkm) }}
                                />
                            ))}
                            <MapSizeInvalidator watchKey="landing-map" />
                        </MapContainer>

                        {/* Top Right Action Button */}
                        <div className={`absolute top-6 right-6 z-[1000] transition-all duration-500 ease-in-out ${isListSidebarOpen || !!sidebarPkm ? 'opacity-0 -translate-y-4 pointer-events-none scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
                            <button
                                onClick={() => {
                                    setIsListSidebarOpen(true);
                                    setSidebarPkm(null);
                                    setListSelectedPkm(null);
                                }}
                                className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3 text-sm font-black text-slate-700 hover:text-poltekpar-primary hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <i className="fa-solid fa-list-ul"></i>
                                DAFTAR KEGIATAN PKM
                            </button>
                        </div>

                        {/* Summary & Legend Overlay - Bottom Left */}
                        <MapSummaryOverlay
                            total={totalPkm}
                            selesai={totalSelesai}
                            berlangsung={totalBerlangsung}
                            forceHide={isListSidebarOpen || !!sidebarPkm}
                            selectedTypes={selectedTypes}
                            onToggleType={toggleType}
                            selectedStatuses={selectedStatuses}
                            onToggleStatus={toggleStatus}
                        />

                        {/* Sidebar PKM Detail Overlay - Right Side to avoid overlap with Legend */}
                        <div className={`pk-detail-sidebar absolute top-8 bottom-8 right-8 w-[400px] max-w-[calc(100%-64px)] bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl z-[1100] p-8 overflow-y-auto transition-transform duration-700 border border-white/60 ${!sidebarPkm ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                            {sidebarPkm && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="flex items-center justify-between">
                                        {(() => {
                                            const s = sidebarPkm.status;
                                            const m = getPkmStatusMeta(s);
                                            const cls = s === 'selesai' ? 'bg-emerald-100 text-emerald-700' : s === 'direvisi' ? 'bg-orange-100 text-orange-700' : s === 'diproses' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
                                            return (
                                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>
                                                    <i className={`fa-solid ${m.markerIcon}`}></i> {m.label}
                                                </span>
                                            );
                                        })()}
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

                                        {/* Tim Pelaksana */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tim Pelaksana</span>
                                            {sidebarPkm.tim_kegiatan && sidebarPkm.tim_kegiatan.length > 0 ? (
                                                <div className="space-y-2">
                                                    {sidebarPkm.tim_kegiatan.map((t, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="w-8 h-8 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-[10px] font-black">{t.nama?.charAt(0)?.toUpperCase() || '?'}</div>
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-700 block leading-tight">{t.nama}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.peran}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                    <span className="text-xs font-bold text-slate-400">Belum ada data tim pelaksana</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Anggaran */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Anggaran</span>
                                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center"><i className="fa-solid fa-money-bill-wave"></i></div>
                                                <span className="text-lg font-black text-poltekpar-primary">Rp {Number(sidebarPkm.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                            </div>
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

                        {/* Sidebar PKM List Overlay */}
                        <div className={`absolute top-8 bottom-8 right-8 w-[400px] max-w-[calc(100%-64px)] bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl z-[1150] overflow-hidden flex flex-col transition-transform duration-700 border border-white/60 ${!isListSidebarOpen ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                            {listSelectedPkm ? (
                                <>
                                    <div className="p-8 pb-4 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setListSelectedPkm(null)} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center flex-shrink-0">
                                                <i className="fa-solid fa-arrow-left"></i>
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{listSelectedPkm.nama}</h3>
                                                {(() => {
                                                    const s = listSelectedPkm.status;
                                                    const m = getPkmStatusMeta(s);
                                                    const cls = s === 'selesai' ? 'bg-emerald-100 text-emerald-700' : s === 'direvisi' ? 'bg-orange-100 text-orange-700' : s === 'diproses' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
                                                    return (
                                                        <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cls}`}>
                                                            <i className={`fa-solid ${m.markerIcon}`}></i> {m.label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <button onClick={() => { setIsListSidebarOpen(false); setListSelectedPkm(null); }} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-8 overflow-y-auto flex-1 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 custom-scrollbar">
                                        <div className="aspect-video rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-slate-50 group">
                                            {listSelectedPkm.thumbnail ? (
                                                <img src={listSelectedPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-5xl"></i></div>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Kegiatan</span>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">{listSelectedPkm.deskripsi}</p>
                                            </div>
                                            <div className="flex flex-col gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-location-dot"></i></div> {listSelectedPkm.desa}, {listSelectedPkm.kecamatan}, {listSelectedPkm.kabupaten}, {listSelectedPkm.provinsi}</div>
                                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-calendar"></i></div> Tahun {listSelectedPkm.tahun}</div>
                                            </div>

                                            {/* Tim Pelaksana */}
                                            <div className="pt-4 border-t border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tim Pelaksana</span>
                                                {listSelectedPkm.tim_kegiatan && listSelectedPkm.tim_kegiatan.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {listSelectedPkm.tim_kegiatan.map((t, i) => (
                                                            <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                                <div className="w-8 h-8 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-[10px] font-black">{t.nama?.charAt(0)?.toUpperCase() || '?'}</div>
                                                                <div>
                                                                    <span className="text-xs font-bold text-slate-700 block leading-tight">{t.nama}</span>
                                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.peran}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                                        <span className="text-xs font-bold text-slate-400">Belum ada data tim pelaksana</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Anggaran */}
                                            <div className="pt-4 border-t border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Anggaran</span>
                                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center"><i className="fa-solid fa-money-bill-wave"></i></div>
                                                    <span className="text-lg font-black text-poltekpar-primary">Rp {Number(listSelectedPkm.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>

                                            {/* Testimoni */}
                                            {listSelectedPkm.testimoni && listSelectedPkm.testimoni.length > 0 && (
                                                <div className="pt-4 border-t border-slate-100">
                                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Testimoni</span>
                                                    <div className="space-y-3">
                                                        {listSelectedPkm.testimoni.map((t, i) => (
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
                                </>
                            ) : (
                                <>
                                    <div className="p-8 pb-4 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Daftar PKM</h3>
                                            <button onClick={() => setIsListSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                            <input
                                                type="text"
                                                placeholder="Cari desa, kegiatan, lokasi..."
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-100 placeholder:text-slate-400 text-slate-700 text-sm font-bold rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-poltekpar-primary focus:bg-white transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-8 pt-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
                                        {filteredPkmData.map(pkm => {
                                            const typeColor = getPkmTypeMeta(pkm).color;
                                            return (
                                                <button
                                                    key={pkm.id}
                                                    onClick={() => {
                                                        setListSelectedPkm(pkm);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 text-left hover:bg-poltekpar-primary hover:text-white hover:border-poltekpar-primary transition-all group shadow-sm cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-3 w-[90%]">
                                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm group-hover:ring-2 group-hover:ring-white/50" style={{ backgroundColor: typeColor }}></div>
                                                            <div className="font-black text-sm text-slate-800 group-hover:text-white transition-colors truncate">{pkm.nama}</div>
                                                        </div>
                                                        <i className="fa-solid fa-arrow-right text-slate-300 group-hover:text-white transition-colors flex-shrink-0"></i>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 pl-[22px] text-[10px] font-bold text-slate-400 group-hover:text-white/80 transition-colors uppercase tracking-widest">
                                                        <div className="flex items-center gap-2"><i className="fa-solid fa-location-dot"></i> {pkm.desa}, {pkm.kabupaten}</div>
                                                        <div className="flex items-center gap-2"><i className="fa-solid fa-calendar"></i> Tahun {pkm.tahun}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {filteredPkmData.length === 0 && (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><i className="fa-solid fa-search text-xl"></i></div>
                                                <p className="text-xs font-bold text-slate-400">Tidak ada kegiatan yang ditemukan.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
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
