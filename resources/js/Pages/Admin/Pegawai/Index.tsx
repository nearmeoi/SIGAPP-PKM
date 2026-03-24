import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Edit2, Trash2, X, Plus, Search, Upload, User, Users } from 'lucide-react';

interface Pegawai {
    id_pegawai: number;
    nip?: string;
    nama_pegawai: string;
    jabatan?: string;
    posisi?: string;
}

interface Props {
    listPegawai: Pegawai[];
}

const PegawaiPage: React.FC<Props> = ({ listPegawai }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ nip: '', nama_pegawai: '', jabatan: '', posisi: '' });
    const [editId, setEditId] = useState<number | null>(null);
    const [search, setSearch] = useState('');

    const openCreate = () => { setEditId(null); setForm({ nip: '', nama_pegawai: '', jabatan: '', posisi: '' }); setModalOpen(true); };
    const openEdit = (item: Pegawai) => { setEditId(item.id_pegawai); setForm({ nip: item.nip || '', nama_pegawai: item.nama_pegawai, jabatan: item.jabatan || '', posisi: item.posisi || '' }); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditId(null); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            router.put(`/admin/pegawai/${editId}`, form, { onSuccess: closeModal });
        } else {
            router.post('/admin/pegawai', form, { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus pegawai ini?')) router.delete(`/admin/pegawai/${id}`);
    };

    const handleCsvUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.xls,.xlsx';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                router.post('/admin/pegawai/import', formData);
            }
        };
        input.click();
    };

    const filtered = listPegawai.filter(p => p.nama_pegawai.toLowerCase().includes(search.toLowerCase()) || (p.nip || '').includes(search));

    return (
        <AdminLayout title="">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Data Pegawai</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Manajemen pegawai, dosen & staf.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleCsvUpload} className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-zinc-700 bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-colors">
                        <Upload size={14} /> Import CSV
                    </button>
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white shadow-sm transition-colors bg-zinc-900 hover:bg-zinc-800">
                        <Plus size={16} /> Tambah Pegawai
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau NIP..."
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider w-12 border-r border-zinc-100 bg-zinc-50">No</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Nama Lengkap & NIP</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Jabatan / Posisi</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-zinc-400 text-[13px]">Tidak ada data.</td></tr>
                            ) : filtered.map((item, i) => (
                                <tr key={item.id_pegawai} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="py-4 px-6 text-zinc-500 text-[13px] font-mono border-r border-zinc-100 bg-zinc-50/30 text-center font-medium">{String(i + 1).padStart(2, '0')}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white border border-zinc-200 text-zinc-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 text-[14px]">{item.nama_pegawai}</div>
                                                <div className="text-zinc-500 text-[12px] mt-0.5 font-mono">{item.nip || 'NIP TBD'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-zinc-900 text-[13px] font-medium">{item.jabatan || '-'}</div>
                                        <div className="text-zinc-500 text-[12px] mt-0.5">{item.posisi || '-'}</div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"><Edit2 size={15} /></button>
                                            <button onClick={() => handleDelete(item.id_pegawai)} className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">{filtered.length} pegawai yang ditampilkan</span>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={closeModal}>
                    <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-zinc-900">{editId ? 'Edit Pegawai' : 'Register New Pegawai'}</h3>
                            <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
                                <input name="nama_pegawai" value={form.nama_pegawai} onChange={handleChange} required placeholder="Masukkan Nama Lengkap & Gelar"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">NIP</label>
                                <input name="nip" value={form.nip} onChange={handleChange} placeholder="Masukkan NIP"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Jabatan</label>
                                <input name="jabatan" value={form.jabatan} onChange={handleChange} placeholder="Contoh: Dosen, Staf Administrasi, Direktur"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Posisi</label>
                                <input name="posisi" value={form.posisi} onChange={handleChange} placeholder="Contoh: Ketua Program Studi, Wakil Direktur I"
                                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 placeholder-zinc-400 transition-all" />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 py-2 rounded-md text-[13px] font-medium text-white shadow-sm bg-zinc-900 hover:bg-zinc-800 transition-all">
                                    {editId ? 'Simpan Perubahan' : 'Daftarkan Pegawai'}
                                </button>
                                <button type="button" onClick={closeModal} className="flex-1 py-2 rounded-md text-[13px] font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PegawaiPage;
