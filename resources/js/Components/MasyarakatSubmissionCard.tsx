import React, { useRef, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';
import type { PkmData } from '@/types';

interface Submission {
    id: number;
    judul: string;
    ringkasan: string;
    tanggal: string;
    status: string;
    catatan?: string;
    instansi_mitra?: string;
    no_telepon?: string;
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    kelurahan_desa?: string;
    alamat_lengkap?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    sumber_dana?: string;
    total_anggaran?: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    jenis_pkm?: string;
}

interface MasyarakatSubmissionCardProps {
    submissionStatus?: string;
    latestSubmission?: Submission | null;
    pkmStatusData?: PkmData | null;
    pkmListData?: PkmData[];
    submissionHistory?: Submission[];
    onSubmitted?: (submission: Submission) => void;
    onUpdateSubmissionStatus?: (status: string) => void;
    hideInlineStatusPanel?: boolean;
    hideMainTabNav?: boolean;
    onlyShowStatus?: boolean;
}

const createSubmittedLabel = (): string =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date());

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1E4A8C' },
        ditangguhkan: { label: 'Revisi', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' },
        ditolak: { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' },
        diterima: { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' },
        berlangsung: { label: 'Berlangsung', icon: 'fa-person-walking', bg: '#fef3c7', color: '#b45309' },
        selesai: { label: 'Selesai', icon: 'fa-flag-checkered', bg: '#dcfce7', color: '#15803d' },
        belum_diajukan: { label: 'Belum Diajukan', icon: 'fa-file-circle-plus', bg: '#f1f5f9', color: '#64748b' },
    };
    return styles[status] || styles.belum_diajukan;
};

interface FormData {
    name: string;
    institution: string;
    email: string;
    whatsapp: string;
    needs: string;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    kelurahan_desa: string;
    alamat_lengkap: string;
    surat_permohonan: string;
    surat_proposal: string;
    link_tambahan: string[];
}

export default function MasyarakatSubmissionCard({
    submissionStatus = 'belum_diajukan',
    latestSubmission = null,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    onSubmitted,
    onUpdateSubmissionStatus,
    hideInlineStatusPanel = false,
    hideMainTabNav = false,
    onlyShowStatus = false,
}: MasyarakatSubmissionCardProps) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [selectedDetail, setSelectedDetail] = useState<Submission | null>(null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string }>({ show: false, type: 'success', title: '', message: '' });

    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        name: '',
        institution: '',
        email: '',
        whatsapp: '',
        needs: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan_desa: '',
        alamat_lengkap: '',
        surat_permohonan: '',
        surat_proposal: '',
        link_tambahan: [''],
    });

    const [filePermohonan, setFilePermohonan] = useState<File | null>(null);
    const [fileProposal, setFileProposal] = useState<File | null>(null);

    const handleAddLink = () => setData('link_tambahan', [...data.link_tambahan, '']);
    const handleRemoveLink = (index: number) => setData('link_tambahan', data.link_tambahan.filter((_, i) => i !== index));
    const handleLinkChange = (index: number, value: string) => {
        const updated = [...data.link_tambahan];
        updated[index] = value;
        setData('link_tambahan', updated);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.name.trim() || !data.institution.trim() || !data.needs.trim() || !filePermohonan) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon lengkapi data identitas, kebutuhan, dan upload surat permohonan.' });
            return;
        }

        setIsMockSubmitting(true);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('institution', data.institution);
        formData.append('email', data.email);
        formData.append('whatsapp', data.whatsapp);
        formData.append('needs', data.needs);
        formData.append('provinsi', data.provinsi);
        formData.append('kota_kabupaten', data.kota_kabupaten);
        formData.append('kecamatan', data.kecamatan);
        formData.append('kelurahan_desa', data.kelurahan_desa);
        formData.append('alamat_lengkap', data.alamat_lengkap);
        if (filePermohonan) formData.append('surat_permohonan', filePermohonan);
        if (fileProposal) formData.append('surat_proposal', fileProposal);
        data.link_tambahan.filter(v => v.trim() !== '').forEach(v => formData.append('link_tambahan[]', v));

        router.post('/pengajuan', formData as any, {
            preserveScroll: true,
            onSuccess: () => {
                setIsMockSubmitting(false);
                onSubmitted?.({ 
                    id: Date.now(), 
                    judul: `Pengajuan PKM ${data.institution}`, 
                    ringkasan: data.needs, 
                    tanggal: createSubmittedLabel(), 
                    status: 'diproses' 
                });
                onUpdateSubmissionStatus?.('diproses');
                setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Pengajuan Anda telah dikirim.' });
                reset();
            },
            onError: () => {
                setIsMockSubmitting(false);
                setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Mengirim', message: 'Terjadi kesalahan saat mengirim pengajuan.' });
            },
        });
    };

    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const style = getSubmissionStatusStyle(selectedDetail.status);
        
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setSelectedDetail(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-poltekpar-primary text-white flex items-center justify-center shadow-md">
                                <i className="fa-solid fa-file-contract text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedDetail.judul}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">{selectedDetail.tanggal}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                <i className={`fa-solid ${style.icon}`}></i>
                                {style.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Pemohon</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500">Instansi:</span> <span className="text-slate-900 font-semibold">{selectedDetail.instansi_mitra || '-'}</span></p>
                                        <p><span className="text-slate-500">WhatsApp:</span> <span className="text-slate-900 font-semibold">{selectedDetail.no_telepon || '-'}</span></p>
                                        {selectedDetail.jenis_pkm && <p><span className="text-slate-500">Jenis PKM:</span> <span className="text-slate-900 font-semibold">{selectedDetail.jenis_pkm}</span></p>}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi PKM</h4>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                                        {selectedDetail.alamat_lengkap && <p className="mb-1 font-medium">{selectedDetail.alamat_lengkap}</p>}
                                        <p>{[selectedDetail.kelurahan_desa, selectedDetail.kecamatan, selectedDetail.kota_kabupaten, selectedDetail.provinsi].filter(Boolean).join(', ') || '-'}</p>
                                    </div>
                                </section>

                                {(selectedDetail.sumber_dana || selectedDetail.total_anggaran) && (
                                    <section>
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anggaran</h4>
                                        <div className="space-y-1 text-sm">
                                            {selectedDetail.sumber_dana && <p><span className="text-slate-500">Sumber Dana:</span> <span className="text-slate-900 font-semibold">{selectedDetail.sumber_dana}</span></p>}
                                            {selectedDetail.total_anggaran && Number(selectedDetail.total_anggaran) > 0 && <p><span className="text-slate-500">Total:</span> <span className="text-slate-900 font-semibold">Rp {Number(selectedDetail.total_anggaran).toLocaleString('id-ID')}</span></p>}
                                        </div>
                                    </section>
                                )}
                            </div>

                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kebutuhan PKM</h4>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
                                        "{selectedDetail.ringkasan || '-'}"
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dokumen Pendukung</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDetail.surat_permohonan && <a href={selectedDetail.surat_permohonan} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-contract mr-1.5"></i>PERMOHONAN</a>}
                                        {selectedDetail.proposal && <a href={selectedDetail.proposal} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-pdf mr-1.5"></i>PROPOSAL</a>}
                                        {selectedDetail.rab && <a href={selectedDetail.rab} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-link mr-1.5"></i>TAUTAN</a>}
                                        {!selectedDetail.surat_permohonan && !selectedDetail.proposal && !selectedDetail.rab && <span className="text-xs text-slate-400">Tidak ada dokumen</span>}
                                    </div>
                                </section>

                                {(selectedDetail.tgl_mulai || selectedDetail.tgl_selesai) && (
                                    <section>
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Periode Kegiatan</h4>
                                        <div className="space-y-1 text-sm">
                                            {selectedDetail.tgl_mulai && <p><span className="text-slate-500">Mulai:</span> <span className="text-slate-900 font-semibold">{selectedDetail.tgl_mulai}</span></p>}
                                            {selectedDetail.tgl_selesai && <p><span className="text-slate-500">Selesai:</span> <span className="text-slate-900 font-semibold">{selectedDetail.tgl_selesai}</span></p>}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        {selectedDetail.catatan && (
                            <section>
                                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <i className="fa-solid fa-comment-dots"></i> Catatan Admin
                                </h4>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-sm text-amber-800 italic leading-relaxed">{selectedDetail.catatan}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            </div>
        );
    };

    if (onlyShowStatus) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Nama Pengajuan</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissionHistory.length > 0 ? (
                                    submissionHistory.map(item => {
                                        const style = getSubmissionStatusStyle(item.status);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <strong className="text-[14px] font-bold text-slate-900 block group-hover:text-poltekpar-primary transition-colors">{item.judul}</strong>
                                                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.ringkasan}</span>
                                                </td>
                                                <td className="px-6 py-5 text-[13px] text-slate-600 font-medium whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                                            <i className={`fa-solid ${style.icon} text-[9px]`}></i>{style.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button type="button" className="px-4 py-1.5 bg-slate-100 hover:bg-poltekpar-primary hover:text-white text-slate-600 text-[11px] font-bold rounded-lg transition-all" onClick={() => setSelectedDetail(item)}>DETAIL</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-bold italic">
                                            <div className="flex flex-col items-center gap-3">
                                                <i className="fa-solid fa-folder-open text-4xl text-slate-200"></i>
                                                Belum ada riwayat pengajuan.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                {renderDetailModal()}
            </div>
        );
    }

    const renderSubmissionTab = () => (
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-id-card text-poltekpar-primary"></i>Identitas Pengusul</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Lengkap / Perwakilan <span className="text-red-500">*</span></label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary focus:ring-2 focus:ring-blue-100" placeholder="Masukkan nama" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Instansi / Organisasi <span className="text-red-500">*</span></label><input type="text" value={data.institution} onChange={e => setData('institution', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Nama instansi" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Email <span className="text-red-500">*</span></label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="email@contoh.com" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">WhatsApp <span className="text-red-500">*</span></label><input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="0812..." /></div>
                </div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-handshake-angle text-poltekpar-primary"></i>Kebutuhan PKM</h3>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Deskripsi Kebutuhan / Permintaan <span className="text-red-500">*</span></label><textarea value={data.needs} onChange={e => setData('needs', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary resize-none" placeholder="Jelaskan kebutuhan pengabdian..." /></div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-map-location-dot text-poltekpar-primary"></i>Lokasi PKM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Provinsi <span className="text-red-500">*</span></label><input type="text" value={data.provinsi} onChange={e => setData('provinsi', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Provinsi" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kota / Kabupaten <span className="text-red-500">*</span></label><input type="text" value={data.kota_kabupaten} onChange={e => setData('kota_kabupaten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kota/Kabupaten" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kecamatan</label><input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kecamatan" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kelurahan / Desa</label><input type="text" value={data.kelurahan_desa} onChange={e => setData('kelurahan_desa', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Kelurahan/Desa" /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label><textarea value={data.alamat_lengkap} onChange={e => setData('alamat_lengkap', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary resize-none" placeholder="Detail alamat..." /></div>
                </div>
            </section>

            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-link text-poltekpar-primary"></i>Tautan Dokumen</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Surat Permohonan <span className="text-red-500">*</span></label><input type="file" accept=".pdf,.doc,.docx" onChange={e => setFilePermohonan(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-poltekpar-primary/10 file:text-poltekpar-primary" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Proposal (Opsional)</label><input type="file" accept=".pdf,.doc,.docx" onChange={e => setFileProposal(e.target.files?.[0] || null)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-poltekpar-primary/10 file:text-poltekpar-primary" /></div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-700">Link Tambahan</label>
                        {data.link_tambahan.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="url" value={l} onChange={e => handleLinkChange(i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-poltekpar-primary" placeholder="Link lainnya..." />
                                {data.link_tambahan.length > 1 && <button type="button" onClick={() => handleRemoveLink(i)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500"><i className="fa-solid fa-trash-can"></i></button>}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddLink} className="text-xs font-bold text-poltekpar-primary hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Tautan Lagi</button>
                    </div>
                </div>
            </section>

            <button type="submit" disabled={isMockSubmitting} className="w-full py-3.5 bg-poltekpar-primary hover:bg-poltekpar-navy text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                {isMockSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Mengirim...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan</>}
            </button>
        </form>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3><p className="text-sm text-slate-500 mt-0.5">Formulir pengajuan untuk masyarakat</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                </div>
            )}
            {!hideMainTabNav && mainTab === 'arsip' ? null : renderSubmissionTab()}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            {renderDetailModal()}
        </div>
    );
}
