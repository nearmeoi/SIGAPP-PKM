import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import {
    FileText, ExternalLink, Folder, CheckCircle, X, Clock,
    AlertCircle, RefreshCw, Plus, Trash2, Users, ArrowLeft,
    MapPin, Calendar, DollarSign, Home, Save, Activity,
    Edit, Check, Phone
} from 'lucide-react';

interface Pegawai { id_pegawai: number; nama_pegawai: string; nip?: string; }
interface TimKegiatan { id_tim: number; nama_mahasiswa?: string; peran_tim?: string; pegawai?: { nama_pegawai: string }; }
interface Aktivitas { id_aktivitas: number; status_pelaksanaan: string; catatan_pelaksanaan?: string; }
interface Arsip { id_arsip: number; nama_dokumen: string; jenis_arsip: string; url_dokumen?: string; url_arsip?: string; }

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    kebutuhan?: string;
    instansi_mitra?: string;
    no_telepon?: string;
    sumber_dana?: string;
    total_anggaran: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    status_pengajuan: string;
    catatan_admin?: string;
    created_at?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    user?: { name: string; email: string };
    jenis_pkm?: { id_jenis_pkm: number; nama_jenis: string };
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    kelurahan_desa?: string;
    alamat_lengkap?: string;
    latitude?: number;
    longitude?: number;
    tim_kegiatan?: TimKegiatan[];
    aktivitas?: Aktivitas; // hasOne - singular, not array
    arsip?: Arsip[];
}

interface Props {
    pengajuan: Pengajuan;
    listPegawai: Pegawai[];
    listJenisPkm: { id_jenis_pkm: number; nama_jenis: string; }[];
}

