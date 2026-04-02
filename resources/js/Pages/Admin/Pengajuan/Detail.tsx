import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import {
    File, ExternalLink, CheckCircle, X, Clock,
    AlertCircle, RotateCcw, Plus, Trash2, User, ArrowLeft,
    MapPin, Calendar, DollarSign, Home, Save, Activity,
    Check, Phone, Folder, Users
} from 'lucide-react';

interface Pegawai { id_pegawai: number; nama_pegawai: string; nip?: string; }
interface TimKegiatan { id_tim: number; nama_mahasiswa?: string; peran_tim?: string; pegawai?: { nama_pegawai: string }; }
interface Aktivitas { id_aktivitas: number; status_pelaksanaan: string; catatan_pelaksanaan?: string; }
interface Arsip { id_arsip: number; nama_dokumen: string; jenis_arsip: string; url_dokumen?: string; }

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    kebutuhan?: string;
    instansi_mitra?: string;
    no_telepon?: string;
    sumber_dana?: string;
    total_anggaran: number;
    dana_perguruan_tinggi?: number;
    dana_pemerintah?: number;
    dana_lembaga_dalam?: number;
    dana_lembaga_luar?: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    status_pengajuan: string;
    catatan_admin?: string;
    created_at?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    email?: string;
    link_tambahan?: string;
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
    aktivitas?: Aktivitas;
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
    selesai: { label: 'Selesai', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
};

