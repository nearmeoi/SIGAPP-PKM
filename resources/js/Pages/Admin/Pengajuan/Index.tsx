import React, { useState, useCallback } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    Filter, Download, Search, ChevronRight, Clock, X,
    Edit, Trash2, CheckSquare, Square, Mail, Check, AlertCircle
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
    filters: { search: string; status: string };
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

const getSubmitterEmail = (item: Pengajuan): string =>
    item.email_pengusul || item.user?.email || '-';

const getIncompleteReasons = (item: Pengajuan): string[] => {
    const reasons: string[] = [];
    const isDosen = getSubmitterType(item) === 'dosen';

    if (!getSubmitterName(item) || getSubmitterName(item) === '-') reasons.push('nama pengusul');
    if (!getSubmitterEmail(item) || getSubmitterEmail(item) === '-') reasons.push('email');
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
        const hasBudget = hasRabItems
            || Number(item.total_anggaran || 0) > 0
            || Number(item.dana_perguruan_tinggi || 0) > 0
            || Number(item.dana_pemerintah || 0) > 0
            || Number(item.dana_lembaga_dalam || 0) > 0
            || Number(item.dana_lembaga_luar || 0) > 0;
        if (!hasBudget) reasons.push('RAB/biaya');
    }

    return reasons;
};

