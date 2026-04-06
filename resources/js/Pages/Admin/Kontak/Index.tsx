import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Edit, Plus, Trash2, X } from 'lucide-react';

interface Kontak {
    id_kontak: number;
    platform: string;
    nilai_kontak: string;
    label: string | null;
    ikon: string | null;
}

export default function KontakIndex({ auth, kontaks }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [form, setForm] = useState({
        platform: '',
        nilai_kontak: '',
        label: '',
        ikon: ''
    });

    const resetForm = () => {
        setForm({ platform: '', nilai_kontak: '', label: '', ikon: '' });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleEdit = (k: Kontak) => {
        setForm({
            platform: k.platform,
            nilai_kontak: k.nilai_kontak,
            label: k.label || '',
            ikon: k.ikon || ''
        });
        setEditingId(k.id_kontak);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(`/admin/kontak/${deleteId}`, {
                onFinish: () => setDeleteId(null)
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (editingId) {
            router.put(`/admin/kontak/${editingId}`, form, {
                onSuccess: () => {
                    resetForm();
                },
                onFinish: () => setSubmitting(false)
            });
        } else {
            router.post('/admin/kontak', form, {
                onSuccess: () => {
                    resetForm();
                },
                onFinish: () => setSubmitting(false)
            });
        }
    };

    const commonPlatforms = [
        { name: 'WhatsApp / Telepon', icon: 'fa-brands fa-whatsapp' },
        { name: 'Instagram', icon: 'fa-brands fa-instagram' },
        { name: 'Email', icon: 'fa-solid fa-envelope' },
        { name: 'Facebook', icon: 'fa-brands fa-facebook' },
        { name: 'Alamat / Lokasi', icon: 'fa-solid fa-map-marker-alt' },
        { name: 'Lainnya', icon: 'fa-solid fa-address-book' }
    ];

    const handlePlatformSelect = (p: any) => {
        setForm({ ...form, platform: p.name, ikon: p.icon });
    };

    return (
        <AdminLayout title="Manajemen Kontak">
            <Head title="Manajemen Kontak" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Kontak</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola data kontak dinamis untuk ditampilkan pada Landing Page</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-poltekpar-primary text-white rounded-lg hover:bg-poltekpar-navy transition-colors font-medium text-sm shadow-sm"
                >
                    <Plus size={18} />
                    <span>Tambah Kontak</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-16">No</th>
                                <th className="px-6 py-4 font-semibold">Ikon</th>
                                <th className="px-6 py-4 font-semibold">Platform & Label</th>
                                <th className="px-6 py-4 font-semibold">Detail Kontak</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {kontaks.length > 0 ? (
                                kontaks.map((item: Kontak, index: number) => (
                                    <tr key={item.id_kontak} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-center">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-poltekpar-primary flex items-center justify-center">
                                                <i className={`${item.ikon || 'fa-solid fa-circle-info'} text-lg`}></i>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{item.platform}</p>
                                            {item.label && <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-pre-wrap">{item.nilai_kontak}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id_kontak)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Belum ada data kontak.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={resetForm}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingId ? 'Edit Kontak' : 'Tambah Kontak Baru'}
                            </h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto w-full custom-scrollbar">
                            <form id="kontakForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">Preset Cepat (Opsional)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {commonPlatforms.map(p => (
                                            <button type="button" key={p.name} onClick={() => handlePlatformSelect(p)} 
                                                className="text-xs bg-slate-100 hover:bg-poltekpar-primary hover:text-white text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5">
                                                <i className={p.icon}></i> {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Nama Platform / Jenis <span className="text-rose-500">*</span></label>
                                    <input required type="text" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-poltekpar-primary focus:ring-1 focus:ring-poltekpar-primary" placeholder="Cth: WhatsApp / Instagram" />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Nilai Kontak / Detail <span className="text-rose-500">*</span></label>
                                    <textarea required rows={3} value={form.nilai_kontak} onChange={e => setForm({...form, nilai_kontak: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-poltekpar-primary focus:ring-1 focus:ring-poltekpar-primary" placeholder="Cth: 08123456789 atau link tautan" />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Label Keterangan (Opsional)</label>
                                    <input type="text" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-poltekpar-primary focus:ring-1 focus:ring-poltekpar-primary" placeholder="Cth: Hubungi kami hanya di jam kerja" />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Class Ikon FontAwesome (Opsional)</label>
                                    <input type="text" value={form.ikon} onChange={e => setForm({...form, ikon: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-poltekpar-primary focus:ring-1 focus:ring-poltekpar-primary font-mono text-xs" placeholder="fa-brands fa-whatsapp" />
                                    {form.ikon && <div className="mt-2 text-sm text-slate-500">Preview: <i className={`${form.ikon} ml-2 text-poltekpar-primary text-lg`}></i></div>}
                                </div>
                            </form>
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Batal</button>
                            <button type="submit" form="kontakForm" disabled={submitting} className="px-6 py-2 text-sm font-medium bg-poltekpar-primary text-white rounded-lg hover:bg-poltekpar-navy transition-colors shadow-sm disabled:opacity-70">
                                {submitting ? 'Menyimpan...' : 'Simpan Kontak'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
