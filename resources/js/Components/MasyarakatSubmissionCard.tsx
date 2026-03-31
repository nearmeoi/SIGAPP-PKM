import React, { useRef, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
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
}

const REQUEST_TEMPLATE_URL = 'https://p3m.poltekparmakassar.ac.id/dokumen/';

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
        ditangguhkan: { label: 'Ditangguhkan', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' },
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
    needs: string;
    location: string;
    email: string;
    whatsapp: string;
    request_letter: File | null;
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
}: MasyarakatSubmissionCardProps) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(pkmListData[0]?.id ?? null);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(submissionHistory[0]?.id ?? null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [revisionProcessing, setRevisionProcessing] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success' as const, title: '', message: '' });
    const requestLetterRef = useRef<HTMLInputElement>(null);
    const revisionInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        name: '',
        institution: '',
        needs: '',
        location: '',
        email: '',
        whatsapp: '',
        request_letter: null,
    });

    const requiredSubmissionIssues: string[] = [];
    if (!data.name.trim()) requiredSubmissionIssues.push('Nama perwakilan wajib diisi.');
    if (!data.institution.trim()) requiredSubmissionIssues.push('Nama institusi atau organisasi wajib diisi.');
    if (!data.needs.trim()) requiredSubmissionIssues.push('Kebutuhan atau permintaan wajib diisi.');
    if (!data.location.trim()) requiredSubmissionIssues.push('Lokasi kegiatan wajib diisi.');
    if (!data.email.trim()) requiredSubmissionIssues.push('Alamat email wajib diisi.');
    if (!data.whatsapp.trim()) requiredSubmissionIssues.push('Nomor WhatsApp wajib diisi.');
    if (!data.request_letter) requiredSubmissionIssues.push('Surat permohonan wajib dilampirkan.');

    const hasStartedSubmission = Boolean(data.name.trim() || data.institution.trim() || data.needs.trim() || data.location.trim() || data.email.trim() || data.whatsapp.trim() || data.request_letter);
    const isSubmitDisabled = isMockSubmitting || requiredSubmissionIssues.length > 0;
    const statusStyle = getSubmissionStatusStyle(submissionStatus);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setData('request_letter', e.target.files[0]);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        let hasError = false;
        if (!data.name.trim()) { setError('name', 'Nama perwakilan wajib diisi.'); hasError = true; }
        if (!data.institution.trim()) { setError('institution', 'Nama institusi wajib diisi.'); hasError = true; }
        if (!data.needs.trim()) { setError('needs', 'Kebutuhan wajib diisi.'); hasError = true; }
        if (!data.location.trim()) { setError('location', 'Lokasi wajib diisi.'); hasError = true; }
        if (!data.email.trim()) { setError('email', 'Email wajib diisi.'); hasError = true; }
        if (!data.whatsapp.trim()) { setError('whatsapp', 'WhatsApp wajib diisi.'); hasError = true; }
        if (!data.request_letter) { setError('request_letter', 'Surat permohonan wajib dilampirkan.'); hasError = true; }

        if (hasError) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Siap', message: 'Masih ada data wajib yang belum lengkap.' });
            return;
        }

        setIsMockSubmitting(true);
        setTimeout(() => {
            setIsMockSubmitting(false);
            onSubmitted?.({ id: Date.now(), judul: `Pengajuan PKM ${data.institution}`, ringkasan: data.needs, tanggal: createSubmittedLabel(), status: 'diproses' });
            onUpdateSubmissionStatus?.('diproses');
            setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Pengajuan Anda sudah tersimpan.' });
            reset();
            if (requestLetterRef.current) requestLetterRef.current.value = '';
        }, 900);
    };

    const handleUploadRevision = (file: File | null) => {
        if (!file) return;
        setRevisionProcessing(true);
        setTimeout(() => {
            setRevisionProcessing(false);
            if (revisionInputRef.current) revisionInputRef.current.value = '';
            onUpdateSubmissionStatus?.('diproses');
            setFeedbackDialog({ show: true, type: 'success', title: 'Revisi Terkirim', message: 'Dokumen revisi berhasil diunggah.' });
        }, 1000);
    };

    const handleCreateNewSubmission = () => {
        reset();
        clearErrors();
        if (requestLetterRef.current) requestLetterRef.current.value = '';
        if (revisionInputRef.current) revisionInputRef.current.value = '';
        onUpdateSubmissionStatus?.('belum_diajukan');
        setFeedbackDialog({ show: true, type: 'success', title: 'Siap Mengajukan Ulang', message: 'Form sudah dibuka kembali.' });
    };

    const renderArchiveTab = () => (
        <div className="p-6">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 mb-5">
                <span className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-table-list text-lg"></i>
                </span>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Daftar Kegiatan dan Riwayat Pengajuan</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Bagian arsip menampilkan daftar kegiatan dan histori pengajuan.</p>
                </div>
            </div>

            {/* Kegiatan Panel */}
            <div className={`border border-slate-200 rounded-xl overflow-hidden mb-4 ${expandedHubSections.kegiatan ? 'ring-2 ring-blue-100' : ''}`}>
                <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedHubSections(prev => ({ ...prev, kegiatan: !prev.kegiatan }))}
                >
                    <div className="flex items-center gap-3">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">Daftar Kegiatan</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Daftar titik kegiatan pada peta PKM</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{pkmListData.length} kegiatan</span>
                        <i className={`fa-solid fa-chevron-${expandedHubSections.kegiatan ? 'up' : 'down'} text-slate-400`}></i>
                    </div>
                </button>
                {expandedHubSections.kegiatan && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {pkmListData.map((activity) => {
                            const isOpen = expandedActivityId === activity.id;
                            return (
                                <div key={activity.id}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedActivityId(prev => prev === activity.id ? null : activity.id)}
                                    >
                                        <div className="text-left">
                                            <strong className="text-sm font-semibold text-slate-900 block">{activity.nama}</strong>
                                            <span className="text-xs text-slate-500">{activity.desa}, Kec. {activity.kecamatan}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${activity.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                <i className={`fa-solid ${activity.status === 'berlangsung' ? 'fa-person-walking' : 'fa-flag-checkered'} mr-1`}></i>
                                                {getPkmStatusLabel(activity.status)}
                                            </span>
                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400`}></i>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-slate-600 mb-3">{activity.deskripsi}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span><i className="fa-solid fa-calendar-days mr-1.5"></i>Tahun {activity.tahun}</span>
                                                <span><i className="fa-solid fa-location-dot mr-1.5"></i>{activity.kabupaten}, {activity.provinsi}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Riwayat Panel */}
            <div className={`border border-slate-200 rounded-xl overflow-hidden ${expandedHubSections.riwayat ? 'ring-2 ring-blue-100' : ''}`}>
                <button
                    type="button"
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedHubSections(prev => ({ ...prev, riwayat: !prev.riwayat }))}
                >
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Riwayat Pengajuan</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Histori pengajuan Anda</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">{submissionHistory.length} riwayat</span>
                        <i className={`fa-solid fa-chevron-${expandedHubSections.riwayat ? 'up' : 'down'} text-slate-400`}></i>
                    </div>
                </button>
                {expandedHubSections.riwayat && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {submissionHistory.map((item) => {
                            const isOpen = expandedHistoryId === item.id;
                            const historyStyle = item.status === 'diterima' ? { bg: '#dcfce7', color: '#15803d', icon: 'fa-circle-check', label: 'Diterima' }
                                : item.status === 'ditangguhkan' ? { bg: '#fef3c7', color: '#b45309', icon: 'fa-file-pen', label: 'Ditangguhkan' }
                                : item.status === 'ditolak' ? { bg: '#fee2e2', color: '#b91c1c', icon: 'fa-circle-xmark', label: 'Ditolak' }
                                : { bg: '#e2e8f0', color: '#475569', icon: 'fa-circle-info', label: item.status };
                            return (
                                <div key={item.id}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpandedHistoryId(prev => prev === item.id ? null : item.id)}
                                    >
                                        <div className="text-left">
                                            <strong className="text-sm font-semibold text-slate-900 block">{item.judul}</strong>
                                            <span className="text-xs text-slate-500">{item.tanggal}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: historyStyle.bg, color: historyStyle.color }}>
                                                <i className={`fa-solid ${historyStyle.icon} mr-1`}></i>{historyStyle.label}
                                            </span>
                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400`}></i>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-slate-600 mb-2">{item.ringkasan}</p>
                                            <span className="text-xs text-slate-500"><i className="fa-solid fa-note-sticky mr-1.5"></i>{item.catatan}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    const renderSubmissionTab = () => (
        <div className="p-6 space-y-4">
            {!hideInlineStatusPanel && (
                <div className="p-5 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 shadow-lg">
                    <div className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            <i className={`fa-solid ${statusStyle.icon} text-xl`}></i>
                        </span>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 mb-0.5">Status Pengajuan</h4>
                            <p className="text-sm text-slate-600">Form pengajuan PKM untuk masyarakat</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            <i className={`fa-solid ${statusStyle.icon}`}></i>{statusStyle.label}
                        </span>
                    </div>
                </div>
            )}

            {latestSubmission && (
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <strong className="text-sm text-slate-900">Pengajuan Terbaru</strong>
                        <span className="text-xs text-slate-500">{latestSubmission.tanggal}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">{latestSubmission.judul}</div>
                    <p className="text-sm text-slate-600">{latestSubmission.ringkasan}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-id-card text-sigap-blue"></i>Identitas Pemohon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap / Perwakilan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" placeholder="Masukkan nama" />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institusi / Organisasi <span className="text-red-500">*</span></label>
                            <input type="text" value={data.institution} onChange={(e) => setData('institution', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" placeholder="Nama institusi" />
                            {errors.institution && <p className="mt-1 text-xs text-red-600">{errors.institution}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" placeholder="email@contoh.com" />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">WhatsApp <span className="text-red-500">*</span></label>
                            <input type="tel" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" placeholder="081234567890" />
                            {errors.whatsapp && <p className="mt-1 text-xs text-red-600">{errors.whatsapp}</p>}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-200" />

                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-handshake-angle text-sigap-blue"></i>Kebutuhan Kegiatan
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kebutuhan / Permintaan <span className="text-red-500">*</span></label>
                            <textarea value={data.needs} onChange={(e) => setData('needs', e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm resize-none" placeholder="Jelaskan kebutuhan PKM" />
                            {errors.needs && <p className="mt-1 text-xs text-red-600">{errors.needs}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi Kegiatan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.location} onChange={(e) => setData('location', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" placeholder="Contoh: Desa Bira, Makassar" />
                            {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
                        </div>
                    </div>
                </div>

                <hr className="border-slate-200" />

                <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-file-arrow-up text-sigap-blue"></i>Dokumen Pendukung
                    </h3>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Surat Permohonan (PDF) <span className="text-red-500">*</span></label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-sigap-blue hover:bg-slate-50 transition-all">
                            <input ref={requestLetterRef} type="file" onChange={handleFileChange} accept=".pdf" className="hidden" required={!data.request_letter} />
                            <div onClick={() => requestLetterRef.current?.click()}>
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-sigap-blue flex items-center justify-center mx-auto mb-2">
                                    <i className={`fa-solid ${data.request_letter ? 'fa-file-pdf' : 'fa-cloud-arrow-up'}`}></i>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">{data.request_letter ? data.request_letter.name : 'Pilih surat permohonan'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{data.request_letter ? `${(data.request_letter.size / 1024 / 1024).toFixed(2)} MB` : 'Unggah PDF maksimal 5MB'}</p>
                            </div>
                        </div>
                        <a href={REQUEST_TEMPLATE_URL} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs font-bold text-sigap-blue underline">Download template surat permohonan</a>
                        {errors.request_letter && <p className="mt-1 text-xs text-red-600">{errors.request_letter}</p>}
                    </div>
                </div>

                {hasStartedSubmission && requiredSubmissionIssues.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5"></i>
                        <div>
                            <strong className="text-amber-900 text-sm">Form belum bisa dikirim</strong>
                            <p className="text-amber-700 text-sm">{requiredSubmissionIssues[0]}</p>
                        </div>
                    </div>
                )}

                <button type="submit" disabled={isSubmitDisabled} className="w-full py-3 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                    {isMockSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Memproses...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan</>}
                </button>
            </form>

            {pkmStatusData && (
                <div className="mt-6 p-5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 mb-1">{pkmStatusData.nama}</h4>
                            <p className="text-sm text-slate-600">{pkmStatusData.deskripsi}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${pkmStatusData.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            <i className={`fa-solid ${pkmStatusData.status === 'berlangsung' ? 'fa-person-walking' : 'fa-flag-checkered'} mr-1`}></i>
                            {getPkmStatusLabel(pkmStatusData.status)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600"><i className="fa-solid fa-location-dot mr-2 text-slate-400"></i>{pkmStatusData.desa}, Kec. {pkmStatusData.kecamatan}, {pkmStatusData.kabupaten}</p>
                </div>
            )}
        </div>
    );

    const statusCardConfig: Record<string, { icon: string; iconBg: string; iconColor: string; title: string; message: string }> = {
        diproses: { icon: 'fa-clock', iconBg: '#dbeafe', iconColor: '#1d4ed8', title: 'Pengajuan PKM Anda sedang diproses.', message: 'Mohon menunggu proses verifikasi dari tim kami.' },
        ditangguhkan: { icon: 'fa-file-pen', iconBg: '#fef3c7', iconColor: '#b45309', title: 'Pengajuan memerlukan revisi.', message: 'Silakan perbarui dokumen sesuai catatan revisi.' },
        ditolak: { icon: 'fa-circle-xmark', iconBg: '#fee2e2', iconColor: '#b91c1c', title: 'Pengajuan belum dapat diterima.', message: 'Anda dapat mengajukan kembali saat sudah siap.' },
        diterima: { icon: 'fa-circle-check', iconBg: '#dcfce7', iconColor: '#15803d', title: 'Pengajuan telah diterima.', message: 'Silakan cek email untuk informasi lanjutan.' },
        berlangsung: { icon: 'fa-person-walking', iconBg: '#fef3c7', iconColor: '#b45309', title: 'Program PKM sedang berlangsung.', message: 'Berikut ringkasan kegiatan yang berjalan.' },
        selesai: { icon: 'fa-flag-checkered', iconBg: '#dcfce7', iconColor: '#15803d', title: 'Program PKM telah selesai.', message: 'Berikut dokumentasi kegiatan.' },
    };

    const isRevisionMode = submissionStatus === 'ditangguhkan';
    const isRejectedMode = submissionStatus === 'ditolak';
    const isPkmBerlangsung = submissionStatus === 'berlangsung';
    const isPkmSelesai = submissionStatus === 'selesai';

    if (submissionStatus !== 'belum_diajukan' && statusCardConfig[submissionStatus]) {
        const currentStatusCard = statusCardConfig[submissionStatus];

        if ((isPkmBerlangsung || isPkmSelesai) && pkmStatusData) {
            return (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md">
                                <i className="fa-solid fa-file-signature text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Kegiatan PKM yang sedang berjalan</p>
                            </div>
                        </div>
                    </div>

                    {!hideMainTabNav && (
                        <div className="flex border-b border-slate-100">
                            <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                                <i className="fa-solid fa-file-signature mr-2"></i>Pengajuan
                            </button>
                            <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                                <i className="fa-solid fa-layer-group mr-2"></i>Arsip
                            </button>
                        </div>
                    )}

                    {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                        <div className="p-6">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                {pkmStatusData.thumbnail ? (
                                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${pkmStatusData.thumbnail})` }}></div>
                                ) : (
                                    <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                                        <i className="fa-solid fa-image text-4xl"></i>
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h2 className="text-lg font-bold text-slate-900">{pkmStatusData.nama}</h2>
                                        <span className="text-sm font-semibold text-slate-500">{pkmStatusData.tahun}</span>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-3 ${pkmStatusData.status === 'berlangsung' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        <i className={`fa-solid ${pkmStatusData.status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double'}`}></i>
                                        {pkmStatusData.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">{pkmStatusData.deskripsi}</p>
                                    {isPkmSelesai && (
                                        <>
                                            <DocumentationGallery status={pkmStatusData.status} driveLink={pkmStatusData.dokumentasi} />
                                            <TestimonialSidebarDisplay status={pkmStatusData.status} />
                                            <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl border border-blue-100 text-center">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center mx-auto mb-3 text-xl">
                                                    <i className="fa-solid fa-file-circle-plus"></i>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-900 mb-2">Ingin membuat pengajuan PKM baru?</h4>
                                                <p className="text-xs text-slate-600 mb-4">Anda dapat mengajukan program PKM berikutnya.</p>
                                                <button type="button" onClick={handleCreateNewSubmission} className="px-6 py-2.5 bg-sigap-blue hover:bg-sigap-darkBlue text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                                                    Buat Pengajuan Baru<i className="fa-solid fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                    <p className="text-sm text-slate-600 mt-4"><i className="fa-solid fa-map-pin mr-2 text-slate-400"></i>{pkmStatusData.desa}, Kec. {pkmStatusData.kecamatan}, {pkmStatusData.kabupaten}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md">
                            <i className="fa-solid fa-file-signature text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Status pengajuan Anda</p>
                        </div>
                    </div>
                </div>

                {!hideMainTabNav && (
                    <div className="flex border-b border-slate-100">
                        <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                            <i className="fa-solid fa-file-signature mr-2"></i>Pengajuan
                        </button>
                        <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                            <i className="fa-solid fa-layer-group mr-2"></i>Arsip
                        </button>
                    </div>
                )}

                {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center py-8">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg" style={{ backgroundColor: currentStatusCard.iconBg, color: currentStatusCard.iconColor }}>
                                <i className={`fa-solid ${currentStatusCard.icon}`}></i>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">{currentStatusCard.title}</h4>
                            <p className="text-sm text-slate-600 max-w-md">{currentStatusCard.message}</p>

                            {isRevisionMode && (
                                <div className="mt-6 w-full max-w-md">
                                    <input ref={revisionInputRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleUploadRevision(e.target.files?.[0] || null)} className="hidden" />
                                    <button type="button" onClick={() => revisionInputRef.current?.click()} disabled={revisionProcessing} className="w-full py-3 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {revisionProcessing ? <><i className="fa-solid fa-spinner fa-spin"></i>Mengunggah...</> : <><i className="fa-solid fa-upload"></i>Unggah Dokumen Revisi</>}
                                    </button>
                                </div>
                            )}

                            {isRejectedMode && (
                                <button type="button" onClick={handleCreateNewSubmission} className="mt-6 px-8 py-3 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-semibold rounded-xl transition-all flex items-center gap-2">
                                    Buat Pengajuan Baru<i className="fa-solid fa-rotate-right"></i>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md">
                        <i className="fa-solid fa-file-signature text-lg"></i>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Formulir pengajuan untuk masyarakat</p>
                    </div>
                </div>
            </div>

            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                        <i className="fa-solid fa-file-signature mr-2"></i>Pengajuan
                    </button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>
                        <i className="fa-solid fa-layer-group mr-2"></i>Arsip
                    </button>
                </div>
            )}

            {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : renderSubmissionTab()}

            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
        </div>
    );
}
