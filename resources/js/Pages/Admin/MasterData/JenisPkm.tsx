import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { Edit2, Trash2, X, Plus, Search, Upload, ShieldCheck, Grid, Type } from 'lucide-react';

interface JenisPkm {
    id_jenis_pkm: number;
    nama_jenis: string;
    warna_icon?: string;
}

interface Props {
    listJenisPkm: JenisPkm[];
}

const JenisPkmPage: React.FC<Props> = ({ listJenisPkm }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [nama, setNama] = useState('');
    const [warna, setWarna] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const PRESET_COLORS = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
        '#d946ef', '#f43f5e', '#71717a', '#18181b'
    ];

    const openCreate = () => { setEditId(null); setNama(''); setWarna(''); setModalOpen(true); };
    const openEdit = (item: JenisPkm) => { setEditId(item.id_jenis_pkm); setNama(item.nama_jenis); setWarna(item.warna_icon || ''); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditId(null); setNama(''); setWarna(''); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            router.put(`/admin/master/jenis-pkm/${editId}`, { nama_jenis: nama, warna_icon: warna }, { onSuccess: closeModal });
        } else {
            router.post('/admin/master/jenis-pkm', { nama_jenis: nama, warna_icon: warna }, { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        setDeleteTarget(id);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/master/jenis-pkm/${deleteTarget}`, {
                onFinish: () => setDeleteTarget(null),
            });
        }
    };

    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const filtered = listJenisPkm.filter(j => j.nama_jenis.toLowerCase().includes(search.toLowerCase()));

    return (
        <AdminLayout title="">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Jenis PKM</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Kelola kategori dan klasifikasi kegiatan.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white shadow-sm transition-colors bg-zinc-900 hover:bg-zinc-800">
                    <Plus size={16} /> Kategori Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-zinc-200">
                {/* Search */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari kategori..."
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider w-12 text-center">ID</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Nama Kategori</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider w-32">Warna Ikon</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={4} className="py-12 text-center text-zinc-400 text-[13px]">Tidak ada data.</td></tr>
                            ) : filtered.map((item, i) => (
                                <tr key={item.id_jenis_pkm} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="py-4 px-6 text-zinc-400 text-[13px] text-center font-mono">{i + 1}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-400">
                                                <Grid size={15} />
                                            </div>
                                            <span className="font-semibold text-zinc-900 text-[14px]">{item.nama_jenis}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-md border border-zinc-200/50 shadow-sm" style={{ backgroundColor: item.warna_icon || '#f4f4f5' }} />
                                            <span className="font-mono text-[12px] text-zinc-500">{item.warna_icon || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"><Edit2 size={15} /></button>
                                            <button onClick={() => handleDelete(item.id_jenis_pkm)} className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50">
                    <span className="text-[12px] font-medium text-zinc-500">{filtered.length} kategori ditemukan</span>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={closeModal}>
                    <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-zinc-900">{editId ? 'Edit Kategori' : 'Kategori Baru'}</h3>
                            <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Nama Kategori <span className="text-red-500">*</span></label>
                                <input value={nama} onChange={e => setNama(e.target.value)} required placeholder="E.g., Pengabdian Mandiri"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Theme Color (Hex)</label>
                                <div className="flex gap-2 items-center mb-3">
                                    <input value={warna} onChange={e => setWarna(e.target.value)} placeholder="#e4e4e7"
                                        className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-mono outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all uppercase" />
                                    <div className="w-10 h-10 rounded-md shadow-sm border border-zinc-200 flex-shrink-0" style={{ backgroundColor: warna || '#fafafa' }} />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setWarna(color)}
                                            style={{ backgroundColor: color }}
                                            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${warna.toLowerCase() === color.toLowerCase() ? 'border-zinc-900 shadow-md scale-110' : 'border-transparent'}`}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 py-2 rounded-md text-[13px] font-medium text-white shadow-sm bg-zinc-900 hover:bg-zinc-800 transition-all">
                                    {editId ? 'Simpan Perubahan' : 'Buat Kategori'}
                                </button>
                                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-md text-[13px] font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Hapus Jenis PKM"
                message="Data jenis PKM ini akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </AdminLayout>
    );
};

export default JenisPkmPage;