const statusConfig: Record<string, { label: string; text: string; bg: string; dot: string }> = {
    diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
    ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
    // selesai is a legacy status shown read-only
    selesai: { label: 'Selesai', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
};

const Detail: React.FC<Props> = ({ pengajuan, listPegawai, listJenisPkm }) => {
    const [catatan, setCatatan] = useState(pengajuan.catatan_admin || '');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [timModal, setTimModal] = useState(false);
    const [memberType, setMemberType] = useState<'dosen' | 'staff' | 'mahasiswa'>('dosen');
    const [timForm, setTimForm] = useState({ id_pegawai: '', nama_mahasiswa: '', peran_tim: '' });
    const [catatanError, setCatatanError] = useState('');

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; action: () => void }>({
        open: false, title: '', message: '', action: () => { },
    });
    const showConfirm = (title: string, message: string, action: () => void) =>
        setConfirmDialog({ open: true, title, message, action });
    const closeConfirm = () => setConfirmDialog(prev => ({ ...prev, open: false }));
    const execConfirm = () => { confirmDialog.action(); closeConfirm(); };

    const st = statusConfig[pengajuan.status_pengajuan] || statusConfig.diproses;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const handleSimpanKeputusan = () => {
        if (!selectedAction) return;
        if (selectedAction === 'direvisi' && catatan.trim().length === 0) {
            setCatatanError('Catatan Revisi wajib diisi.');
            return;
        }
        setCatatanError('');

        showConfirm('Simpan Keputusan?', `Status akan diubah menjadi "${selectedAction}".`, () => {
            router.put(`/admin/pengajuan/${pengajuan.id_pengajuan}/status`, {
                status_pengajuan: selectedAction,
                catatan_admin: selectedAction === 'direvisi' ? catatan : null,
            });
        });
    };

    const handleAddTim = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/admin/pengajuan/${pengajuan.id_pengajuan}/tim`, {
            id_pegawai: timForm.id_pegawai || null,
            nama_mahasiswa: timForm.nama_mahasiswa || null,
            peran_tim: timForm.peran_tim,
        }, { onSuccess: () => { setTimModal(false); setTimForm({ id_pegawai: '', nama_mahasiswa: '', peran_tim: '' }); } });
    };

    const handleRemoveTim = (timId: number) => {
        showConfirm('Hapus Anggota Tim', 'Anggota tim ini akan dihapus dari pengajuan.', () => {
            router.delete(`/admin/pengajuan/${pengajuan.id_pengajuan}/tim/${timId}`);
        });
    };

    const isCatatanRequired = selectedAction === 'direvisi';
    const hasCatatan = catatan.trim().length > 0;
    const canSubmit = selectedAction && (!isCatatanRequired || hasCatatan);

    const onUpdateField = (field: string, value: any) => {
        router.put(`/admin/pengajuan/${pengajuan.id_pengajuan}`, {
            [field]: value
        }, {
            preserveScroll: true,
            onError: (err) => alert('Gagal memperbarui data: ' + JSON.stringify(err))
        });
    };

    return (
        <AdminLayout title="">
            {/* Back Bar */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/pengajuan" className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm">
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center group relative mb-1">
                        <EditableInfoField
                            label=""
                            value={pengajuan.judul_kegiatan}
                            type="textarea"
                            onSave={(val) => onUpdateField('judul_kegiatan', val)}
                        />
                    </div>
                    <p className="text-[13px] text-zinc-500 mt-1">
                        Disubmit oleh <span className="font-medium text-zinc-700">{pengajuan.user?.name || '-'}</span>
                        {pengajuan.created_at && ` pada tanggal ${formatDate(pengajuan.created_at)}`}
                        <span className="mx-2 text-zinc-300">•</span>
                        <span className="font-mono">#{pengajuan.id_pengajuan.toString().padStart(2, '0')}</span>
                    </p>
                </div>
                <div className={`flex flex-shrink-0 items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-semibold tracking-wider uppercase border ${st.bg} ${st.text} border-zinc-200 shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
                    {st.label}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── LEFT COLUMN ─── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Informasi Umum */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Detail Pengajuan</h2>
                            <Activity size={16} className="text-zinc-400" />
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <EditableInfoField
                                label="Kategori"
                                value={pengajuan.jenis_pkm?.id_jenis_pkm || ''}
                                type="select"
                                options={listJenisPkm.map(j => ({ value: j.id_jenis_pkm, label: j.nama_jenis }))}
                                icon={<FileText size={16} />}
                                onSave={(val) => onUpdateField('id_jenis_pkm', val)}
                            />
                            <EditableInfoField
                                label="Instansi Mitra"
                                value={pengajuan.instansi_mitra}
                                icon={<Building size={16} />}
                                onSave={(val) => onUpdateField('instansi_mitra', val)}
                            />
                            <EditableInfoField
                                label="Sumber Dana"
                                value={pengajuan.sumber_dana}
                                icon={<Banknote size={16} />}
                                onSave={(val) => onUpdateField('sumber_dana', val)}
                            />
                            <EditableInfoField
                                label="No. Telepon"
                                value={pengajuan.no_telepon}
                                icon={<Phone size={16} />}
                                onSave={(val) => onUpdateField('no_telepon', val)}
                            />
                            <EditableInfoField
                                label="Tanggal Mulai"
                                value={pengajuan.tgl_mulai?.split('T')[0]}
                                type="date"
                                icon={<Calendar size={16} />}
                                onSave={(val) => onUpdateField('tgl_mulai', val)}
                            />
                            <EditableInfoField
                                label="Tanggal Selesai"
                                value={pengajuan.tgl_selesai?.split('T')[0]}
                                type="date"
                                icon={<Calendar size={16} />}
                                onSave={(val) => onUpdateField('tgl_selesai', val)}
                            />
                        </div>
                    </div>

                    {/* Kebutuhan Card */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Kebutuhan PKM</h2>
                            <Sparkles size={16} className="text-zinc-400" />
                        </div>
                        <div className="p-6">
                            <EditableInfoField
                                label=""
                                value={pengajuan.kebutuhan}
                                type="textarea"
                                onSave={(val) => onUpdateField('kebutuhan', val)}
                            />
                        </div>
                    </div>

                    {/* Tim PKM */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-zinc-400" />
                                <h2 className="text-[15px] font-semibold text-zinc-900">Tim PKM</h2>
                                <span className="text-[11px] text-zinc-500 bg-zinc-200/50 px-2 py-0.5 rounded-full font-semibold">{pengajuan.tim_kegiatan?.length || 0}</span>
                            </div>
                            <button onClick={() => setTimModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-sm transition-colors">
                                <Plus size={14} /> Tambah Anggota
                            </button>
                        </div>
                        {!pengajuan.tim_kegiatan || pengajuan.tim_kegiatan.length === 0 ? (
                            <div className="px-5 py-8 text-center text-zinc-400 text-[13px]">Belum ada anggota tim yang ditugaskan.</div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {pengajuan.tim_kegiatan.map(tim => (
                                    <div key={tim.id_tim} className="flex items-center gap-4 px-6 py-4 group">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-[14px] border border-zinc-200 flex-shrink-0 shadow-sm">
                                            {(tim.pegawai?.nama_pegawai || tim.nama_mahasiswa || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[14px] font-semibold text-zinc-900 truncate">{tim.pegawai?.nama_pegawai || tim.nama_mahasiswa || '-'}</div>
                                            <div className="text-[12px] font-medium text-zinc-500 mt-0.5">{tim.peran_tim || '-'}</div>
                                        </div>
                                        <button onClick={() => handleRemoveTim(tim.id_tim)} className="w-9 h-9 flex items-center justify-center rounded-md border border-transparent text-zinc-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lokasi */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Lokasi Pelaksanaan</h2>
                            <MapPin size={16} className="text-zinc-400" />
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <EditableInfoField label="Provinsi" value={pengajuan.provinsi} icon={<MapPin size={16} />} onSave={(val) => onUpdateField('provinsi', val)} />
                            <EditableInfoField label="Kota / Kabupaten" value={pengajuan.kota_kabupaten} icon={<MapPin size={16} />} onSave={(val) => onUpdateField('kota_kabupaten', val)} />
                            <EditableInfoField label="Kecamatan" value={pengajuan.kecamatan} icon={<MapPin size={16} />} onSave={(val) => onUpdateField('kecamatan', val)} />
                            <EditableInfoField label="Kelurahan / Desa" value={pengajuan.kelurahan_desa} icon={<MapPin size={16} />} onSave={(val) => onUpdateField('kelurahan_desa', val)} />
                            <EditableInfoField label="Alamat Lengkap" value={pengajuan.alamat_lengkap} type="textarea" icon={<MapPin size={16} />} onSave={(val) => onUpdateField('alamat_lengkap', val)} />
                        </div>
                    </div>

                    {/* Dokumen Lampiran */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Dokumen Lampiran</h2>
                            <Folder size={16} className="text-zinc-400" />
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { label: 'Proposal', url: pengajuan.proposal, field: 'proposal' },
                                { label: 'Surat Permohonan', url: pengajuan.surat_permohonan, field: 'surat_permohonan' },
                                { label: 'RAB', url: pengajuan.rab, field: 'rab' },
                            ].map(doc => (
                                <EditableUrl
                                    key={doc.label}
                                    label={doc.label}
                                    url={doc.url}
                                    onSave={(val) => onUpdateField(doc.field, val)}
                                />
                            ))}
                        </div>

                    </div>
                </div>

                {/* ─── RIGHT COLUMN ─── */}
                <div className="space-y-6">
                    {/* Catatan Terakhir Admin */}
                    {pengajuan.catatan_admin && (
                        <div className="flex items-start gap-3 p-5 bg-white border border-amber-200 shadow-sm rounded-xl">
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-1">Catatan Terakhir</div>
                                <p className="text-[13px] text-zinc-700 leading-relaxed font-medium whitespace-pre-wrap">{pengajuan.catatan_admin}</p>
                            </div>
                        </div>
                    )}

                    {/* Keputusan Verifikasi */}
                    {pengajuan.status_pengajuan !== 'selesai' && (
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-[14px] font-semibold text-zinc-900">Verifikasi Berkas</h2>
                            </div>
                            <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 gap-3">
                                    <p className="text-[12px] text-zinc-500 mb-1">Tentukan aksi untuk pengajuan PKM ini:</p>

                                    <button onClick={() => setSelectedAction('diterima')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'diterima' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm ring-1 ring-emerald-200' : 'bg-emerald-50/30 text-emerald-700 border-emerald-200 hover:bg-emerald-50/80 shadow-sm'}`}>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle size={18} className={selectedAction === 'diterima' ? 'text-emerald-600' : 'text-emerald-500'} />
                                            Diterima
                                        </div>
                                        {selectedAction === 'diterima' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                    </button>

                                    <button onClick={() => setSelectedAction('direvisi')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'direvisi' ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm ring-1 ring-amber-200' : 'bg-amber-50/30 text-amber-700 border-amber-200 hover:bg-amber-50/80 shadow-sm'}`}>
                                        <div className="flex items-center gap-3">
                                            <RefreshCw size={18} className={selectedAction === 'direvisi' ? 'text-amber-600' : 'text-amber-500'} />
                                            Revisi
                                        </div>
                                        {selectedAction === 'direvisi' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                    </button>

                                    <button onClick={() => setSelectedAction('ditolak')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'ditolak' ? 'bg-red-50 text-red-800 border-red-300 shadow-sm ring-1 ring-red-200' : 'bg-red-50/30 text-red-700 border-red-200 hover:bg-red-50/80 shadow-sm'}`}>
                                        <div className="flex items-center gap-3">
                                            <X size={18} className={selectedAction === 'ditolak' ? 'text-red-600' : 'text-red-500'} />
                                            Ditolak
                                        </div>
                                        {selectedAction === 'ditolak' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
                                    </button>
                                </div>

                                {selectedAction === 'direvisi' && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="flex items-center justify-between text-[12px] font-medium text-zinc-700 mb-2">
                                            Catatan Revisi
                                            <span className="text-red-500 text-[10px] uppercase tracking-wider font-bold">* Wajib</span>
                                        </label>
                                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={4}
                                            placeholder="Jelaskan bagian mana yang perlu diperbaiki oleh pengusul..."
                                            className={`w-full rounded-md border bg-white px-3 py-2.5 text-[13px] text-zinc-900 shadow-sm outline-none placeholder-zinc-400 resize-y transition-all focus:ring-2 ${isCatatanRequired && !hasCatatan ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-zinc-200 focus:border-amber-400 focus:ring-amber-100'}`}
                                        />
                                        {catatanError && <p className="text-[12px] text-red-500 mt-1.5 font-medium">{catatanError}</p>}
                                    </div>
                                )}

                                <button
                                    onClick={handleSimpanKeputusan}
                                    disabled={!canSubmit}
                                    className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl text-[14px] font-bold transition-all mt-2 ${canSubmit ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-md ring-1 ring-black/10' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}
                                >
                                    Verifikasi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tim PKM Modal */}
            {timModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0" onClick={() => setTimModal(false)}>
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-zinc-900">Tambah Anggota Tim</h3>
                            <button onClick={() => setTimModal(false)} className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddTim} className="p-6">

                            {/* Member Type Selection */}
                            <div className="flex bg-zinc-100 p-1 rounded-lg mb-6">
                                {(['dosen', 'staff', 'mahasiswa'] as const).map(type => (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => {
                                            setMemberType(type);
                                            setTimForm({ id_pegawai: '', nama_mahasiswa: '', peran_tim: '' });
                                        }}
                                        className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md capitalize transition-all ${memberType === type ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-5">
                                {(memberType === 'dosen' || memberType === 'staff') && (
                                    <div>
                                        <label className="text-[13px] font-semibold text-zinc-700 block mb-1.5">
                                            Pilih {memberType === 'dosen' ? 'Dosen' : 'Staff'} <span className="text-red-500">*</span>
                                        </label>
                                        <select value={timForm.id_pegawai} onChange={e => setTimForm({ ...timForm, id_pegawai: e.target.value })} required
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-200 focus:border-zinc-400 transition-all cursor-pointer shadow-sm">
                                            <option value="">- Pilih -</option>
                                            {listPegawai.map(p => <option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_pegawai} {p.nip ? `(${p.nip})` : ''}</option>)}
                                        </select>
                                    </div>
                                )}

                                {memberType === 'mahasiswa' && (
                                    <div>
                                        <label className="text-[13px] font-semibold text-zinc-700 block mb-1.5">Nama Mahasiswa <span className="text-red-500">*</span></label>
                                        <input value={timForm.nama_mahasiswa} onChange={e => setTimForm({ ...timForm, nama_mahasiswa: e.target.value })} required
                                            placeholder="Masukkan nama lengkap mahasiswa"
                                            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm" />
                                    </div>
                                )}

                                <div>
                                    <label className="text-[13px] font-semibold text-zinc-700 block mb-1.5">Peran Tim <span className="text-red-500">*</span></label>
                                    <input value={timForm.peran_tim} onChange={e => setTimForm({ ...timForm, peran_tim: e.target.value })} required
                                        placeholder="Contoh: Ketua, Anggota, Tim Survei, dsb."
                                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-zinc-100 mt-6">
                                <button type="submit" className="flex-1 py-2.5 rounded-lg text-[13px] font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-md transition-colors">Tambahkan</button>
                                <button type="button" onClick={() => setTimModal(false)} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 shadow-sm transition-colors">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmDialog.open}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={execConfirm}
                onCancel={closeConfirm}
                variant="warning"
            />
        </AdminLayout>
    );
};

const InfoField: React.FC<{ label: string; value?: string | null; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-start gap-4">
        {icon && <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 flex-shrink-0 shadow-sm">{icon}</div>}
        <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</div>
            <div className="text-[14px] font-medium text-zinc-900 leading-tight">{value || '-'}</div>
        </div>
    </div>
);

const EditableInfoField: React.FC<{
    label: string; value?: string | number | null; icon?: React.ReactNode;
    type?: 'text' | 'number' | 'select' | 'date' | 'textarea'; options?: { value: string | number, label: string }[];
    onSave: (val: any) => void;
}> = ({ label, value, icon, type = 'text', options = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState<any>(value || '');

    const handleSave = () => {
        setIsEditing(false);
        if (tempValue !== value) {
            onSave(type === 'number' ? Number(tempValue) : tempValue);
        }
    };
    const handleCancel = () => {
        setIsEditing(false);
        setTempValue(value || '');
    };

    const displayValue = type === 'select'
        ? (options.find(o => o.value == value)?.label || value || '-')
        : (value || '-');

    return (
        <div className="flex items-start gap-4 group">
            {icon && <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 flex-shrink-0 shadow-sm">{icon}</div>}
            <div className="flex-1 min-w-0 relative">
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</div>
                {isEditing ? (
                    <div className="flex items-center gap-2 mt-1 -ml-1">
                        {type === 'select' ? (
                            <select value={tempValue} onChange={e => setTempValue(e.target.value)} className="flex-1 text-[13px] rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 py-1.5 px-2 outline-none border bg-white">
                                <option value="">- Pilih -</option>
                                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        ) : type === 'textarea' ? (
                            <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} rows={3} className="flex-1 text-[13px] rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 py-1.5 px-2 outline-none border bg-white resize-y" />
                        ) : (
                            <input type={type} value={tempValue} onChange={e => setTempValue(e.target.value)} className="flex-1 text-[13px] rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 py-1.5 px-2 outline-none border bg-white" />
                        )}
                        <button onClick={handleSave} className="bg-zinc-900 text-white p-1.5 rounded-md hover:bg-zinc-800 transition-colors"><Check size={14} /></button>
                        <button onClick={handleCancel} className="bg-zinc-100 text-zinc-600 p-1.5 rounded-md hover:bg-zinc-200 border border-zinc-200 transition-colors"><X size={14} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="text-[14px] font-medium text-zinc-900 leading-tight">{displayValue}</div>
                        <button onClick={() => { setTempValue(value || ''); setIsEditing(true); }} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-600 transition-opacity p-1 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200">
                            <Edit size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EditableUrl: React.FC<{ label: string; url?: string | null; onSave: (val: string) => void }> = ({ label, url, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState(url || '');

    const handleSave = () => {
        setIsEditing(false);
        if (tempUrl !== url) onSave(tempUrl);
    };

    return (
        <div className="group relative">
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-zinc-500 block">{label}</label>
                {!isEditing && (
                    <button onClick={() => { setTempUrl(url || ''); setIsEditing(true); }} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-600 transition-opacity p-1 bg-zinc-50 hover:bg-zinc-100 rounded-md border border-zinc-200">
                        <Edit size={12} />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input type="url" value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://..." className="flex-1 text-[13px] rounded-md border-zinc-300 shadow-sm focus:border-indigo-500 py-2 px-3 outline-none border bg-white" />
                    <button onClick={handleSave} className="bg-zinc-900 text-white p-2 rounded-md hover:bg-zinc-800 transition-colors"><Check size={16} /></button>
                    <button onClick={() => setIsEditing(false)} className="bg-zinc-100 text-zinc-600 p-2 rounded-md hover:bg-zinc-200 border border-zinc-200 transition-colors"><X size={16} /></button>
                </div>
            ) : (
                url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-[13px] text-indigo-600 font-medium hover:bg-zinc-100 hover:border-zinc-300 transition-all shadow-sm">
                        <div className="flex items-center gap-3 truncate">
                            <FileText size={16} className="text-zinc-400" />
                            <span className="truncate">Buka File {label}</span>
                        </div>
                        <ExternalLink size={14} className="text-zinc-400" />
                    </a>
                ) : (
                    <div className="flex items-center gap-3 w-full bg-zinc-50/50 border border-zinc-100 rounded-lg px-4 py-2.5 text-[13px] text-zinc-400 italic">
                        <X size={16} className="text-zinc-300" />
                        Belum diunggah
                    </div>
                )
            )}
        </div>
    );
};

export default Detail;