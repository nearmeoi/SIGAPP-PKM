import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import {
    Activity, Clock, CheckCircle, Search, Calendar, MapPin,
    Download, Mail, X, Check, Loader2, Send
} from 'lucide-react';

interface AktivitasItem {
    id_aktivitas: number;
    status_pelaksanaan: string;
    created_at?: string;
    pengajuan?: {
        judul_kegiatan: string;
        tgl_mulai?: string;
        tgl_selesai?: string;
        provinsi?: string;
        kota_kabupaten?: string;
        nama_pengusul?: string;
        email_pengusul?: string;
        user?: { name: string; email?: string };
        jenis_pkm?: { nama_jenis: string };
    };
}

interface PaginatedData {
    data: AktivitasItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    listAktivitas: PaginatedData;
    filters?: { sort?: string; direction?: string };
}

const getRecipientName = (act: AktivitasItem): string =>
    act.pengajuan?.nama_pengusul || act.pengajuan?.user?.name || '-';

const getRecipientEmail = (act: AktivitasItem): string =>
    act.pengajuan?.email_pengusul || act.pengajuan?.user?.email || '';

const AktivitasPage: React.FC<Props> = ({ listAktivitas, filters }) => {
    const allData: AktivitasItem[] = listAktivitas.data || [];
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortField, setSortField] = useState(filters?.sort || 'created_at');
    const [sortDir, setSortDir] = useState(filters?.direction || 'desc');

    // ── Selection state ──
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showUndangan, setShowUndangan] = useState(false);
    const [undanganSubject, setUndanganSubject] = useState('Undangan Kegiatan PKM - SIGAPPA');
    const [undanganBody, setUndanganBody] = useState('Dengan hormat, kami mengundang Anda untuk menghadiri kegiatan Pengabdian Kepada Masyarakat (PKM) yang akan segera dilaksanakan.\n\nMohon persiapan dan konfirmasi kehadiran Anda.\n\nHormat kami,\nTim SIGAP PKM\nPoliteknik Pariwisata Makassar');
    const [isSending, setIsSending] = useState(false);

    const handleSort = (field: string) => {
        const isAsc = sortField === field && sortDir === 'asc';
        const newDir = isAsc ? 'desc' : 'asc';
        setSortField(field);
        setSortDir(newDir);
        router.get('/admin/aktivitas', { sort: field, direction: newDir }, { preserveState: true, replace: true });
    };

    // Client-side filter
    const data = allData.filter(act => {
        const title = act.pengajuan?.judul_kegiatan || '';
        const titleMatch = title.toLowerCase().includes(search.toLowerCase());
        const statusMatch = !filterStatus || act.status_pelaksanaan === filterStatus;
        return titleMatch && statusMatch;
    });

    const countBerjalan = allData.filter(a => !['selesai', 'belum_mulai'].includes(a.status_pelaksanaan)).length;
    const countSelesai = allData.filter(a => a.status_pelaksanaan === 'selesai').length;
    const countBelumMulai = allData.filter(a => a.status_pelaksanaan === 'belum_mulai').length;

    // ── Export ──
    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (filterStatus) params.set('status', filterStatus);
        window.location.href = `/admin/aktivitas/export?${params.toString()}`;
    };

    // ── Checkbox helpers (only for belum_mulai in visible data) ──
    const belumMulaiVisible = data.filter(a => a.status_pelaksanaan === 'belum_mulai');
    const belumMulaiVisibleIds = belumMulaiVisible.map(a => a.id_aktivitas);
    const allBelumMulaiChecked = belumMulaiVisibleIds.length > 0 && belumMulaiVisibleIds.every(id => selectedIds.includes(id));

    const toggleAll = () => {
        if (allBelumMulaiChecked) {
            // Uncheck all visible belum_mulai
            setSelectedIds(prev => prev.filter(id => !belumMulaiVisibleIds.includes(id)));
        } else {
            // Check all visible belum_mulai (merge with existing)
            setSelectedIds(prev => [...new Set([...prev, ...belumMulaiVisibleIds])]);
        }
    };

    const toggleOne = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // Recipients = selected items that are actually belum_mulai with valid email
    const undanganRecipients = allData.filter(
        a => selectedIds.includes(a.id_aktivitas) && a.status_pelaksanaan === 'belum_mulai'
    );

    const recipientsWithEmail = undanganRecipients.filter(a => getRecipientEmail(a).includes('@'));

    // ── Send undangan via backend ──
    const handleSendUndangan = () => {
        if (recipientsWithEmail.length === 0) return;
        setIsSending(true);

        router.post('/admin/aktivitas/send-undangan', {
            ids: recipientsWithEmail.map(a => a.id_aktivitas),
            subject: undanganSubject,
            body: undanganBody,
        }, {
            preserveState: true,
            onFinish: () => {
                setIsSending(false);
                setShowUndangan(false);
                setSelectedIds([]);
            },
        });
    };

    return (
        <AdminLayout title="">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Aktivitas</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Pantau seluruh status pelaksanaan kegiatan PKM.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 shadow-sm rounded-md text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[12px] sm:text-[13px] font-medium text-zinc-500 mb-1">Total</div>
                        <div className="text-[24px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{listAktivitas.total}</div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-zinc-400"><Activity size={18} /></div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[12px] sm:text-[13px] font-medium text-zinc-500 mb-1">Belum Mulai</div>
                        <div className="text-[24px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{countBelumMulai}</div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-zinc-400"><Clock size={18} /></div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[12px] sm:text-[13px] font-medium text-zinc-500 mb-1">Berjalan</div>
                        <div className="text-[24px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{countBerjalan}</div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 bg-amber-50 flex items-center justify-center text-amber-500"><Activity size={18} /></div>
                </div>
                <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[12px] sm:text-[13px] font-medium text-zinc-500 mb-1">Selesai</div>
                        <div className="text-[24px] sm:text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{countSelesai}</div>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-emerald-500"><CheckCircle size={18} /></div>
                </div>
            </div>

            {/* ── Bulk action bar ── */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[13px] text-indigo-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                    </div>
                    <span className="font-bold">{selectedIds.length} aktivitas dipilih</span>
                    <span className="text-indigo-300">|</span>
                    {recipientsWithEmail.length > 0 ? (
                        <button
                            onClick={() => setShowUndangan(true)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[12px] font-bold hover:bg-indigo-700 transition-all hover:shadow-md active:scale-95"
                        >
                            <Mail size={13} /> Kirim Undangan ({recipientsWithEmail.length})
                        </button>
                    ) : (
                        <span className="text-[12px] text-indigo-400 italic">Pilih aktivitas berstatus &quot;Belum Mulai&quot; dengan email valid</span>
                    )}
                    <button
                        onClick={() => setSelectedIds([])}
                        className="ml-auto px-2 py-1 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-md transition-colors"
                        title="Hapus semua pilihan"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex flex-wrap gap-3 sm:gap-4">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text" placeholder="Cari Judul Kegiatan..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400 transition-all font-medium"
                        />
                    </div>
                    <select
                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-200 cursor-pointer transition-all">
                        <option value="">Semua Status</option>
                        <option value="belum_mulai">Belum Mulai</option>
                        <option value="persiapan">Persiapan</option>
                        <option value="berjalan">Berjalan</option>
                        <option value="selesai">Selesai</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-4 w-12">
                                    <button
                                        onClick={toggleAll}
                                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                                        style={{
                                            borderColor: allBelumMulaiChecked ? '#4f46e5' : '#d4d4d8',
                                            backgroundColor: allBelumMulaiChecked ? '#4f46e5' : 'transparent',
                                        }}
                                        title="Pilih semua belum mulai"
                                    >
                                        {allBelumMulaiChecked && <Check size={12} className="text-white" />}
                                    </button>
                                </th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-12 border-r border-zinc-100 bg-zinc-50 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('id_aktivitas')}>
                                    No {sortField === 'id_aktivitas' && (sortDir === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('created_at')}>
                                    Nama Kegiatan {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Jenis & Lokasi</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right w-32 cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('status_pelaksanaan')}>
                                    Status {sortField === 'status_pelaksanaan' && (sortDir === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium text-[13px]">Belum ada aktivitas.</td>
                                </tr>
                            ) : data.map((act) => {
                                const isBelumMulai = act.status_pelaksanaan === 'belum_mulai';
                                const checked = selectedIds.includes(act.id_aktivitas);
                                return (
                                    <tr
                                        key={act.id_aktivitas}
                                        className={`hover:bg-zinc-50/50 transition-colors group cursor-pointer ${checked ? 'bg-indigo-50/40' : ''}`}
                                        onClick={() => window.location.href = `/admin/aktivitas/${act.id_aktivitas}`}
                                    >
                                        {/* Checkbox */}
                                        <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                                            {isBelumMulai ? (
                                                <button
                                                    onClick={() => toggleOne(act.id_aktivitas)}
                                                    className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110"
                                                    style={{
                                                        borderColor: checked ? '#4f46e5' : '#d4d4d8',
                                                        backgroundColor: checked ? '#4f46e5' : 'transparent',
                                                    }}
                                                >
                                                    {checked && <Check size={12} className="text-white" />}
                                                </button>
                                            ) : (
                                                <div className="w-5 h-5" />
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-zinc-500 text-[13px] font-mono border-r border-zinc-100 bg-zinc-50/30">
                                            {act.id_aktivitas.toString().padStart(2, '0')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <a href={`/admin/aktivitas/${act.id_aktivitas}`} className="font-semibold text-zinc-900 text-[14px] group-hover:text-indigo-600 transition-colors block">
                                                {act.pengajuan?.judul_kegiatan || '-'}
                                            </a>
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[12px] mt-1.5">
                                                <Calendar size={13} className="text-zinc-400" />
                                                {act.pengajuan?.tgl_mulai ? new Date(act.pengajuan.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'TBD'}
                                                {' – '}
                                                {act.pengajuan?.tgl_selesai ? new Date(act.pengajuan.tgl_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-zinc-700 text-[13px] mb-1">
                                                {act.pengajuan?.jenis_pkm?.nama_jenis || 'General / Lainnya'}
                                            </div>
                                            <div className="flex items-center gap-1 text-zinc-500 text-[12px]">
                                                <MapPin size={12} className="text-zinc-400" />
                                                {act.pengajuan?.kota_kabupaten ? `${act.pengajuan.kota_kabupaten}, ${act.pengajuan.provinsi}` : 'Lokasi TBD'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                                                act.status_pelaksanaan === 'selesai'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : act.status_pelaksanaan === 'belum_mulai'
                                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                    : act.status_pelaksanaan === 'persiapan'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    act.status_pelaksanaan === 'selesai' ? 'bg-emerald-500'
                                                    : act.status_pelaksanaan === 'belum_mulai' ? 'bg-slate-400'
                                                    : act.status_pelaksanaan === 'persiapan' ? 'bg-blue-500'
                                                    : 'bg-amber-500'
                                                }`}></span>
                                                {act.status_pelaksanaan.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">{data.length} aktivitas ditampilkan</span>
                </div>
            </div>

            {/* ── Gmail-style compose modal ── */}
            {showUndangan && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => !isSending && setShowUndangan(false)} />

                    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-full max-w-[560px] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden" style={{ animation: 'slideUp 0.25s ease-out' }}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 text-white">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                                    <Mail size={14} />
                                </div>
                                <span className="text-[14px] font-bold">Kirim Undangan</span>
                                <span className="text-[11px] bg-white/15 rounded-md px-2 py-0.5 font-medium">{recipientsWithEmail.length} penerima</span>
                            </div>
                            <button onClick={() => !isSending && setShowUndangan(false)} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Recipients */}
                        <div className="flex items-start gap-2 px-5 py-3 border-b border-zinc-100 max-h-[120px] overflow-y-auto">
                            <span className="text-[12px] text-zinc-400 mt-1 w-14 shrink-0 font-medium">Kepada</span>
                            <div className="flex flex-wrap gap-1.5 flex-1">
                                {recipientsWithEmail.map(a => (
                                    <span key={a.id_aktivitas} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-semibold border border-indigo-100">
                                        <span className="truncate max-w-[140px]">{getRecipientName(a)}</span>
                                        <span className="text-indigo-400 text-[10px] truncate max-w-[120px]">({getRecipientEmail(a)})</span>
                                        <button onClick={() => toggleOne(a.id_aktivitas)} className="hover:text-red-500 ml-0.5 shrink-0">
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                                {undanganRecipients.length > recipientsWithEmail.length && (
                                    <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                        {undanganRecipients.length - recipientsWithEmail.length} tanpa email
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-100">
                            <span className="text-[12px] text-zinc-400 w-14 shrink-0 font-medium">Subjek</span>
                            <input
                                type="text"
                                value={undanganSubject}
                                onChange={e => setUndanganSubject(e.target.value)}
                                className="flex-1 text-[13px] text-zinc-800 font-medium outline-none placeholder-zinc-300"
                                placeholder="Tulis subjek email..."
                            />
                        </div>

                        {/* Body */}
                        <textarea
                            value={undanganBody}
                            onChange={e => setUndanganBody(e.target.value)}
                            className="px-5 py-4 text-[13px] text-zinc-700 outline-none resize-none min-h-[180px] placeholder-zinc-300 leading-relaxed"
                            placeholder="Tulis isi undangan..."
                        />

                        {/* Info + Actions */}
                        <div className="flex items-center justify-between px-5 py-3 bg-zinc-50 border-t border-zinc-100">
                            <div className="text-[11px] text-zinc-400 leading-snug">
                                Layanan: <strong>Brevo SMTP</strong> &middot; Limit: 100 email/hari
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowUndangan(false)}
                                    disabled={isSending}
                                    className="px-4 py-2 text-[12px] text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors font-medium disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSendUndangan}
                                    disabled={isSending || recipientsWithEmail.length === 0 || !undanganSubject.trim() || !undanganBody.trim()}
                                    className="px-5 py-2 text-[12px] bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" /> Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={13} /> Kirim Undangan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
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

export default AktivitasPage;