const Index: React.FC<IndexProps> = ({ listPengajuan, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showUndangan, setShowUndangan] = useState(false);
    const [undanganSubject, setUndanganSubject] = useState('Undangan Pengajuan PKM');
    const [undanganBody, setUndanganBody] = useState('');
    const [selectAllMode, setSelectAllMode] = useState(false);

    // ── Filter helpers ─────────────────────────────────
    const applyFilters = useCallback(() => {
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    }, [search, status]);

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/admin/pengajuan', {
            search: search || undefined,
            status: newStatus || undefined,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatus('');
        router.get('/admin/pengajuan', {}, { preserveState: true, replace: true });
    };

    // ── Export ──────────────────────────────────────────
    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        window.location.href = `/admin/pengajuan/export?${params.toString()}`;
    };

    // ── Checkbox helpers ────────────────────────────────
    const allIds = listPengajuan.data.map(p => p.id_pengajuan);
    const allChecked = allIds.length > 0 && allIds.every(id => selectedIds.includes(id)) && !selectAllMode;
    const someChecked = selectedIds.length > 0;

    const toggleAll = () => {
        if (selectAllMode) {
            setSelectAllMode(false);
            setSelectedIds([]);
        } else if (allChecked) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allIds);
        }
    };

    const selectAllAcrossPages = () => {
        setSelectAllMode(true);
        setSelectedIds(listPengajuan.data.map(p => p.id_pengajuan));
    };

    const toggleOne = (id: number) => {
        setSelectAllMode(false);
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // ── Delete ──────────────────────────────────────────
    const handleDelete = (id: number, judul: string) => {
        if (!confirm(`Hapus pengajuan "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        router.delete(`/admin/pengajuan/${id}`, {
            onSuccess: () => setSelectedIds(prev => prev.filter(x => x !== id)),
        });
    };

    // ── Selected pengajuan data ──────────────────────────
    const selectedPengajuan = listPengajuan.data.filter(p => selectedIds.includes(p.id_pengajuan));
    // For undangan: only "diterima" items
    const undanganRecipients = selectedPengajuan.filter(p => p.status_pengajuan === 'diterima');
    const hasDiterimaSelected = undanganRecipients.length > 0;

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

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 shadow-sm rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                        <Download size={14} /> Export
                    </button>

                    {/* Clear filter */}
                    {hasFilters && (
                        <button onClick={clearFilters} className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors" title="Hapus filter">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Bulk action bar (muncul saat ada yang dicentang) ── */}
            {someChecked && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-[13px] text-indigo-800">
                    <Check size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedIds.length} dipilih</span>
                    {!selectAllMode && selectedIds.length === allIds.length && listPengajuan.total > allIds.length && (
                        <>
                            <span className="text-indigo-400">|</span>
                            <button onClick={selectAllAcrossPages} className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-800 underline">
                                Pilih semua {listPengajuan.total} data
                            </button>
                        </>
                    )}
                    {selectAllMode && (
                        <>
                            <span className="text-indigo-400">|</span>
                            <span className="text-[12px] font-semibold text-indigo-600">Semua {listPengajuan.total} data dipilih</span>
                        </>
                    )}
                    <span className="text-indigo-400">|</span>
                    {hasDiterimaSelected ? (
                        <button
                            onClick={() => setShowUndangan(true)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-md text-[12px] font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            <Mail size={12} /> Kirim Undangan ({undanganRecipients.length})
                        </button>
                    ) : (
                        <span className="text-[12px] text-indigo-400 italic">Centang data berstatus Diterima untuk kirim undangan</span>
                    )}
                    <button onClick={() => { setSelectedIds([]); setSelectAllMode(false); }} className="ml-auto text-indigo-400 hover:text-indigo-700 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── Table ── */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[960px]">
                        <thead>
                            <tr className="border-b border-zinc-200 bg-zinc-50/50">
                                {/* Check-all */}
                                <th className="py-3 px-4 w-10">
                                    <button onClick={toggleAll} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                                        {allChecked
                                            ? <CheckSquare size={16} className="text-indigo-600" />
                                            : <Square size={16} />
                                        }
                                    </button>
                                </th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Nama Kegiatan</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Pengaju</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Detail</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Kelengkapan</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-center">Status</th>
                                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {listPengajuan.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-zinc-400 text-[14px]">
                                        {hasFilters ? 'Tidak ada hasil untuk filter yang dipilih.' : 'Belum ada data pengajuan.'}
                                    </td>
                                </tr>
                            ) : (
                                listPengajuan.data.map((item) => {
                                    const st = STATUS_BADGE[item.status_pengajuan] || STATUS_BADGE.diproses;
                                    const checked = selectedIds.includes(item.id_pengajuan);
                                    const submitterType = getSubmitterType(item);
                                    const submitterName = getSubmitterName(item);
                                    const incompleteReasons = getIncompleteReasons(item);
                                    const isIncomplete = incompleteReasons.length > 0;
                                    return (
                                        <tr key={item.id_pengajuan} className={`hover:bg-zinc-50/50 transition-colors group ${checked ? 'bg-indigo-50/30' : ''}`}>
                                            {/* Checkbox */}
                                            <td className="py-3 px-4">
                                                <button onClick={() => toggleOne(item.id_pengajuan)} className="text-zinc-400 hover:text-zinc-700">
                                                    {checked
                                                        ? <CheckSquare size={16} className="text-indigo-600" />
                                                        : <Square size={16} />
                                                    }
                                                </button>
                                            </td>

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
                                                    {/* <Link
                                                        href={`/admin/pengajuan/${item.id_pengajuan}`}
                                                        className="p-1.5 rounded-md text-zinc-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={14} />
                                                    </Link> */}
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

            {/* ── Gmail-style compose modal (MVP: tampilan saja, kirim manual) ── */}
            {showUndangan && (
                <div className="fixed bottom-4 right-4 z-50 w-[520px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden" style={{ animation: 'slideUp 0.2s ease-out' }}>
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 text-white rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span className="text-[13px] font-semibold">Kirim Undangan</span>
                            <span className="text-[11px] bg-white/20 rounded px-1.5 py-0.5">{undanganRecipients.length} penerima</span>
                        </div>
                        <button onClick={() => setShowUndangan(false)} className="hover:bg-white/20 rounded p-0.5 transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    {/* To field */}
                    <div className="flex items-start gap-2 px-4 py-2.5 border-b border-zinc-100">
                        <span className="text-[12px] text-zinc-400 mt-0.5 w-12 shrink-0">Kepada</span>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                            {undanganRecipients.map(p => (
                                <span key={p.id_pengajuan} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-medium border border-indigo-100">
                                    {getSubmitterName(p)} &lt;{getSubmitterEmail(p)}&gt;
                                    <button onClick={() => toggleOne(p.id_pengajuan)} className="hover:text-red-500">
                                        <X size={10} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-100">
                        <span className="text-[12px] text-zinc-400 w-12 shrink-0">Subjek</span>
                        <input
                            type="text"
                            value={undanganSubject}
                            onChange={e => setUndanganSubject(e.target.value)}
                            className="flex-1 text-[13px] text-zinc-800 outline-none placeholder-zinc-300"
                            placeholder="Tulis subjek email..."
                        />
                    </div>

                    {/* Body */}
                    <textarea
                        value={undanganBody}
                        onChange={e => setUndanganBody(e.target.value)}
                        placeholder={`Yth. Bapak/Ibu Pengusul,\n\nDengan hormat, kami mengundang Anda untuk...\n\nHormat kami,\nTim SIGAP PKM`}
                        className="flex-1 px-4 py-3 text-[13px] text-zinc-700 outline-none resize-none min-h-[160px] placeholder-zinc-300"
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-100">
                        <div className="text-[11px] text-zinc-400">masih butuh konfigurasi SMTP di <code className="bg-zinc-200 px-1 rounded">.env</code></div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowUndangan(false)}
                                className="px-3 py-1.5 text-[12px] text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    alert(`[MVP] Undangan akan dikirim ke ${undanganRecipients.length} pengaju setelah SMTP dikonfigurasi.\n\nSubjek: ${undanganSubject}`);
                                    setShowUndangan(false);
                                }}
                                className="px-3 py-1.5 text-[12px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-1.5"
                            >
                                <Mail size={12} /> Kirim
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default Index;
