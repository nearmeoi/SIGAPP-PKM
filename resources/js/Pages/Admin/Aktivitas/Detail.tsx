import React, { useState, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import {
    Activity, ArrowLeft, Image as ImageIcon, CheckCircle, Save,
    MapPin, FileText, Trash2, Search, X, ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
    useMapEvents({ click(e) { onClick(e.latlng); } });
    return null;
}

function FlyToPosition({ lat, lng }: { lat: number | null; lng: number | null }) {
    const map = useMap();
    React.useEffect(() => {
        if (lat !== null && lng !== null) {
            map.flyTo([lat, lng], 15, { duration: 1.2 });
        }
    }, [lat, lng]);
    return null;
}

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
}

interface Aktivitas {
    id_aktivitas: number;
    status_pelaksanaan: string;
    catatan_pelaksanaan?: string;
    url_thumbnail?: string;
    pengajuan: {
        id_pengajuan: number;
        judul_kegiatan: string;
        status_pengajuan: string;
        created_at: string;
        provinsi?: string;
        kota_kabupaten?: string;
        kecamatan?: string;
        kelurahan_desa?: string;
        alamat_lengkap?: string;
        latitude?: number;
        longitude?: number;
        jenis_pkm?: { nama_jenis: string };
        user?: { name: string };
    };
}

interface Props {
    aktivitas: Aktivitas;
}

