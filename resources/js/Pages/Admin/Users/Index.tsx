import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Users, Plus, Edit, Trash2, Search, Shield, X, MoreHorizontal } from 'lucide-react';

interface User {
    id_user: number;
    name: string;
    email: string;
    role: string;
    created_at?: string;
}

interface PaginatedData {
    data: User[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    users: PaginatedData;
}

const ManajemenUser: React.FC<Props> = ({ users }) => {
    const data = users.data || [];
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });

    const filtered = data.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditId(null);
        setForm({ name: '', email: '', password: '', role: 'user' });
        setModalOpen(true);
    };

    const openEdit = (user: User) => {
        setEditId(user.id_user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editId) {
            router.put(`/admin/users/${editId}`, form, { onSuccess: closeModal });
        } else {
            router.post('/admin/users', form, { onSuccess: closeModal });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus user ini?')) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AdminLayout title="">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Manajemen User</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Kelola pengguna SIGAP P3M.</p>
                </div>
                {/* <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium text-white shadow-sm transition-colors bg-zinc-900 hover:bg-zinc-800">
                    <Plus size={16} /> Tambah User
                </button> */}
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all placeholder-zinc-400 text-zinc-900"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">User</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Role</th>
                                <th className="py-3 px-6 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Tanggal Akun Dibuat</th>
                                <th className="py-3 px-6 text-right w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-400 text-[13px]">
                                        Tidak ada data.
                                    </td>
                                </tr>
                            ) : filtered.map((user) => (
                                <tr key={user.id_user} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[12px] font-medium text-zinc-600">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-zinc-900 text-[14px]">{user.name}</div>
                                                <div className="text-zinc-500 text-[13px]">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-medium border ${user.role === 'admin' ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-white text-zinc-600 border-zinc-200'}`}>
                                            {user.role === 'admin' && <Shield size={12} className="text-zinc-400" />}
                                            <span className="capitalize">{user.role}</span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-[13px] text-zinc-500">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="py-3 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id_user)}
                                                className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">{users.total} total users</span>
                </div>
            </div>

            {/* Add/Edit User Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={closeModal}>
                    <div className="absolute inset-0 bg-zinc-900/20 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-lg border border-zinc-200 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-semibold text-zinc-900">{editId ? 'Edit User' : 'New User'}</h3>
                            <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Nama Lengkap</label>
                                <input type="text" required
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 transition-all placeholder-zinc-400" />
                            </div>
                            <div>
                                <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Email</label>
                                <input type="email" required
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 transition-all placeholder-zinc-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Role</label>
                                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 transition-all bg-white">
                                        <option value="user">Masyarakat</option>
                                        <option value="admin">Admin</option>
                                        <option value="dosen">Dosen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[13px] font-medium text-zinc-700 block mb-1.5">Password</label>
                                    <input type="password" required={!editId} placeholder={editId ? '(Kosongkan)' : 'Min. 8 chars'}
                                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 text-zinc-900 transition-all placeholder-zinc-400" />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="submit" className="flex-1 py-2 rounded-md text-[13px] font-medium text-white shadow-sm bg-zinc-900 hover:bg-zinc-800 transition-all">
                                    {editId ? 'Simpan Perubahan' : 'Buat User'}
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

export default ManajemenUser;
