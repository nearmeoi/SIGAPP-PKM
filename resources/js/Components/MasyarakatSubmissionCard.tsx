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

const getPkmStatusLabel = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1d4ed8' },
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
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(pkmListData[0]?.id ?? null);
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

    const handleAddLink = () => setData('link_tambahan', [...data.link_tambahan, '']);
    const handleRemoveLink = (index: number) => setData('link_tambahan', data.link_tambahan.filter((_, i) => i !== index));
    const handleLinkChange = (index: number, value: string) => {
        const updated = [...data.link_tambahan];
        updated[index] = value;
        setData('link_tambahan', updated);
    };

    const requiredSubmissionIssues: string[] = [];
    if (!data.name.trim()) requiredSubmissionIssues.push('Nama wajib diisi.');
    if (!data.institution.trim()) requiredSubmissionIssues.push('Nama instansi wajib diisi.');
    if (!data.email.trim()) requiredSubmissionIssues.push('Email wajib diisi.');
    if (!data.whatsapp.trim()) requiredSubmissionIssues.push('Nomor WhatsApp wajib diisi.');
    if (!data.needs.trim()) requiredSubmissionIssues.push('Kebutuhan wajib diisi.');
    if (!data.provinsi.trim()) requiredSubmissionIssues.push('Provinsi wajib diisi.');
    if (!data.kota_kabupaten.trim()) requiredSubmissionIssues.push('Kota/Kabupaten wajib diisi.');
    if (!data.surat_permohonan.trim()) requiredSubmissionIssues.push('Link surat permohonan wajib diisi.');

    const isSubmitDisabled = isMockSubmitting || requiredSubmissionIssues.length > 0;
    const statusStyle = getSubmissionStatusStyle(submissionStatus);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        if (requiredSubmissionIssues.length > 0) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: requiredSubmissionIssues[0] });
            return;
        }
        setIsMockSubmitting(true);
        router.post('/pengajuan', data as any, {
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
                setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Mengirim', message: 'Terjadi kesalahan. Coba lagi nanti.' });
            },
        });
    };

    const handleCreateNewSubmission = () => {
        reset();
        onUpdateSubmissionStatus?.('belum_diajukan');
    };

    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const style = getSubmissionStatusStyle(selectedDetail.status);
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setSelectedDetail(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sigap-blue text-white flex items-center justify-center shadow-md"><i className="fa-solid fa-file-contract text-lg"></i></div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedDetail.judul}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">{selectedDetail.tanggal}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}><i className={`fa-solid ${style.icon}`}></i>{style.label}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sigap-blue"><i className="fa-solid fa-handshake-angle text-xs"></i><span className="text-xs font-bold uppercase tracking-wider">Kebutuhan / Permintaan</span></div>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedDetail.ringkasan}</p>
                        </div>
                        {selectedDetail.catatan && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-amber-600"><i className="fa-solid fa-note-sticky text-xs"></i><span className="text-xs font-bold uppercase tracking-wider">Catatan Admin</span></div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3"><i className="fa-solid fa-quote-left text-amber-200 text-xl mt-1"></i><p className="text-sm text-amber-800 italic leading-relaxed">{selectedDetail.catatan}</p></div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end"><button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button></div>
                </div>
            </div>
        );
    };

    const renderArchiveTab = () => (
        <div className="p-6">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 mb-5">
                <span className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-table-list text-lg"></i></span>
                <div><h4 className="text-sm font-bold text-slate-900 mb-1">Daftar Kegiatan dan Riwayat Pengajuan</h4><p className="text-xs text-slate-600 leading-relaxed">Arsip kegiatan PKM dan histori pengajuan.</p></div>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(prev => ({ ...prev, kegiatan: !prev.kegiatan }))}>
                    <h4 className="text-sm font-bold text-slate-900">Daftar Kegiatan</h4>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{pkmListData.length} kegiatan</span>
                </button>
                {expandedHubSections.kegiatan && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {pkmListData.map(a => (<div key={a.id} className="p-4"><strong className="text-sm font-semibold text-slate-900 block">{a.nama}</strong><p className="text-xs text-slate-500">{a.desa}, Kec. {a.kecamatan}</p></div>))}
                    </div>
                )}
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(prev => ({ ...prev, riwayat: !prev.riwayat }))}>
                    <h4 className="text-sm font-bold text-slate-900">Riwayat Pengajuan</h4>
                    <i className={`fa-solid fa-chevron-${expandedHubSections.riwayat ? 'up' : 'down'} text-slate-400`}></i>
                </button>
                {expandedHubSections.riwayat && (
                    <div className="border-t border-slate-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <tr><th className="px-4 py-3">Nama Pengajuan</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3 text-center">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissionHistory.length > 0 ? (
                                    submissionHistory.map(item => {
                                        const style = getSubmissionStatusStyle(item.status);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-4 py-4"><strong className="text-sm font-semibold text-slate-900 block group-hover:text-sigap-blue transition-colors">{item.judul}</strong><span className="text-[11px] text-slate-500 line-clamp-1">{item.ringkasan}</span></td>
                                                <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase flex items-center gap-1" style={{ backgroundColor: style.bg, color: style.color }}><i className={`fa-solid ${style.icon} text-[8px]`}></i>{style.label}</span>
                                                        <button type="button" className="text-[11px] font-bold text-slate-400 hover:text-sigap-blue" onClick={() => setSelectedDetail(item)}>Detail</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs italic">Belum ada riwayat pengajuan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderSubmissionTab = () => (
        <div className="p-6 space-y-8">
            {/* Identitas Pengusul */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-id-card text-sigap-blue"></i>Identitas Pengusul</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Lengkap / Perwakilan <span className="text-red-500">*</span></label><input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Masukkan nama" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Nama Instansi / Organisasi <span className="text-red-500">*</span></label><input type="text" value={data.institution} onChange={e => setData('institution', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Nama instansi" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Email <span className="text-red-500">*</span></label><input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="email@contoh.com" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">WhatsApp <span className="text-red-500">*</span></label><input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="0812..." /></div>
                </div>
            </section>

            {/* Kebutuhan PKM */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-handshake-angle text-sigap-blue"></i>Kebutuhan PKM</h3>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Deskripsi Kebutuhan / Permintaan <span className="text-red-500">*</span></label><textarea value={data.needs} onChange={e => setData('needs', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue resize-none" placeholder="Jelaskan kebutuhan pengabdian masyarakat yang Anda perlukan..." /></div>
            </section>

            {/* Lokasi PKM */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-map-location-dot text-sigap-blue"></i>Lokasi PKM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Provinsi <span className="text-red-500">*</span></label><input type="text" value={data.provinsi} onChange={e => setData('provinsi', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Provinsi" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kota / Kabupaten <span className="text-red-500">*</span></label><input type="text" value={data.kota_kabupaten} onChange={e => setData('kota_kabupaten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Kota/Kabupaten" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kecamatan</label><input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Kecamatan" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kelurahan / Desa</label><input type="text" value={data.kelurahan_desa} onChange={e => setData('kelurahan_desa', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Kelurahan/Desa" /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label><textarea value={data.alamat_lengkap} onChange={e => setData('alamat_lengkap', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue resize-none" placeholder="Detail alamat lokasi..." /></div>
                </div>
            </section>

            {/* Tautan Dokumen */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-link text-sigap-blue"></i>Tautan Dokumen</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Link Surat Permohonan <span className="text-red-500">*</span></label><input type="url" value={data.surat_permohonan} onChange={e => setData('surat_permohonan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="https://..." /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Link Proposal (Opsional)</label><input type="url" value={data.surat_proposal} onChange={e => setData('surat_proposal', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="https://..." /></div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-700">Link Tambahan</label>
                        {data.link_tambahan.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="url" value={l} onChange={e => handleLinkChange(i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Link lainnya..." />
                                {data.link_tambahan.length > 1 && <button type="button" onClick={() => handleRemoveLink(i)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500"><i className="fa-solid fa-trash-can"></i></button>}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddLink} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Tautan Lagi</button>
                    </div>
                </div>
            </section>

            <button type="submit" disabled={isSubmitDisabled} className="w-full py-3.5 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                {isMockSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Mengirim...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan</>}
            </button>
        </div>
    );

    if (onlyShowStatus || submissionStatus !== 'belum_diajukan') {
        const style = getSubmissionStatusStyle(submissionStatus);
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                    <div><h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3><p className="text-sm text-slate-500 mt-0.5">Kelola pengajuan Anda</p></div>
                </div>
                {!hideMainTabNav && (
                    <div className="flex border-b border-slate-100">
                        <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                        <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                    </div>
                )}
                {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center py-8 border-b border-slate-100">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg" style={{ backgroundColor: style.bg, color: style.color }}><i className={`fa-solid ${style.icon}`}></i></div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">{submissionStatus === 'belum_diajukan' ? 'Belum Ada Pengajuan Aktif' : 'Status: ' + style.label}</h4>
                            <p className="text-sm text-slate-600 max-w-md">Pantau riwayat pengajuan Anda pada tabel di bawah.</p>
                            {(submissionStatus === 'ditolak' || submissionStatus === 'belum_diajukan') && (
                                <button type="button" onClick={handleCreateNewSubmission} className="mt-6 px-8 py-3 bg-sigap-blue text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105">Buat Pengajuan Baru</button>
                            )}
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4"><i className="fa-solid fa-clock-rotate-left text-sigap-blue"></i><h4 className="text-sm font-bold text-slate-900">Semua Riwayat Pengajuan</h4></div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <tr><th className="px-4 py-3">Nama Pengajuan</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3 text-center">Aksi</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {submissionHistory.length > 0 ? (
                                            submissionHistory.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-4 py-4"><strong className="text-sm font-semibold text-slate-900 block group-hover:text-sigap-blue transition-colors">{item.judul}</strong><span className="text-[11px] text-slate-500 line-clamp-1">{item.ringkasan}</span></td>
                                                    <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">{item.tanggal}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button type="button" className="text-[11px] font-bold text-sigap-blue hover:underline" onClick={() => setSelectedDetail(item)}>Detail</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs italic">Belum ada riwayat pengajuan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                {renderDetailModal()}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3><p className="text-sm text-slate-500 mt-0.5">Formulir pengajuan untuk masyarakat</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                </div>
            )}
            {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : renderSubmissionTab()}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            {renderDetailModal()}
        </div>
    );
}
