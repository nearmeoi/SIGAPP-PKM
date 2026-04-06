import React, { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    Filter, Search, ChevronRight, Clock, X,
    Trash2, AlertCircle
} from 'lucide-react';

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    status_pengajuan: string;
    no_telepon?: string;
    instansi_mitra?: string;
    created_at: string;
    kebutuhan?: string;
    proposal?: string;
    surat_permohonan?: string;
    total_anggaran?: number;
    rab_items?: { nama_item?: string; jumlah?: number; harga?: number; total?: number }[];
    dana_perguruan_tinggi?: number;
    dana_pemerintah?: number;
    dana_lembaga_dalam?: number;
    dana_lembaga_luar?: number;
    sumber_dana?: string;
    nama_pengusul?: string;
    email_pengusul?: string;
    tipe_pengusul?: string;
    user?: { name: string; email: string; role?: string };
    jenis_pkm?: { nama_jenis: string };
    provinsi?: string;
    kota_kabupaten?: string;
    tim_kegiatan?: { nama_mahasiswa?: string; peran_tim?: string; pegawai?: { nama_pegawai?: string } }[];
}

interface PaginatedData {
    data: Pengajuan[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface IndexProps {
    listPengajuan: PaginatedData;
    filters: { search: string; status: string; sort?: string; direction?: string };
}

const STATUS_BADGE: Record<string, { label: string; text: string; bg: string; dot: string }> = {
    diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
    ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
};

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'direvisi', label: 'Direvisi' },
    { value: 'diterima', label: 'Diterima' },
    { value: 'ditolak', label: 'Ditolak' },
];

const getSubmitterType = (item: Pengajuan): 'dosen' | 'masyarakat' => {
    const source = String(item.tipe_pengusul || item.user?.role || '').toLowerCase();
    return source === 'dosen' ? 'dosen' : 'masyarakat';
};

const getKetuaName = (item: Pengajuan): string => {
    const ketua = item.tim_kegiatan?.find((member) =>
        String(member.peran_tim || '').toLowerCase().includes('ketua')
    );
    return ketua?.pegawai?.nama_pegawai || ketua?.nama_mahasiswa || '';
};

const getSubmitterName = (item: Pengajuan): string =>
    item.nama_pengusul || (getSubmitterType(item) === 'dosen' ? getKetuaName(item) : '') || item.user?.name || '-';

const getIncompleteReasons = (item: Pengajuan): string[] => {
    const reasons: string[] = [];
    const isDosen = getSubmitterType(item) === 'dosen';

    if (!getSubmitterName(item) || getSubmitterName(item) === '-') reasons.push('nama pengusul');
    if (!item.instansi_mitra) reasons.push('instansi');
    if (!item.no_telepon) reasons.push('kontak');
    if (!item.kebutuhan) reasons.push(isDosen ? 'deskripsi kegiatan' : 'kebutuhan');
    if (!item.provinsi || !item.kota_kabupaten) reasons.push('lokasi');
    if (!item.surat_permohonan) reasons.push('surat permohonan');

    if (isDosen) {
        const hasRabItems = (item.rab_items || []).some((rabItem) =>
            String(rabItem.nama_item || '').trim() !== '' && Number(rabItem.jumlah || 0) > 0
        );
        if (!item.judul_kegiatan) reasons.push('judul kegiatan');
        if (!hasRabItems) reasons.push('rincian RAB');
        
        const hasSumberDana = !!item.sumber_dana 
            || Number(item.dana_perguruan_tinggi || 0) > 0
            || Number(item.dana_pemerintah || 0) > 0
            || Number(item.dana_lembaga_dalam || 0) > 0
            || Number(item.dana_lembaga_luar || 0) > 0;
        if (!hasSumberDana) reasons.push('sumber dana');

        const anggotaCount = (item.tim_kegiatan || []).filter(m => !String(m.peran_tim || '').toLowerCase().includes('ketua')).length;
        if (anggotaCount === 0) reasons.push('tim terlibat (Dosen/Staff/Mahasiswa)');
    }

    return reasons;
};

