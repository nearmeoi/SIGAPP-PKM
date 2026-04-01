import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { ExternalLink, Search, Folder, X, FileText, Eye, Plus, Trash2 } from 'lucide-react';

interface ArsipItem {
    id_arsip: number;
    nama_dokumen: string;
    jenis_arsip: string;
    url_dokumen?: string;
    url_arsip?: string;
    keterangan?: string;
    created_at: string;
    pengajuan?: {
        id_pengajuan: number;
        judul_kegiatan: string;
        user?: { name: string };
    };
}

interface PaginatedData {
    data: ArsipItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    listArsip: PaginatedData;
    filters: {
        search: string;
    };
}

const jenisOptions = [
    { value: 'laporan_akhir', label: 'Laporan Akhir' },
    { value: 'daftar_hadir', label: 'Daftar Hadir' },
    { value: 'foto_kegiatan', label: 'Foto Kegiatan' },
    { value: 'dokumen_lain', label: 'Dokumen Lain' },
];

const jenisLabel: Record<string, string> = {
    laporan_akhir: 'Laporan Akhir',
    daftar_hadir: 'Daftar Hadir',
    foto_kegiatan: 'Foto Kegiatan',
    dokumen_lain: 'Dokumen Lain',
};

const ArsipPage: React.FC<Props> = ({ listArsip, filters }) => {
    const [previewItem, setPreviewItem] = useState<ArsipItem | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        id_pengajuan: '',
        nama_dokumen: '',
        jenis_arsip: 'laporan_akhir',
        url_dokumen: '',
        keterangan: '',
    });

    const items = listArsip.data || [];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== filters.search) {
                router.get('/admin/arsip', { search }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/arsip', form, {
            onSuccess: () => {
                setModalOpen(false);
                setForm({ id_pengajuan: '', nama_dokumen: '', jenis_arsip: 'laporan_akhir', url_dokumen: '', keterangan: '' });
            },
        });
    };

    const handleDelete = (id: number) => {
        setDeleteTarget(id);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/arsip/${deleteTarget}`, {
                onFinish: () => setDeleteTarget(null),
            });
        }
    };

    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    return (
        <AdminLayout title="">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Kelola Arsip</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Sistem direktori dokumen pengabdian kepada masyarakat.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white shadow-sm transition-colors bg-zinc-900 hover:bg-zinc-800"
                >
                    <Plus size={16} /> Arsip Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari dokumen berdasarkan nama atau kegiatan..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Dokumen</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Kegiatan Terkait</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Jenis</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Tanggal Ditambahkan</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-right w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium text-[13px]">Tidak ada dokumen arsip yang ditemukan.</td>
                                </tr>
                            ) : items.map((a) => (
                                <tr key={a.id_arsip} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 flex-shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div className="font-semibold text-zinc-900 text-[14px]">
                                                {a.nama_dokumen}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-[13px] text-zinc-600 font-medium truncate max-w-[250px]" title={a.pengajuan?.judul_kegiatan || ''}>
                                            {a.pengajuan?.judul_kegiatan || 'Kegiatan Tidak Ditemukan'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
                                            <FolderOpen size={12} className="opacity-70" /> {jenisLabel[a.jenis_arsip] || a.jenis_arsip}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[13px] text-zinc-500">
                                        {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setPreviewItem(a)}
                                                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(a.id_arsip)}
                                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">{listArsip.total} total dokumen</span>
                </div>
            </div>

            {/* Preview Modal */}
            {previewItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={() => setPreviewItem(null)}>
                    <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg border border-zinc-200" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <div className="text-[15px] font-semibold text-zinc-900">{previewItem.nama_dokumen}</div>
                                    <div className="text-[12px] text-zinc-500 mt-0.5">{previewItem.pengajuan?.judul_kegiatan || '-'}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Link Akses Dokumen</div>
                                <div className="bg-zinc-50 rounded-md border border-zinc-200 p-3">
                                    <p className="text-[12px] text-zinc-700 break-all font-mono">{previewItem.url_dokumen || previewItem.url_arsip || '-'}</p>
                                </div>
                            </div>
                            {previewItem.keterangan && (
                                <div>
                                    <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Informasi Tambahan</div>
                                    <div className="bg-zinc-50 rounded-md border border-zinc-200 p-3">
                                        <p className="text-[13px] text-zinc-700">{previewItem.keterangan}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex gap-3">
                                {(previewItem.url_dokumen || previewItem.url_arsip) && (
                                    <a
                                        href={previewItem.url_dokumen || previewItem.url_arsip}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-medium text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm"
                                    >
                                        <ExternalLink size={14} /> Buka di Tab Baru
                                    </a>
                                )}
                                <button
                                    onClick={() => setPreviewItem(null)}
                                    className="flex-1 py-2 rounded-md text-[13px] font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Arsip Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={() => setModalOpen(false)}>
                    <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-zinc-900">Tambah Arsip</h3>
                            <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">ID Pengajuan <span className="text-red-500">*</span></label>
                                <input name="id_pengajuan" value={form.id_pengajuan} onChange={e => setForm({ ...form, id_pengajuan: e.target.value })} required type="number" placeholder="Linked Event ID"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Judul Dokumen <span className="text-red-500">*</span></label>
                                <input value={form.nama_dokumen} onChange={e => setForm({ ...form, nama_dokumen: e.target.value })} required placeholder="E.g., Laporan Akhir v2"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Jenis <span className="text-red-500">*</span></label>
                                <select value={form.jenis_arsip} onChange={e => setForm({ ...form, jenis_arsip: e.target.value })}
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 transition-all cursor-pointer">
                                    {jenisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Link Akses Dokumen <span className="text-red-500">*</span></label>
                                <input value={form.url_dokumen} onChange={e => setForm({ ...form, url_dokumen: e.target.value })} required type="url" placeholder="https://drive.google.com/..."
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Informasi Tambahan</label>
                                <textarea value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Optional description" rows={2}
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all resize-none" />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="submit" className="flex-1 py-2 rounded-md text-[13px] font-medium text-white shadow-sm bg-zinc-900 hover:bg-zinc-800 transition-all">Simpan Dokumen</button>
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-md text-[13px] font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Hapus Arsip"
                message="Data arsip ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </AdminLayout>
    );
};

export default ArsipPage;