const Detail: React.FC<Props> = ({ aktivitas }) => {
    const pengajuan = aktivitas.pengajuan;
    const [statusAktivitas, setStatusAktivitas] = useState<string>(aktivitas.status_pelaksanaan || 'persiapan');
    const [thumbnailAktivitas, setThumbnailAktivitas] = useState<File | null>(null);

    // Map picker state
    const [lat, setLat] = useState<number | null>(pengajuan.latitude ?? null);
    const [lng, setLng] = useState<number | null>(pengajuan.longitude ?? null);

    // Nominatim search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMapClick = (latlng: L.LatLng) => {
        setLat(Math.round(latlng.lat * 10000000) / 10000000);
        setLng(Math.round(latlng.lng * 10000000) / 10000000);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (query.length < 2) { setSearchResults([]); setShowResults(false); return; }

        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setSearchResults(data);
                setShowResults(true);
            } catch (e) {
                console.error('Search error:', e);
                setSearchResults([]);
                setShowResults(true);
            }
            setSearching(false);
        }, 400);
    };

    const selectSearchResult = (result: NominatimResult) => {
        setLat(Math.round(parseFloat(result.lat) * 10000000) / 10000000);
        setLng(Math.round(parseFloat(result.lon) * 10000000) / 10000000);
        setShowResults(false);
        setSearchQuery(result.display_name.split(',').slice(0, 3).join(','));
    };

    const handleSimpan = () => {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('status_pelaksanaan', statusAktivitas);
        if (thumbnailAktivitas) {
            formData.append('thumbnail', thumbnailAktivitas);
        }
        router.post(`/admin/aktivitas/${aktivitas.id_aktivitas}`, formData);
    };

    const handleSaveLokasi = () => {
        if (lat === null || lng === null) return;
        router.put(`/admin/pengajuan/${pengajuan.id_pengajuan}/lokasi`, {
            latitude: lat,
            longitude: lng,
        });
    };

    const handleDelete = () => setConfirmOpen(true);
    const confirmDelete = () => {
        router.delete(`/admin/aktivitas/${aktivitas.id_aktivitas}`, {
            onFinish: () => setConfirmOpen(false),
        });
    };
    const [confirmOpen, setConfirmOpen] = useState(false);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Full address string
    const fullAddress = [pengajuan.alamat_lengkap, pengajuan.kelurahan_desa, pengajuan.kecamatan, pengajuan.kota_kabupaten, pengajuan.provinsi].filter(Boolean).join(', ');

    return (
        <AdminLayout title="">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/aktivitas" className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-[20px] font-bold text-zinc-900 leading-tight truncate">Detail Aktivitas</h1>
                    <p className="text-[13px] text-zinc-500 mt-1">
                        Pengajuan dari <span className="font-medium text-zinc-700">{pengajuan.user?.name || '—'}</span>
                        {pengajuan.created_at && ` pada tanggal ${formatDate(pengajuan.created_at)}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Pengaturan Aktivitas */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                            <Activity size={16} className="text-zinc-500" />
                            <h2 className="text-[14px] font-semibold text-zinc-900">Pengaturan Aktivitas</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Thumbnail</label>
                                <label htmlFor="thumb-upload" className="flex items-center gap-3 px-4 py-4 border border-dashed border-zinc-300 bg-zinc-50 rounded-xl cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 transition-all shadow-sm">
                                    {thumbnailAktivitas ? (
                                        <><CheckCircle size={20} className="text-emerald-500 flex-shrink-0" /><span className="text-[13px] font-medium text-zinc-800 truncate">{thumbnailAktivitas.name}</span></>
                                    ) : (
                                        <><ImageIcon size={20} className="text-zinc-400 flex-shrink-0" /><div className="flex flex-col"><span className="text-[13px] font-medium text-zinc-700">Pilih thumbnail...</span><span className="text-[11px] text-zinc-500 mt-0.5">Maks 2MB. JPG, PNG.</span></div><span className="ml-auto text-indigo-600 text-[12px] font-semibold bg-indigo-50 px-3 py-1 rounded-md">Browse</span></>
                                    )}
                                    <input id="thumb-upload" type="file" className="sr-only" accept="image/*" onChange={e => setThumbnailAktivitas(e.target.files?.[0] || null)} />
                                </label>
                                {aktivitas.url_thumbnail && !thumbnailAktivitas && (
                                    <div className="mt-3"><p className="text-[11px] text-zinc-500 mb-1.5">Thumbnail Saat Ini:</p><img src={aktivitas.url_thumbnail} alt="Current" className="h-32 object-cover rounded-lg border border-zinc-200 shadow-sm" /></div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Status Pelaksanaan</label>
                                <select value={statusAktivitas} onChange={e => setStatusAktivitas(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-[14px] font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer shadow-sm">
                                    <option value="belum_mulai"> Belum Mulai</option>
                                    <option value="persiapan">🟡 Persiapan</option>
                                    <option value="berjalan">🔵 Berjalan</option>
                                    <option value="selesai">🟢 Selesai</option>
                                </select>
                            </div>
                            <button onClick={handleSimpan}
                                className="w-full flex justify-center items-center gap-2 py-3 rounded-lg text-[14px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-md transition-colors">
                                <Save size={16} /> Simpan Perubahan
                            </button>
                        </div>
                    </div>

                    {/* Map Picker with Nominatim Search */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-visible">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2 rounded-t-xl">
                            <MapPin size={16} className="text-zinc-500" />
                            <h2 className="text-[14px] font-semibold text-zinc-900">Koordinat Lokasi</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Address from user */}
                            {fullAddress && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">Alamat dari Pengaju</div>
                                    <p className="text-[13px] text-blue-900 font-medium">{fullAddress}</p>
                                </div>
                            )}

                            {/* Nominatim Search */}
                            <div className="relative">
                                <label className="block text-[12px] font-medium text-zinc-600 mb-2">Cari Lokasi (OpenStreetMap)</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="Ketik nama jalan, gedung, atau tempat..."
                                        className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-10 py-2.5 text-[13px] text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); setSearchResults([]); setShowResults(false); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                {searching && <p className="text-[11px] text-zinc-400 mt-1">Mencari...</p>}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden">
                                        {searchResults.map((r, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectSearchResult(r)}
                                                type="button"
                                                className="w-full text-left px-4 py-2.5 text-[12px] text-zinc-700 hover:bg-blue-50 hover:text-blue-900 border-b border-zinc-100 last:border-0 transition-colors flex items-center gap-2"
                                            >
                                                <MapPin size={12} className="text-zinc-400 flex-shrink-0" />
                                                <span className="truncate">{r.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 2 && (
                                    <div className="absolute z-[9999] top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl p-4 text-center">
                                        <p className="text-[12px] text-zinc-500">Tidak ada hasil untuk "{searchQuery}"</p>
                                        <p className="text-[11px] text-zinc-400 mt-1">Coba kata kunci lain, misalnya: "Paccerakkang Makassar"</p>
                                    </div>
                                )}
                            </div>

                            {/* Map */}
                            <div className="rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
                                <MapContainer
                                    center={[lat ?? -5.14, lng ?? 119.48]}
                                    zoom={13}
                                    style={{ height: '280px', width: '100%' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        attribution=''
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {lat !== null && lng !== null && <Marker position={[lat, lng]} />}
                                    <MapClickHandler onClick={handleMapClick} />
                                    <FlyToPosition lat={lat} lng={lng} />
                                </MapContainer>
                            </div>
                            <p className="text-[11px] text-zinc-400">Klik pada peta atau gunakan kolom pencarian di atas untuk mengatur koordinat.</p>

                            {/* Lat/Lng Inputs */}
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[11px] font-medium text-zinc-500">Latitude</label>
                                    <input type="number" step="any" value={lat ?? ''} onChange={e => setLat(parseFloat(e.target.value) || null)}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-[13px] text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] font-medium text-zinc-500">Longitude</label>
                                    <input type="number" step="any" value={lng ?? ''} onChange={e => setLng(parseFloat(e.target.value) || null)}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-1.5 text-[13px] text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200" />
                                </div>
                            </div>
                            <button onClick={handleSaveLokasi} disabled={lat === null || lng === null}
                                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm">
                                <MapPin size={14} /> Simpan Koordinat
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    {/* Pengajuan Info */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-[14px] font-semibold text-zinc-900">Detail Pengajuan</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div><div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Judul Kegiatan</div><div className="text-[13px] font-medium text-zinc-900 leading-snug">{pengajuan.judul_kegiatan}</div></div>
                            <div className="pt-3 border-t border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Status Pengajuan</div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase ${pengajuan.status_pengajuan === 'diterima' ? 'bg-emerald-50 text-emerald-700' : pengajuan.status_pengajuan === 'ditolak' ? 'bg-red-50 text-red-700' : pengajuan.status_pengajuan === 'selesai' ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {pengajuan.status_pengajuan}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Lokasi</div>
                                <div className="text-[13px] font-medium text-zinc-900">{fullAddress || '—'}</div>
                            </div>
                            <div className="pt-3 border-t border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Kategori</div>
                                <div className="text-[13px] font-medium text-zinc-900 flex items-center gap-1.5">
                                    <FileText size={14} className="text-zinc-400" />
                                    {pengajuan.jenis_pkm?.nama_jenis || '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
                            <h2 className="text-[14px] font-semibold text-red-700">Danger Zone</h2>
                        </div>
                        <div className="p-5">
                            <p className="text-[12px] text-zinc-500 mb-3">Menghapus aktivitas akan menyembunyikan data. Data tetap tersimpan dan dapat dipulihkan.</p>
                            <button onClick={handleDelete}
                                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors">
                                <Trash2 size={14} /> Hapus Aktivitas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .leaflet-control-attribution { display: none !important; }
                .leaflet-control-zoom { border: none !important; box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important; }
                .leaflet-control-zoom a { border-radius: 6px !important; }
            `}</style>

            <ConfirmDialog
                open={confirmOpen}
                title="Hapus Aktivitas"
                message="Aktivitas ini akan dihapus (soft delete). Data dapat dipulihkan oleh developer."
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
                variant="danger"
            />
        </AdminLayout>
    );
};

export default Detail;