const Index: React.FC<IndexProps> = ({ listPengajuan, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortField, setSortField] = useState(filters.sort || 'created_at');
    const [sortDir, setSortDir] = useState(filters.direction || 'desc');

    // ── Filter helpers ─────────────────────────────────
    const applyFilters = useCallback((newSortField?: string, newSortDir?: string) => {
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: status || undefined,
            sort: newSortField !== undefined ? newSortField : sortField,
            direction: newSortDir !== undefined ? newSortDir : sortDir,
        }, { preserveState: true, replace: true });
    }, [search, status, sortField, sortDir]);

    const handleSort = (field: string) => {
        const isAsc = sortField === field && sortDir === 'asc';
        const newDir = isAsc ? 'desc' : 'asc';
        setSortField(field);
        setSortDir(newDir);
        applyFilters(field, newDir);
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: newStatus || undefined,
            sort: sortField,
            direction: sortDir,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatus(''); setSortField('created_at'); setSortDir('desc');
        router.get('/admin/pengajuan', {}, { preserveState: true, replace: true });
    };

    // ── Delete ──────────────────────────────────────────
    const handleDelete = (id: number, judul: string) => {
        if (!confirm(`Hapus pengajuan "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(`/admin/pengajuan/${id}`);
    };

    const hasFilters = search || status;

    return (
        <AdminLayout title="">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Kelola Pengajuan</h1>
                    <p className="text-[14px] text-zinc-500 mt-1">Review dan kelola semua pengajuan proposal kegiatan PKM.</p>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari proposal..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            className="bg-white border border-zinc-200 rounded-md py-2 pl-9 pr-4 text-[13px] text-zinc-700 placeholder-zinc-400 focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 outline-none w-56 shadow-sm transition-all"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={status}
                        onChange={e => handleStatusChange(e.target.value)}
                        className="px-3 py-2 bg-white border border-zinc-200 shadow-sm rounded-md text-[13px] font-medium text-zinc-600 focus:ring-2 focus:ring-zinc-200 outline-none cursor-pointer"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Clear filter */}
                    {hasFilters && (
                        <button onClick={clearFilters} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors" title="Hapus filter">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('judul_kegiatan')}>
                                    Nama Kegiatan {sortField === 'judul_kegiatan' && (sortDir === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pengaju</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Detail</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Kelengkapan</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-center cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('status_pengajuan')}>
                                    Status {sortField === 'status_pengajuan' && (sortDir === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {listPengajuan.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-zinc-400 text-[14px]">
                                        {hasFilters ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada data pengajuan.'}
                                    </td>
                                </tr>
                            ) : (
                                listPengajuan.data.map((item) => {
                                    const st = STATUS_BADGE[item.status_pengajuan] || STATUS_BADGE.diproses;
                                    const submitterType = getSubmitterType(item);
                                    const submitterName = getSubmitterName(item);
                                    const incompleteReasons = getIncompleteReasons(item);
                                    const isIncomplete = incompleteReasons.length > 0;
                                    return (
                                        <tr key={item.id_pengajuan} className="hover:bg-zinc-50/50 transition-colors group">
                                            {/* Nama Kegiatan */}
                                            <td className="py-3 px-4">
                                                <Link href={`/admin/pengajuan/${item.id_pengajuan}`} className="text-[14px] font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-snug truncate max-w-[260px] block">
                                                    {item.judul_kegiatan}
                                                </Link>
                                                <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </td>

                                            {/* Pengaju */}
                                            <td className="py-3 px-4">
                                                <div className="text-[13px] font-medium text-zinc-800">{submitterName}</div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${submitterType === 'dosen' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                                                        {submitterType === 'dosen' ? 'Auth Dosen' : 'Auth Masyarakat'}
                                                    </span>
                                                </div>
                                                {item.no_telepon && (
                                                    <div className="text-[11px] text-zinc-400 mt-1">No. HP: {item.no_telepon}</div>
                                                )}
                                            </td>

                                            {/* Detail: Jenis & Lokasi */}
                                            <td className="py-3 px-4">
                                                <div className="text-[13px] text-zinc-700 font-medium">{item.jenis_pkm?.nama_jenis || '-'}</div>
                                                <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[180px]">
                                                    {item.kota_kabupaten ? `${item.kota_kabupaten}, ${item.provinsi}` : 'Lokasi: TBD'}
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                {isIncomplete ? (
                                                    <div className="max-w-[250px] rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-600" />
                                                            <div>
                                                                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                                                                    Data Perlu Dilengkapi
                                                                </div>
                                                                <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800">
                                                                    Beberapa isian belum lengkap. Hubungi pengaju untuk melengkapi data.
                                                                </p>
                                                                <p className="mt-1 text-[10px] text-amber-700">
                                                                    Kurang: {incompleteReasons.slice(0, 3).join(', ')}{incompleteReasons.length > 3 ? ', ...' : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                        Data lengkap
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status badge */}
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase border ${st.bg} ${st.text} border-zinc-100`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                                    {st.label}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        href={`/admin/pengajuan/${item.id_pengajuan}`}
                                                        className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <ChevronRight size={15} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(item.id_pengajuan, item.judul_kegiatan)}
                                                        className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {listPengajuan.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-200 bg-zinc-50/50">
                        <div className="text-[12px] font-medium text-zinc-500">
                            Menampilkan {(listPengajuan.current_page - 1) * listPengajuan.per_page + 1}
                            –{Math.min(listPengajuan.current_page * listPengajuan.per_page, listPengajuan.total)}
                            {' '}dari {listPengajuan.total} items
                        </div>
                        <div className="flex items-center gap-1">
                            {listPengajuan.links.map((link, i) => {
                                const isFirst = i === 0;
                                const isLast = i === listPengajuan.links.length - 1;
                                return (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-colors shadow-sm focus:outline-none disabled:cursor-not-allowed ${link.active
                                            ? 'bg-zinc-900 text-white'
                                            : 'border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 disabled:opacity-40'
                                            }`}
                                    >
                                        {isFirst ? '‹' : isLast ? '›' : link.label.replace('&laquo;', '‹').replace('&raquo;', '›').replace('&hellip;', '…')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Index;