const Detail: React.FC<Props> = ({ pengajuan, listPegawai, listJenisPkm }) => {
    const [catatan, setCatatan] = useState(pengajuan.catatan_admin || '');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [timModal, setTimModal] = useState(false);
    const [memberType, setMemberType] = useState<'dosen' | 'staff' | 'mahasiswa'>('dosen');
    const [timForm, setTimForm] = useState({ id_pegawai: '', nama_mahasiswa: '', peran_tim: '' });
    const [catatanError, setCatatanError] = useState('');

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
                <div className="lg:col-span-2 space-y-6">
                    {/* Empty Fields Alert */}
                    {(() => {
                        const missing = [];
                        if (!pengajuan.kebutuhan) missing.push('Kebutuhan');
                        if (!pengajuan.sumber_dana && !pengajuan.total_anggaran) missing.push('Sumber Dana');
                        if (!pengajuan.proposal) missing.push('Proposal');
                        if (!pengajuan.surat_permohonan) missing.push('Surat Permohonan');
                        if (!pengajuan.provinsi) missing.push('Lokasi');
                        if (!pengajuan.tim_kegiatan?.length) missing.push('Tim PKM');
                        if (missing.length === 0) return null;
                        return (
                            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[13px] font-bold text-amber-800">Data Belum Lengkap</div>
                                    <p className="text-[12px] text-amber-700 mt-0.5">Field berikut masih kosong: <span className="font-semibold">{missing.join(', ')}</span></p>
                                </div>
                            </div>
                        );
                    })()}
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
                                icon={<File size={16} />}
                                onSave={(val) => onUpdateField('id_jenis_pkm', val)}
                            />
                            <EditableInfoField
                                label="Instansi Mitra"
                                value={pengajuan.instansi_mitra}
                                icon={<Home size={16} />}
                                onSave={(val) => onUpdateField('instansi_mitra', val)}
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

                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Kebutuhan PKM</h2>
                            <Activity size={16} className="text-zinc-400" />
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

                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-zinc-900">Sumber Dana & Anggaran</h2>
                            <DollarSign size={16} className="text-zinc-400" />
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <EditableInfoField label="Sumber Dana (Umum)" value={pengajuan.sumber_dana} icon={<DollarSign size={16} />} onSave={(val) => onUpdateField('sumber_dana', val)} />
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0"><DollarSign size={16} /></div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Total Anggaran</div>
                                    <div className="text-[14px] font-semibold text-zinc-900">Rp {Number(pengajuan.total_anggaran || 0).toLocaleString('id-ID')}</div>
                                </div>
                            </div>
                            <EditableInfoField label="Dana Perguruan Tinggi" value={pengajuan.dana_perguruan_tinggi ? `Rp ${Number(pengajuan.dana_perguruan_tinggi).toLocaleString('id-ID')}` : ''} icon={<DollarSign size={16} />} onSave={(val) => onUpdateField('dana_perguruan_tinggi', Number(String(val).replace(/[^0-9]/g, '')))} />
                            <EditableInfoField label="Dana Pemerintah" value={pengajuan.dana_pemerintah ? `Rp ${Number(pengajuan.dana_pemerintah).toLocaleString('id-ID')}` : ''} icon={<DollarSign size={16} />} onSave={(val) => onUpdateField('dana_pemerintah', Number(String(val).replace(/[^0-9]/g, '')))} />
                            <EditableInfoField label="Dana Lembaga Dalam Negeri" value={pengajuan.dana_lembaga_dalam ? `Rp ${Number(pengajuan.dana_lembaga_dalam).toLocaleString('id-ID')}` : ''} icon={<DollarSign size={16} />} onSave={(val) => onUpdateField('dana_lembaga_dalam', Number(String(val).replace(/[^0-9]/g, '')))} />
                            <EditableInfoField label="Dana Lembaga Luar Negeri" value={pengajuan.dana_lembaga_luar ? `Rp ${Number(pengajuan.dana_lembaga_luar).toLocaleString('id-ID')}` : ''} icon={<DollarSign size={16} />} onSave={(val) => onUpdateField('dana_lembaga_luar', Number(String(val).replace(/[^0-9]/g, '')))} />
                        </div>
                    </div>

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
                            {pengajuan.link_tambahan && (
                                <div className="pt-2 border-t border-zinc-100">
                                    <div className="text-[12px] font-semibold text-zinc-500 mb-2">Tautan Tambahan</div>
                                    <div className="text-[13px] text-zinc-700 break-all">{pengajuan.link_tambahan}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {pengajuan.catatan_admin && (
                        <div className="flex items-start gap-3 p-5 bg-white border border-amber-200 shadow-sm rounded-xl">
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[12px] font-bold text-amber-700 uppercase tracking-wider mb-1">Catatan Terakhir</div>
                                <p className="text-[13px] text-zinc-700 leading-relaxed font-medium whitespace-pre-wrap">{pengajuan.catatan_admin}</p>
                            </div>
                        </div>
                    )}

                    {/* Email Pengaju */}
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Pengaju</div>
                        <div className="text-[13px] font-medium text-zinc-900">{pengajuan.user?.email || '-'}</div>
                    </div>

                    {pengajuan.status_pengajuan !== 'selesai' && (
                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-[14px] font-semibold text-zinc-900">Verifikasi Berkas</h2>
                            </div>
                            <div className="p-5 space-y-6">
                                <div className="grid grid-cols-1 gap-3">
                                    <button onClick={() => setSelectedAction('diterima')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'diterima' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm' : 'bg-emerald-50/30 text-emerald-700 border-emerald-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <CheckCircle size={18} />
                                            Diterima
                                        </div>
                                    </button>
                                    <button onClick={() => setSelectedAction('direvisi')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'direvisi' ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm' : 'bg-amber-50/30 text-amber-700 border-amber-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <RotateCcw size={18} />
                                            Revisi
                                        </div>
                                    </button>
                                    <button onClick={() => setSelectedAction('ditolak')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'ditolak' ? 'bg-red-50 text-red-800 border-red-300 shadow-sm' : 'bg-red-50/30 text-red-700 border-red-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <X size={18} />
                                            Ditolak
                                        </div>
                                    </button>
                                    {pengajuan.status_pengajuan === 'diterima' && (
                                        <button onClick={() => setSelectedAction('selesai')} className={`flex items-center justify-between px-4 py-3 rounded-lg border text-[14px] font-medium transition-all ${selectedAction === 'selesai' ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-sm' : 'bg-indigo-50/30 text-indigo-700 border-indigo-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <CheckCircle size={18} />
                                                Selesai
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {selectedAction === 'direvisi' && (
                                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={4} placeholder="Catatan revisi..." className="w-full rounded-md border border-zinc-200 p-3 text-[13px] outline-none" />
                                        {catatanError && <p className="text-[12px] text-red-500 mt-1.5">{catatanError}</p>}
                                    </div>
                                )}

                                <button onClick={handleSimpanKeputusan} disabled={!canSubmit} className={`w-full py-3 rounded-xl text-[14px] font-bold ${canSubmit ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}`}>
                                    Verifikasi
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {timModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setTimModal(false)}>
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <h3 className="text-[16px] font-bold">Tambah Tim</h3>
                            <button onClick={() => setTimModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddTim} className="p-6 space-y-4">
                            <div className="flex bg-zinc-100 p-1 rounded-lg">
                                {(['dosen', 'staff', 'mahasiswa'] as const).map(type => (
                                    <button type="button" key={type} onClick={() => setMemberType(type)} className={`flex-1 py-1 text-[13px] rounded ${memberType === type ? 'bg-white shadow-sm' : ''}`}>{type}</button>
                                ))}
                            </div>
                            {(memberType === 'dosen' || memberType === 'staff') && (
                                <select value={timForm.id_pegawai} onChange={e => setTimForm({...timForm, id_pegawai: e.target.value})} className="w-full border p-2 rounded text-[13px]">
                                    <option value="">Pilih Pegawai</option>
                                    {listPegawai.map(p => <option key={p.id_pegawai} value={p.id_pegawai}>{p.nama_pegawai}</option>)}
                                </select>
                            )}
                            {memberType === 'mahasiswa' && (
                                <input value={timForm.nama_mahasiswa} onChange={e => setTimForm({...timForm, nama_mahasiswa: e.target.value})} placeholder="Nama Mahasiswa" className="w-full border p-2 rounded text-[13px]" />
                            )}
                            <input value={timForm.peran_tim} onChange={e => setTimForm({...timForm, peran_tim: e.target.value})} placeholder="Peran" className="w-full border p-2 rounded text-[13px]" />
                            <button type="submit" className="w-full bg-zinc-900 text-white py-2 rounded text-[13px] font-bold">Simpan</button>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message} onConfirm={execConfirm} onCancel={closeConfirm} variant="warning" />
        </AdminLayout>
    );
};

const EditableInfoField: React.FC<{
    label: string; value?: string | number | null; icon?: React.ReactNode;
    type?: 'text' | 'number' | 'select' | 'date' | 'textarea'; options?: { value: string | number, label: string }[];
    onSave: (val: any) => void;
}> = ({ label, value, icon, type = 'text', options = [], onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState<any>(value || '');

    const handleSave = () => {
        setIsEditing(false);
        if (tempValue !== value) onSave(type === 'number' ? Number(tempValue) : tempValue);
    };

    const displayValue = type === 'select'
        ? (options.find(o => o.value == value)?.label || value || '-')
        : (value || '-');

    return (
        <div className="flex items-start gap-4 group">
            {icon && <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0 relative">
                {label && <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</div>}
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        {type === 'textarea' ? <textarea value={tempValue} onChange={e => setTempValue(e.target.value)} className="w-full border rounded p-1 text-[13px]" /> : <input type={type} value={tempValue} onChange={e => setTempValue(e.target.value)} className="w-full border rounded p-1 text-[13px]" />}
                        <button onClick={handleSave} className="bg-zinc-900 text-white p-1 rounded"><Check size={14} /></button>
                        <button onClick={() => setIsEditing(false)} className="bg-zinc-100 p-1 rounded"><X size={14} /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="text-[14px] font-medium text-zinc-900 leading-tight">{displayValue}</div>
                        <button onClick={() => { setTempValue(value || ''); setIsEditing(true); }} className="opacity-0 group-hover:opacity-100 text-zinc-400"><Activity size={12} /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

const EditableUrl: React.FC<{ label: string; url?: string | null; onSave: (val: string) => void }> = ({ label, url, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempUrl, setTempUrl] = useState(url || '');

    return (
        <div className="group relative">
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-semibold text-zinc-500">{label}</label>
                {!isEditing && <button onClick={() => { setTempUrl(url || ''); setIsEditing(true); }} className="opacity-0 group-hover:opacity-100 text-zinc-400"><Activity size={12} /></button>}
            </div>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input value={tempUrl} onChange={e => setTempUrl(e.target.value)} className="flex-1 border p-1 rounded text-[13px]" />
                    <button onClick={() => { setIsEditing(false); if(tempUrl !== url) onSave(tempUrl); }} className="bg-zinc-900 text-white p-1 rounded"><Check size={14} /></button>
                    <button onClick={() => setIsEditing(false)} className="bg-zinc-100 p-1 rounded"><X size={14} /></button>
                </div>
            ) : (
                url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-zinc-50 border p-2 rounded text-[13px] text-indigo-600 font-medium">
                        <div className="flex items-center gap-2"><File size={16} className="text-zinc-400" /> Buka {label}</div>
                        <ExternalLink size={14} />
                    </a>
                ) : (
                    <div className="text-[13px] text-zinc-400 italic p-2 border border-dashed rounded">Belum ada link.</div>
                )
            )}
        </div>
    );
};

export default Detail;
