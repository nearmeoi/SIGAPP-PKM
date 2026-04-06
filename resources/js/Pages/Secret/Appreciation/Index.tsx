import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { User, Image as ImageIcon, Plus, Edit, Trash2, X } from 'lucide-react';

interface Dev {
    id_developer: number;
    nama: string;
    peran: string | null;
    asal_instansi: string | null;
    foto: string | null;
    urutan: number;
}

interface Doc {
    id_dokumentasi: number;
    judul: string;
    deskripsi: string | null;
    foto: string;
    urutan: number;
}

export default function AppreciationAdmin({ auth, developers, docs }: any) {
    const [submitting, setSubmitting] = useState(false);

    // Dev Modal
    const [devModal, setDevModal] = useState(false);
    const [devEditingId, setDevEditingId] = useState<number | null>(null);
    const [devForm, setDevForm] = useState({ nama: '', peran: '', asal_instansi: '', foto: '', urutan: 0 });

    const openDevModal = (dev?: Dev) => {
        if (dev) {
            setDevForm({ nama: dev.nama, peran: dev.peran || '', asal_instansi: dev.asal_instansi || '', foto: dev.foto || '', urutan: dev.urutan });
            setDevEditingId(dev.id_developer);
        } else {
            setDevForm({ nama: '', peran: '', asal_instansi: '', foto: '', urutan: 0 });
            setDevEditingId(null);
        }
        setDevModal(true);
    };

    const submitDev = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (devEditingId) {
            router.put(`/secret/appreciation/dev/${devEditingId}`, devForm, {
                onSuccess: () => { setDevModal(false); },
                onFinish: () => setSubmitting(false)
            });
        } else {
            router.post('/secret/appreciation/dev', devForm, {
                onSuccess: () => { setDevModal(false); },
                onFinish: () => setSubmitting(false)
            });
        }
    };

    const deleteDev = (id: number) => {
        if (confirm('Hapus developer ini?')) {
            router.delete(`/secret/appreciation/dev/${id}`);
        }
    };

    // Doc Modal
    const [docModal, setDocModal] = useState(false);
    const [docEditingId, setDocEditingId] = useState<number | null>(null);
    const [docForm, setDocForm] = useState({ judul: '', deskripsi: '', foto: '', urutan: 0 });

    const openDocModal = (doc?: Doc) => {
        if (doc) {
            setDocForm({ judul: doc.judul, deskripsi: doc.deskripsi || '', foto: doc.foto, urutan: doc.urutan });
            setDocEditingId(doc.id_dokumentasi);
        } else {
            setDocForm({ judul: '', deskripsi: '', foto: '', urutan: 0 });
            setDocEditingId(null);
        }
        setDocModal(true);
    };

    const submitDoc = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        if (docEditingId) {
            router.put(`/secret/appreciation/doc/${docEditingId}`, docForm, {
                onSuccess: () => { setDocModal(false); },
                onFinish: () => setSubmitting(false)
            });
        } else {
            router.post('/secret/appreciation/doc', docForm, {
                onSuccess: () => { setDocModal(false); },
                onFinish: () => setSubmitting(false)
            });
        }
    };

    const deleteDoc = (id: number) => {
        if (confirm('Hapus dokumentasi ini?')) {
            router.delete(`/secret/appreciation/doc/${id}`);
        }
    };

    return (
        <AdminLayout title="Secret Panel">

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Developer & Kru</h1>
                    <p className="text-sm font-bold text-slate-400 mt-1">Konfigurasi panel apresiasi /developer-crew</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* Developer List */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"><User size={16} /></span>
                            Anggota Tim
                        </h2>
                        <button onClick={() => openDevModal()} className="px-4 py-2 bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-indigo-600 transition-colors">
                            <Plus size={16} /> Tambah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {developers.map((dev: Dev) => (
                            <div key={dev.id_developer} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 shadow-inner">
                                    {dev.foto ? <img src={dev.foto} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={24} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-slate-800 truncate">{dev.nama}</h3>
                                    <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">{dev.peran}</p>
                                    <p className="text-xs text-slate-400 mt-1 truncate">{dev.asal_instansi}</p>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-500 rounded-lg text-xs font-bold mb-1" title="Urutan">{dev.urutan}</span>
                                    <button onClick={() => openDevModal(dev)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"><Edit size={14} /></button>
                                    <button onClick={() => deleteDev(dev.id_developer)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                        {developers.length === 0 && <div className="col-span-full py-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">Belum ada tim</div>}
                    </div>
                </div>

                {/* Documentation List */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center"><ImageIcon size={16} /></span>
                            Dokumentasi Project
                        </h2>
                        <button onClick={() => openDocModal()} className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-pink-600 transition-colors">
                            <Plus size={16} /> Tambah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {docs.map((doc: Doc) => (
                            <div key={doc.id_dokumentasi} className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden relative group">
                                <div className="aspect-video bg-slate-200 w-full">
                                    {doc.foto ? <img src={doc.foto} alt="" className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-2">
                                            <h3 className="font-black text-slate-800">{doc.judul}</h3>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.deskripsi}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => openDocModal(doc)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"><Edit size={14} /></button>
                                            <button onClick={() => deleteDoc(doc.id_dokumentasi)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[10px] font-bold text-white shadow-sm">Urutan: {doc.urutan}</div>
                                </div>
                            </div>
                        ))}
                        {docs.length === 0 && <div className="col-span-full py-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">Belum ada dokumentasi</div>}
                    </div>
                </div>
            </div>

            {/* Dev Modal */}
            {devModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDevModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800">{devEditingId ? 'Edit Anggota' : 'Anggota Baru'}</h3>
                            <button onClick={() => setDevModal(false)} className="text-slate-400 hover:text-slate-800"><X /></button>
                        </div>
                        <form onSubmit={submitDev} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Nama</label> <input required type="text" value={devForm.nama} onChange={e => setDevForm({...devForm, nama: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Peran</label> <input type="text" value={devForm.peran} onChange={e => setDevForm({...devForm, peran: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" placeholder="Cth: Fullstack Developer" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Asal Instansi</label> <input type="text" value={devForm.asal_instansi} onChange={e => setDevForm({...devForm, asal_instansi: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" placeholder="Cth: Univ XYZ" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Link Foto</label> <input type="text" value={devForm.foto} onChange={e => setDevForm({...devForm, foto: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Urutan</label> <input required type="number" value={devForm.urutan} onChange={e => setDevForm({...devForm, urutan: parseInt(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div className="pt-4"><button disabled={submitting} type="submit" className="w-full py-3 bg-indigo-500 text-white rounded-xl font-black text-sm">{submitting ? 'Menyimpan...' : 'Simpan'}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* Doc Modal */}
            {docModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDocModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800">{docEditingId ? 'Edit Dokumentasi' : 'Dokumentasi Baru'}</h3>
                            <button onClick={() => setDocModal(false)} className="text-slate-400 hover:text-slate-800"><X /></button>
                        </div>
                        <form onSubmit={submitDoc} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Judul</label> <input required type="text" value={docForm.judul} onChange={e => setDocForm({...docForm, judul: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label> <textarea value={docForm.deskripsi} onChange={e => setDocForm({...docForm, deskripsi: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" rows={3}></textarea></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Link Foto</label> <input required type="text" value={docForm.foto} onChange={e => setDocForm({...docForm, foto: e.target.value})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Urutan</label> <input required type="number" value={docForm.urutan} onChange={e => setDocForm({...docForm, urutan: parseInt(e.target.value)})} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" /></div>
                            <div className="pt-4"><button disabled={submitting} type="submit" className="w-full py-3 bg-pink-500 text-white rounded-xl font-black text-sm">{submitting ? 'Menyimpan...' : 'Simpan'}</button></div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
