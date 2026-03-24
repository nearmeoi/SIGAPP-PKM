import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    Activity, ArrowLeft, Image as ImageIcon, CheckCircle, Save,
    MapPin, Calendar, FileText, Users, Building, Banknote
} from 'lucide-react';

interface Aktivitas {
    id_aktivitas: number;
    status_pelaksanaan: string;
    catatan_pelaksanaan?: string;
    url_thumbnail?: string;
    pengajuan: {
        judul_kegiatan: string;
        created_at: string;
        jenis_pkm?: { nama_jenis: string };
        instansi_mitra?: string;
        sumber_dana?: string;
        lokasi_pkm?: { provinsi: string; kota_kabupaten: string };
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

    const handleSimpanPengaturan = () => {
        const formData = new FormData();
        formData.append('status_pelaksanaan', statusAktivitas);
        if (thumbnailAktivitas) {
            formData.append('thumbnail', thumbnailAktivitas);
        }

        // This hits the existing route we saw in PengajuanController which handles aktivitas updates
        router.post(`/admin/pengajuan/${aktivitas.id_aktivitas}/aktivitas`, formData, {
            onSuccess: () => alert('Pengaturan aktivitas berhasil disimpan.'),
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <AdminLayout title={`Aktivitas: ${pengajuan.judul_kegiatan}`}>
            {/* Back Bar */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/aktivitas" className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-[20px] font-bold text-zinc-900 leading-tight truncate">Detail Aktivitas</h1>
                    <p className="text-[13px] text-zinc-500 mt-1">
                        Submisi dari <span className="font-medium text-zinc-700">{pengajuan.user?.name || '—'}</span>
                        {pengajuan.created_at && ` pada tanggal ${formatDate(pengajuan.created_at)}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── LEFT COLUMN ─── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Pengaturan Aktivitas & Maps */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
                            <Activity size={16} className="text-zinc-500" />
                            <h2 className="text-[14px] font-semibold text-zinc-900">Konfigurasi Maps & Thumbnail</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Display Thumbnail <span className="text-zinc-400 font-normal text-[11px]">(opsional)</span></label>
                                <label htmlFor="thumb-upload" className="flex items-center gap-3 px-4 py-4 border border-dashed border-zinc-300 bg-zinc-50 rounded-xl cursor-pointer hover:border-zinc-400 hover:bg-zinc-100 transition-all shadow-sm">
                                    {thumbnailAktivitas ? (
                                        <>
                                            <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                            <span className="text-[13px] font-medium text-zinc-800 truncate">{thumbnailAktivitas.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon size={20} className="text-zinc-400 flex-shrink-0" />
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-medium text-zinc-700">Pilih gambar visual...</span>
                                                <span className="text-[11px] text-zinc-500 mt-0.5">Maks 2MB. JPG, PNG.</span>
                                            </div>
                                            <span className="ml-auto text-indigo-600 text-[12px] font-semibold bg-indigo-50 px-3 py-1 rounded-md">Browse</span>
                                        </>
                                    )}
                                    <input id="thumb-upload" type="file" className="sr-only" accept="image/*" onChange={e => setThumbnailAktivitas(e.target.files?.[0] || null)} />
                                </label>
                                {aktivitas.url_thumbnail && !thumbnailAktivitas && (
                                    <div className="mt-3">
                                        <p className="text-[11px] text-zinc-500 mb-1.5">Thumbnail Saat Ini:</p>
                                        <img src={aktivitas.url_thumbnail} alt="Current" className="h-32 object-cover rounded-lg border border-zinc-200 shadow-sm" />
                                    </div>
                                )}
                            </div>

                            {/* Status Pelaksanaan */}
                            <div>
                                <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Status Pelaksanaan (Warna Pin di Peta)</label>
                                <select value={statusAktivitas} onChange={e => setStatusAktivitas(e.target.value)}
                                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-[14px] font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer shadow-sm">
                                    <option value="persiapan">🟡 Persiapan (Pin Kuning)</option>
                                    <option value="berlangsung">🔵 Berlangsung (Pin Biru)</option>
                                    <option value="selesai">🟢 Selesai (Pin Hijau)</option>
                                </select>
                            </div>

                            <button
                                onClick={handleSimpanPengaturan}
                                className="w-full flex justify-center items-center gap-2 py-3 rounded-lg text-[14px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-md transition-colors"
                            >
                                <Save size={16} /> Simpan Konfigurasi
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── RIGHT COLUMN ─── */}
                <div className="space-y-6">
                    {/* Ringkasan Pengajuan */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-[14px] font-semibold text-zinc-900">Referensi Pengajuan</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Judul Kegiatan</div>
                                <div className="text-[13px] font-medium text-zinc-900 leading-snug">{pengajuan.judul_kegiatan}</div>
                            </div>
                            <div className="pt-3 border-t border-zinc-100">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Lokasi</div>
                                <div className="text-[13px] font-medium text-zinc-900 flex items-center gap-1.5">
                                    <MapPin size={14} className="text-zinc-400" />
                                    {pengajuan.lokasi_pkm?.kota_kabupaten || '—'}, {pengajuan.lokasi_pkm?.provinsi || '—'}
                                </div>
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
                </div>

            </div>
        </AdminLayout>
    );
};

export default Detail;
