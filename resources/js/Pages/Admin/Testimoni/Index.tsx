import React, { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { Activity, MessageSquare, Plus, Edit, Trash2, X, Star } from 'lucide-react';

interface TestimoniItem {
    id_testimoni: number;
    nama_pemberi: string;
    rating: number;
    pesan_ulasan: string;
    created_at: string;
    id_aktivitas?: number | null;
    aktivitas?: {
        id_aktivitas: number;
        pengajuan?: {
            judul_kegiatan: string;
            user?: { name: string };
        };
    };
}

interface AktivitasOption {
    id_aktivitas: number;
    judul_kegiatan: string;
}

interface PaginatedData {
    data: TestimoniItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    listTestimoni: PaginatedData;
    listAktivitas?: AktivitasOption[];
}

const MetricCard = ({ title, val, subval }: { title: string, val: string | number, subval?: string }) => (
    <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
        <div>
            <div className="text-zinc-500 text-[13px] font-medium mb-1">{title}</div>
            <div className="text-zinc-900 text-[28px] font-bold tracking-tight leading-none flex items-end gap-2">
                {val} {subval && <span className="text-[14px] text-zinc-400 font-medium mb-1">{subval}</span>}
            </div>
        </div>
    </div>
);

const TestimoniPage: React.FC<Props> = ({ listTestimoni, listAktivitas = [] }) => {
    const items = listTestimoni.data || [];
    const avgRating = items.length > 0
        ? (items.reduce((acc, t) => acc + (t.rating || 0), 0) / items.length).toFixed(1)
        : '0.0';
    const positiveCount = items.filter(t => t.rating >= 4).length;
    const positivePercent = items.length > 0 ? Math.round((positiveCount / items.length) * 100) : 0;

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TestimoniItem | null>(null);
    const [form, setForm] = useState({ id_aktivitas: '', nama_pemberi: '', rating: 0, pesan_ulasan: '' });
    const [hover, setHover] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; action: () => void }>({
        open: false, title: '', message: '', action: () => {},
    });

    const openCreate = () => {
        setEditing(null);
        setForm({ id_aktivitas: '', nama_pemberi: '', rating: 0, pesan_ulasan: '' });
        setHover(0);
        setModalOpen(true);
    };

    const openEdit = (t: TestimoniItem) => {
        setEditing(t);
        setForm({
            id_aktivitas: t.id_aktivitas?.toString() || '',
            nama_pemberi: t.nama_pemberi,
            rating: t.rating,
            pesan_ulasan: t.pesan_ulasan,
        });
        setHover(t.rating);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.rating === 0) return;
        if (editing) {
            router.put(`/admin/testimoni/${editing.id_testimoni}`, {
                nama_pemberi: form.nama_pemberi,
                rating: form.rating,
                pesan_ulasan: form.pesan_ulasan,
            }, { onSuccess: () => setModalOpen(false) });
        } else {
            router.post('/admin/testimoni', {
                id_aktivitas: form.id_aktivitas || null,
                nama_pemberi: form.nama_pemberi,
                rating: form.rating,
                pesan_ulasan: form.pesan_ulasan,
            }, { onSuccess: () => setModalOpen(false) });
        }
    };

    const handleDelete = (t: TestimoniItem) => {
        setConfirmDialog({
            open: true,
            title: 'Hapus Testimoni',
            message: `Hapus testimoni dari "${t.nama_pemberi}"?`,
            action: () => router.delete(`/admin/testimoni/${t.id_testimoni}`),
        });
    };

    return (
        <AdminLayout title="">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Reviews & Feedback</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Feedback terkumpul dari peserta kegiatan pengabdian.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg text-[13px] font-semibold hover:bg-zinc-800 transition-colors shadow-sm">
                    <Plus size={14} /> Tambah Testimoni
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <MetricCard title="Average Rating" val={avgRating} subval="/ 5.0" />
                <MetricCard title="Total Reviews" val={listTestimoni.total} />
                <MetricCard title="Positive Feedback" val={`${positivePercent}%`} subval="≥ 4 stars" />
            </div>

            {/* Review cards */}
            {items.length === 0 ? (
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm py-16 flex flex-col items-center justify-center text-center">
                    <MessageSquare size={32} className="text-zinc-300 mb-3" />
                    <div className="text-zinc-900 text-[14px] font-medium">Belum ada testimoni</div>
                    <div className="text-zinc-500 text-[13px] mt-1">Klik "Tambah Testimoni" untuk menambahkan.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((t) => (
                        <div key={t.id_testimoni} className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} fill={s <= t.rating ? '#0f172a' : 'none'} className={s <= t.rating ? 'text-zinc-900' : 'text-zinc-200'} />
                                    ))}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-zinc-400 hover:text-amber-600 hover:bg-amber-50">
                                        <Edit size={13} />
                                    </button>
                                    <button onClick={() => handleDelete(t)} className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-zinc-700 text-[14px] leading-relaxed flex-1 italic">"{t.pesan_ulasan}"</p>
                            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-zinc-900 text-[13px]">{t.nama_pemberi}</div>
                                    <div className="text-zinc-400 text-[11px] mt-0.5 truncate max-w-[200px]">{t.aktivitas?.pengajuan?.judul_kegiatan || 'Unknown Event'}</div>
                                </div>
                                <div className="text-[12px] font-medium text-zinc-400">
                                    {new Date(t.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-[16px] font-bold">{editing ? 'Edit Testimoni' : 'Tambah Testimoni'}</h3>
                            <button onClick={() => setModalOpen(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!editing && (
                                <div>
                                    <label className="text-[12px] font-medium text-zinc-600 mb-1 block">Aktivitas</label>
                                    <select value={form.id_aktivitas} onChange={e => setForm({ ...form, id_aktivitas: e.target.value })}
                                        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200">
                                        <option value="">Pilih Aktivitas (opsional)</option>
                                        {listAktivitas.map(a => (
                                            <option key={a.id_aktivitas} value={a.id_aktivitas}>{a.judul_kegiatan}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-[12px] font-medium text-zinc-600 mb-1 block">Nama Pemberi</label>
                                <input type="text" value={form.nama_pemberi} onChange={e => setForm({ ...form, nama_pemberi: e.target.value })} required
                                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200" />
                            </div>
                            <div>
                                <label className="text-[12px] font-medium text-zinc-600 mb-1 block">Rating</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button type="button" key={s} onClick={() => setForm({ ...form, rating: s })} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(form.rating)}>
                                            <Star size={24} fill={(hover || form.rating) >= s ? '#0f172a' : 'none'}
                                                className={(hover || form.rating) >= s ? 'text-zinc-900' : 'text-zinc-200'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-medium text-zinc-600 mb-1 block">Pesan & Ulasan</label>
                                <textarea value={form.pesan_ulasan} onChange={e => setForm({ ...form, pesan_ulasan: e.target.value })} required rows={3}
                                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 resize-none" />
                            </div>
                            <button type="submit" disabled={form.rating === 0}
                                className="w-full bg-zinc-900 text-white py-2.5 rounded-lg text-[13px] font-bold hover:bg-zinc-800 disabled:opacity-50">
                                {editing ? 'Simpan Perubahan' : 'Tambah'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message}
                onConfirm={() => { confirmDialog.action(); setConfirmDialog(prev => ({ ...prev, open: false })); }}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, open: false }))} variant="danger" />
        </AdminLayout>
    );
};

export default TestimoniPage;
