import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LandingCharts from '@/Components/LandingCharts';
import MapLegend from '@/Components/MapLegend';
import { createPkmMarkerIcon, extractDynamicPkmTypes, getPkmStatusMeta, PkmTypeMeta } from '@/data/pkmMapVisuals';
import type { PkmData } from '@/types';
import '../../css/landing.css';

if (typeof window !== 'undefined' && L?.Icon?.Default) {
    (L.Icon.Default.prototype as any)._getIconUrl = undefined;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
        iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
        shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
    });
}

function MapSizeInvalidator({ watchKey }: { watchKey: string }): null {
    const map = useMap();
    useEffect(() => {
        const timeoutId = window.setTimeout(() => map.invalidateSize(), 200);
        return () => window.clearTimeout(timeoutId);
    }, [map, watchKey]);
    return null;
}

function MapSummaryOverlay({
    total,
    selesai,
    berlangsung,
    forceHide,
    typesMeta,
    selectedTypes,
    onToggleType,
    selectedStatuses,
    onToggleStatus,
}: {
    total: number;
    selesai: number;
    berlangsung: number;
    forceHide?: boolean;
    typesMeta: PkmTypeMeta[];
    selectedTypes: string[];
    onToggleType: (typeKey: string) => void;
    selectedStatuses: string[];
    onToggleStatus: (statusKey: string) => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const wrapClass = forceHide ? 'opacity-0 -translate-x-[120%] pointer-events-none' : 'opacity-100 translate-x-0';
    const panelClass = isCollapsed ? 'opacity-0 scale-50 -translate-x-[80%] pointer-events-none' : 'opacity-100 scale-100 translate-x-0 relative';

    return (
        <div className={`absolute bottom-8 left-8 z-[1000] flex items-end gap-3 pointer-events-none transition-all duration-500 ease-in-out ${wrapClass}`}>
            <button onClick={() => setIsCollapsed((value) => !value)} className="w-10 h-10 mb-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex items-center justify-center text-slate-500 hover:text-sigappa-primary hover:scale-105 active:scale-95 transition-all outline-none z-10 pointer-events-auto" title={isCollapsed ? 'Tampilkan Informasi Map' : 'Sembunyikan Informasi Map'}>
                <i className={`fa-solid ${isCollapsed ? 'fa-chart-pie' : 'fa-chevron-left'} transition-transform duration-300`}></i>
            </button>
            <div className={`flex items-end gap-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-left flex-1 ${panelClass}`}>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-2xl border border-white/40 whitespace-nowrap pointer-events-auto">
                    <MapLegend className="bg-transparent border-none shadow-none" compact typesMeta={typesMeta} selectedTypes={selectedTypes} onToggleType={onToggleType} selectedStatuses={selectedStatuses} onToggleStatus={onToggleStatus} />
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/40 flex items-center gap-5 whitespace-nowrap mb-1 pointer-events-auto">
                    <div className="text-center"><div className="text-base font-black text-slate-900 leading-none">{total}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total PKM</div></div>
                    <div className="w-px h-8 bg-slate-200/50"></div>
                    <div className="text-center"><div className="text-base font-black text-slate-900 leading-none">{selesai}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Selesai</div></div>
                    <div className="w-px h-8 bg-slate-200/50"></div>
                    <div className="text-center"><div className="text-base font-black text-slate-900 leading-none">{berlangsung}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Berlangsung</div></div>
                </div>
            </div>
        </div>
    );
}

export default function PkmMapDashboardCard({ pkmData, watchKey = 'pkm-map' }: { pkmData: PkmData[]; watchKey?: string }) {
    const [isListSidebarOpen, setIsListSidebarOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedPkm, setSelectedPkm] = useState<PkmData | null>(null);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const filteredPkmData = useMemo(() => {
        const keyword = searchKeyword.toLowerCase();
        return pkmData.filter((pkm) => {
            const matchesSearch = keyword.length === 0 || [pkm.nama, pkm.desa, pkm.kabupaten, pkm.provinsi].some((value) => value.toLowerCase().includes(keyword));
            const typeKey = (String(pkm?.jenis_pkm ?? '').trim().toLowerCase().startsWith('pkm') ? String(pkm?.jenis_pkm ?? '').trim() : String(pkm?.jenis_pkm ?? '').trim() ? `PKM ${String(pkm?.jenis_pkm ?? '').trim()}` : 'Lainnya');
            // Matching against the extracted key which matches raw label since we assign displayLabel.
            // Wait, we need to match the type key. Let's use the actual extract logic.
            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(String(pkm?.jenis_pkm ?? '').trim() || 'Lainnya');
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(getPkmStatusMeta(pkm.status).key);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [pkmData, searchKeyword, selectedStatuses, selectedTypes]);

    const typesMeta = useMemo(() => extractDynamicPkmTypes(pkmData), [pkmData]);

    const totalPkm = filteredPkmData.length;
    const totalSelesai = filteredPkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = filteredPkmData.filter((item) => item.status === 'berlangsung').length;

    return (
        <div className="bg-white rounded-[48px] shadow-2xl shadow-sigappa-navy/5 border border-slate-100 overflow-hidden mb-8 p-6">
            <div className="mb-4"><h2 className="text-2xl font-bold text-slate-900">Dashboard Evaluasi <span className="text-poltekpar-primary">PKM</span></h2></div>
            <div className="relative w-full h-[115vh] overflow-hidden z-10">
                <MapContainer center={[-2.5, 118]} zoom={5} className="w-full h-full" zoomControl={true}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                    {filteredPkmData.map((pkm) => {
                        const typeMeta = typesMeta.find(t => t.key === (String(pkm?.jenis_pkm ?? '').trim() || 'Lainnya'));
                        const markerColor = typeMeta ? typeMeta.color : '#15325F';
                        return <Marker key={pkm.id} position={[parseFloat(String(pkm.lat)), parseFloat(String(pkm.lng))]} icon={createPkmMarkerIcon(pkm.status, markerColor)} eventHandlers={{ click: () => setSelectedPkm(pkm) }} />;
                    })}
                    <MapSizeInvalidator watchKey={watchKey} />
                </MapContainer>
                <div className={`absolute top-6 right-6 z-[1000] transition-all duration-500 ease-in-out ${isListSidebarOpen || !!selectedPkm ? 'opacity-0 -translate-y-4 pointer-events-none scale-90' : 'opacity-100 translate-y-0 scale-100'}`}>
                    <button onClick={() => { setIsListSidebarOpen(true); setSelectedPkm(null); }} className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3 text-sm font-black text-slate-700 hover:text-poltekpar-primary hover:scale-[1.02] active:scale-95 transition-all">
                        <i className="fa-solid fa-list-ul"></i>DAFTAR KEGIATAN PKM
                    </button>
                </div>
                <MapSummaryOverlay total={totalPkm} selesai={totalSelesai} berlangsung={totalBerlangsung} forceHide={isListSidebarOpen || !!selectedPkm} typesMeta={typesMeta} selectedTypes={selectedTypes} onToggleType={(key) => setSelectedTypes((value) => value.includes(key) ? value.filter((item) => item !== key) : [...value, key])} selectedStatuses={selectedStatuses} onToggleStatus={(key) => setSelectedStatuses((value) => value.includes(key) ? value.filter((item) => item !== key) : [...value, key])} />
                <div className={`absolute top-8 bottom-8 right-8 w-[400px] max-w-[calc(100%-64px)] bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl z-[1150] overflow-hidden flex flex-col transition-transform duration-700 border border-white/60 ${(!isListSidebarOpen && !selectedPkm) ? 'translate-x-[120%]' : 'translate-x-0'}`}>
                    {selectedPkm ? (
                        <>
                            <div className="p-8 pb-4 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0 animate-in fade-in duration-300">
                                <div className="flex items-center gap-4">
                                    {isListSidebarOpen && (
                                        <button onClick={() => setSelectedPkm(null)} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-arrow-left"></i></button>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{selectedPkm.nama}</h3>
                                        {(() => {
                                            const statusMeta = getPkmStatusMeta(selectedPkm.status);
                                            const statusClasses = selectedPkm.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700';
                                            return <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${statusClasses}`}><i className={`fa-solid ${statusMeta.markerIcon}`}></i> {statusMeta.label}</span>;
                                        })()}
                                    </div>
                                    <button onClick={() => { setIsListSidebarOpen(false); setSelectedPkm(null); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 custom-scrollbar overscroll-contain">
                                <div className="aspect-video rounded-[32px] overflow-hidden shadow-xl border border-slate-100 bg-slate-50 group shrink-0">
                                    {selectedPkm.thumbnail ? <img src={selectedPkm.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><i className="fa-solid fa-mountain-sun text-5xl"></i></div>}
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100"><span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ringkasan Kegiatan</span><p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">{selectedPkm.deskripsi || '-'}</p></div>
                                    <div className="flex flex-col gap-3 text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-location-dot"></i></div>{selectedPkm.desa}, {selectedPkm.kecamatan}, {selectedPkm.kabupaten}, {selectedPkm.provinsi}</div>
                                        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-sigappa-primary/10 text-sigappa-primary flex items-center justify-center"><i className="fa-solid fa-calendar"></i></div>Tahun {selectedPkm.tahun}</div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tim Pelaksana</span>
                                        {selectedPkm.tim_kegiatan && selectedPkm.tim_kegiatan.length > 0 ? (
                                            <div className="space-y-2">{selectedPkm.tim_kegiatan.map((tim, index) => <div key={index} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100"><div className="w-8 h-8 rounded-lg bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center text-[10px] font-black">{tim.nama?.charAt(0)?.toUpperCase() || '?'}</div><div><span className="text-xs font-bold text-slate-700 block leading-tight">{tim.nama}</span><span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tim.peran}</span></div></div>)}</div>
                                        ) : <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"><span className="text-xs font-bold text-slate-400">Belum ada data tim pelaksana</span></div>}
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Anggaran</span>
                                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-poltekpar-primary/10 text-poltekpar-primary flex items-center justify-center"><i className="fa-solid fa-money-bill-wave"></i></div><span className="text-lg font-black text-poltekpar-primary">Rp {Number(selectedPkm.total_anggaran || 0).toLocaleString('id-ID')}</span></div>
                                    </div>
                                    {selectedPkm.testimoni && selectedPkm.testimoni.length > 0 && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Testimoni</span>
                                            <div className="space-y-3">{selectedPkm.testimoni.map((testimoni, index) => <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="flex items-center justify-between mb-1"><span className="text-xs font-bold text-slate-700">{testimoni.nama_pemberi}</span><div className="flex gap-0.5">{[...Array(5)].map((_, starIndex) => <i key={starIndex} className={`fa-solid fa-star text-[10px] ${starIndex < testimoni.rating ? 'text-poltekpar-gold' : 'text-slate-200'}`}></i>)}</div></div><p className="text-[11px] text-slate-500 leading-relaxed">{testimoni.pesan_ulasan}</p></div>)}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-8 pb-4 bg-white/95 backdrop-blur-xl z-20 border-b border-slate-100 flex-shrink-0 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Daftar PKM</h3>
                                    <button onClick={() => setIsListSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                                <div className="relative">
                                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                                    <input type="text" placeholder="Cari desa, kegiatan, lokasi..." value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} className="w-full bg-slate-50 border border-slate-100 placeholder:text-slate-400 text-slate-700 text-sm font-bold rounded-2xl py-3 pl-11 pr-4 outline-none focus:border-poltekpar-primary focus:bg-white transition-all shadow-inner" />
                                </div>
                            </div>
                            <div className="p-8 pt-4 overflow-y-auto flex-1 space-y-4 custom-scrollbar overscroll-contain">
                                {filteredPkmData.map((pkm) => {
                                    const typeMeta = typesMeta.find(t => t.key === (String(pkm?.jenis_pkm ?? '').trim() || 'Lainnya'));
                                    const typeColor = typeMeta ? typeMeta.color : '#15325F';
                                    return (
                                        <button key={pkm.id} onClick={() => setSelectedPkm(pkm)} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 text-left hover:bg-poltekpar-primary hover:text-white hover:border-poltekpar-primary transition-all group shadow-sm cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3 w-[90%]"><div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm group-hover:ring-2 group-hover:ring-white/50" style={{ backgroundColor: typeColor }}></div><div className="font-black text-sm text-slate-800 group-hover:text-white transition-colors truncate">{pkm.nama}</div></div>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 group-hover:text-white/80">
                                                <span className="flex items-center gap-1.5"><i className="fa-solid fa-location-dot"></i> {pkm.desa}</span>
                                                <span className="flex items-center gap-1.5"><i className="fa-solid fa-calendar"></i> {pkm.tahun}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                                {filteredPkmData.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <i className="fa-solid fa-folder-open text-3xl mb-3"></i>
                                        <p className="text-xs font-bold">Tidak ada PKM ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div className="border-t border-slate-100"><LandingCharts pkmData={pkmData} /></div>
        </div>
    );
}
