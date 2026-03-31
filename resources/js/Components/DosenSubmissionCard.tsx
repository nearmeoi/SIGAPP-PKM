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
    tim_pelaksana?: { dosen_terlibat: string[]; staff_terlibat: string[]; mahasiswa_terlibat: string[] };
}

interface DosenSubmissionCardProps {
    onSubmitted?: (submission: Submission) => void;
    submissionStatus?: string;
    onUpdateSubmissionStatus?: (status: string) => void;
    pkmStatusData?: PkmData | null;
    pkmListData?: PkmData[];
    submissionHistory?: Submission[];
    hideMainTabNav?: boolean;
}

interface FormData {
    nama_dosen: string;
    judul_proyek: string;
    lokasi: string;
    sertakan_dosen_terlibat: boolean;
    dosen_terlibat: string[];
    sertakan_staff_terlibat: boolean;
    staff_terlibat: string[];
    sertakan_mahasiswa_terlibat: boolean;
    mahasiswa_terlibat: string[];
    sumber_dana: string;
    total_RAB: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    proposal: File | null;
}

const createSubmittedLabel = (): string => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
const getPkmStatusLabel = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';
const getFilledTeamMembers = (members: string[] = []): string[] => members.filter((m) => m.trim());

const teamValidationDefinitions = [
    { enabledKey: 'sertakan_dosen_terlibat' as const, type: 'dosen_terlibat' as const, title: 'Dosen Terlibat' },
    { enabledKey: 'sertakan_staff_terlibat' as const, type: 'staff_terlibat' as const, title: 'Staf Terlibat' },
    { enabledKey: 'sertakan_mahasiswa_terlibat' as const, type: 'mahasiswa_terlibat' as const, title: 'Mahasiswa Terlibat' },
];

const getTeamEntryValidationMessage = (title: string): string => `Lengkapi semua nama pada bagian ${title.toLowerCase()}.`;

export default function DosenSubmissionCard({
    onSubmitted,
    submissionStatus = 'belum_diajukan',
    onUpdateSubmissionStatus,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    hideMainTabNav = false,
}: DosenSubmissionCardProps) {
    const { data, setData, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm<FormData>({
        nama_dosen: '',
        judul_proyek: '',
        lokasi: '',
        sertakan_dosen_terlibat: false,
        dosen_terlibat: [''],
        sertakan_staff_terlibat: false,
        staff_terlibat: [''],
        sertakan_mahasiswa_terlibat: false,
        mahasiswa_terlibat: [''],
        sumber_dana: '',
        total_RAB: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        proposal: null,
    });

    const [mockProcessing, setMockProcessing] = useState(false);
    const [revisionProcessing, setRevisionProcessing] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success' as const, title: '', message: '' });
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(pkmListData[0]?.id ?? null);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(submissionHistory[0]?.id ?? null);
    const revisionInputRef = useRef<HTMLInputElement>(null);

    const handleAddPersonil = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat') => setData(type, [...data[type], '']);
    const handleRemovePersonil = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', index: number) => {
        setData(type, data[type].filter((_, i) => i !== index));
        clearErrors(type);
    };
    const handlePersonilChange = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', index: number, value: string) => {
        const updated = [...data[type]];
        updated[index] = value;
        setData(type, updated);
        clearErrors(type);
    };
    const handleTogglePersonilSection = (enabledKey: 'sertakan_dosen_terlibat' | 'sertakan_staff_terlibat' | 'sertakan_mahasiswa_terlibat', type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', checked: boolean) => {
        setData(enabledKey, checked);
        if (checked && data[type].length === 0) setData(type, ['']);
        if (!checked) clearErrors(type);
    };

    const requiredSubmissionIssues: string[] = [];
    if (!data.judul_proyek.trim()) requiredSubmissionIssues.push('Judul proyek PKM wajib diisi.');
    if (!data.nama_dosen.trim()) requiredSubmissionIssues.push('Nama ketua kelompok wajib diisi.');
    if (!data.lokasi.trim()) requiredSubmissionIssues.push('Lokasi pengabdian wajib diisi.');
    if (!teamValidationDefinitions.some((s) => data[s.enabledKey])) requiredSubmissionIssues.push('Pilih minimal satu kategori tim pelaksana.');
    teamValidationDefinitions.forEach((section) => {
        if (data[section.enabledKey] && data[section.type].some((m) => !m.trim())) requiredSubmissionIssues.push(getTeamEntryValidationMessage(section.title));
    });
    if (!data.sumber_dana) requiredSubmissionIssues.push('Sumber dana wajib dipilih.');
    if (!String(data.total_RAB).trim()) requiredSubmissionIssues.push('Total anggaran wajib diisi.');
    if (!data.tanggal_mulai) requiredSubmissionIssues.push('Tanggal mulai wajib diisi.');
    if (!data.tanggal_selesai) requiredSubmissionIssues.push('Tanggal selesai wajib diisi.');
    if (!data.proposal) requiredSubmissionIssues.push('File proposal wajib diunggah.');

    const hasStartedSubmission = Boolean(data.judul_proyek.trim() || data.nama_dosen.trim() || data.lokasi.trim() || data.sumber_dana || String(data.total_RAB).trim() || data.tanggal_mulai || data.tanggal_selesai || data.proposal || teamValidationDefinitions.some((s) => data[s.enabledKey]));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        let hasErrors = false;
        if (!data.judul_proyek.trim()) { setError('judul_proyek', 'Judul wajib diisi'); hasErrors = true; }
        if (!data.nama_dosen.trim()) { setError('nama_dosen', 'Ketua kelompok wajib diisi'); hasErrors = true; }
        if (!data.lokasi.trim()) { setError('lokasi', 'Lokasi wajib diisi'); hasErrors = true; }
        if (!teamValidationDefinitions.some((s) => data[s.enabledKey])) { setError('team_selection', 'Pilih minimal satu kategori tim'); hasErrors = true; }
        teamValidationDefinitions.forEach((section) => {
            if (data[section.enabledKey] && data[section.type].some((m) => !m.trim())) { setError(section.type, getTeamEntryValidationMessage(section.title)); hasErrors = true; }
        });
        if (!data.sumber_dana) { setError('sumber_dana', 'Sumber dana wajib dipilih'); hasErrors = true; }
        if (!String(data.total_RAB).trim()) { setError('total_RAB', 'Total anggaran wajib diisi'); hasErrors = true; }
        if (!data.tanggal_mulai) { setError('tanggal_mulai', 'Tanggal mulai wajib diisi'); hasErrors = true; }
        if (!data.tanggal_selesai) { setError('tanggal_selesai', 'Tanggal selesai wajib diisi'); hasErrors = true; }
        if (!data.proposal) { setError('proposal', 'Proposal wajib diunggah'); hasErrors = true; }

        if (hasErrors) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Siap', message: 'Masih ada data wajib yang belum lengkap.' });
            return;
        }

        setMockProcessing(true);
        setTimeout(() => {
            setMockProcessing(false);
            onSubmitted?.({
                id: Date.now(),
                judul: data.judul_proyek,
                ringkasan: `${data.lokasi} • Ketua ${data.nama_dosen}`,
                tanggal: createSubmittedLabel(),
                status: 'diproses',
                tim_pelaksana: {
                    dosen_terlibat: data.sertakan_dosen_terlibat ? getFilledTeamMembers(data.dosen_terlibat) : [],
                    staff_terlibat: data.sertakan_staff_terlibat ? getFilledTeamMembers(data.staff_terlibat) : [],
                    mahasiswa_terlibat: data.sertakan_mahasiswa_terlibat ? getFilledTeamMembers(data.mahasiswa_terlibat) : [],
                },
            });
            setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Data pengajuan PKM sudah tersimpan.' });
            setTimeout(() => reset(), 300);
        }, 1200);
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
        if (revisionInputRef.current) revisionInputRef.current.value = '';
        onUpdateSubmissionStatus?.('belum_diajukan');
        setFeedbackDialog({ show: true, type: 'success', title: 'Siap Mengajukan Ulang', message: 'Form sudah dibuka kembali.' });
    };

    const isProcessing = inertiaProcessing || mockProcessing;
    const isSubmitDisabled = isProcessing || requiredSubmissionIssues.length > 0;

    const teamSections = [
        { enabledKey: 'sertakan_dosen_terlibat' as const, type: 'dosen_terlibat' as const, title: 'Dosen Terlibat', placeholder: 'Nama Dosen', icon: 'fa-user-tie', iconBg: '#e0f2fe', iconColor: '#0369a1', sectionBg: '#f8fafc', sectionBorder: '#e2e8f0', buttonBg: '#e0f2fe', buttonColor: '#0369a1', note: 'Centang jika ada dosen lain yang ikut.' },
        { enabledKey: 'sertakan_staff_terlibat' as const, type: 'staff_terlibat' as const, title: 'Staf Terlibat', placeholder: 'Nama Staf', icon: 'fa-id-badge', iconBg: '#f3e8ff', iconColor: '#6d28d9', sectionBg: '#fbf5ff', sectionBorder: '#f3e8ff', buttonBg: '#ede9fe', buttonColor: '#6d28d9', note: 'Centang jika ada staf yang ikut.' },
        { enabledKey: 'sertakan_mahasiswa_terlibat' as const, type: 'mahasiswa_terlibat' as const, title: 'Mahasiswa Terlibat', placeholder: 'Nama Mahasiswa', icon: 'fa-graduation-cap', iconBg: '#dcfce7', iconColor: '#16a34a', sectionBg: '#f0fdf4', sectionBorder: '#dcfce7', buttonBg: '#dcfce7', buttonColor: '#16a34a', note: 'Centang jika ada mahasiswa yang ikut.' },
    ];

    const statusCardConfig: Record<string, { icon: string; iconBg: string; iconColor: string; title: string; message: string }> = {
        diproses: { icon: 'fa-clock', iconBg: '#dbeafe', iconColor: '#1d4ed8', title: 'Pengajuan PKM Anda sedang diproses.', message: 'Mohon menunggu proses verifikasi dari tim kami.' },
        ditangguhkan: { icon: 'fa-file-pen', iconBg: '#fef3c7', iconColor: '#b45309', title: 'Pengajuan memerlukan revisi.', message: 'Silakan perbarui dokumen sesuai catatan revisi.' },
        ditolak: { icon: 'fa-circle-xmark', iconBg: '#fee2e2', iconColor: '#b91c1c', title: 'Pengajuan belum dapat diterima.', message: 'Anda dapat menyiapkan pengajuan baru.' },
        diterima: { icon: 'fa-circle-check', iconBg: '#dcfce7', iconColor: '#15803d', title: 'Pengajuan telah diterima.', message: 'Silakan cek email untuk informasi lanjutan.' },
        berlangsung: { icon: 'fa-person-walking', iconBg: '#fef3c7', iconColor: '#b45309', title: 'Program PKM sedang berlangsung.', message: 'Berikut ringkasan kegiatan yang berjalan.' },
        selesai: { icon: 'fa-flag-checkered', iconBg: '#dcfce7', iconColor: '#15803d', title: 'Program PKM telah selesai.', message: 'Berikut dokumentasi kegiatan.' },
    };

    const renderSubmissionHub = () => (
        <div className="p-6">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 mb-5">
                <span className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-table-list text-lg"></i>
                </span>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Daftar Kegiatan dan Riwayat Pengajuan</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Arsip kegiatan PKM dan histori pengajuan.</p>
                </div>
            </div>

            {/* Kegiatan */}
            <div className={`border border-slate-200 rounded-xl overflow-hidden mb-4 ${expandedHubSections.kegiatan ? 'ring-2 ring-blue-100' : ''}`}>
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(prev => ({ ...prev, kegiatan: !prev.kegiatan }))}>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">Daftar Kegiatan</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Daftar titik PKM pada peta</p>
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
                                    <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedActivityId(prev => prev === activity.id ? null : activity.id)}>
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

            {/* Riwayat */}
            <div className={`border border-slate-200 rounded-xl overflow-hidden ${expandedHubSections.riwayat ? 'ring-2 ring-blue-100' : ''}`}>
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(prev => ({ ...prev, riwayat: !prev.riwayat }))}>
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
                            const style = item.status === 'diterima' ? { bg: '#dcfce7', color: '#15803d', icon: 'fa-circle-check', label: 'Diterima' } : item.status === 'ditangguhkan' ? { bg: '#fef3c7', color: '#b45309', icon: 'fa-file-pen', label: 'Ditangguhkan' } : item.status === 'ditolak' ? { bg: '#fee2e2', color: '#b91c1c', icon: 'fa-circle-xmark', label: 'Ditolak' } : { bg: '#e2e8f0', color: '#475569', icon: 'fa-circle-info', label: item.status };
                            return (
                                <div key={item.id}>
                                    <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHistoryId(prev => prev === item.id ? null : item.id)}>
                                        <div className="text-left">
                                            <strong className="text-sm font-semibold text-slate-900 block">{item.judul}</strong>
                                            <span className="text-xs text-slate-500">{item.tanggal}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: style.bg, color: style.color }}>
                                                <i className={`fa-solid ${style.icon} mr-1`}></i>{style.label}
                                            </span>
                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-slate-400`}></i>
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-4 pb-4">
                                            <p className="text-sm text-slate-600 mb-2">{item.ringkasan}</p>
                                            <span className="text-xs text-slate-500"><i className="fa-solid fa-clipboard-list mr-1.5"></i>{item.catatan}</span>
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

    const renderForm = () => (
        <div className="p-6 space-y-5">
            {/* Detail Proyek */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-folder-open text-sigap-blue"></i>Detail Proyek
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul Proyek PKM <span className="text-red-500">*</span></label>
                        <input type="text" value={data.judul_proyek} onChange={(e) => setData('judul_proyek', e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.judul_proyek ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Masukkan judul pengabdian..." />
                        {errors.judul_proyek && <p className="mt-1 text-xs text-red-600">{errors.judul_proyek}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ketua Kelompok <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_dosen} onChange={(e) => setData('nama_dosen', e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.nama_dosen ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Nama lengkap dan gelar..." />
                            {errors.nama_dosen && <p className="mt-1 text-xs text-red-600">{errors.nama_dosen}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lokasi Pengabdian <span className="text-red-500">*</span></label>
                            <input type="text" value={data.lokasi} onChange={(e) => setData('lokasi', e.target.value)} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.lokasi ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} placeholder="Desa, Kecamatan, Kota..." />
                            {errors.lokasi && <p className="mt-1 text-xs text-red-600">{errors.lokasi}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* Tim Pelaksana */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-users text-sigap-blue"></i>Tim Pelaksana
                </h3>
                <p className="text-xs text-slate-500 mb-4">Ketua kelompok tidak perlu diinput ulang. Centang kategori anggota yang ikut.</p>
                {errors.team_selection && <p className="mb-4 text-xs text-red-600 flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i>{errors.team_selection}</p>}

                {teamSections.map((section, idx) => {
                    const isEnabled = data[section.enabledKey];
                    return (
                        <div key={section.type} className="p-4 rounded-xl border mb-4 transition-opacity" style={{ backgroundColor: section.sectionBg, borderColor: section.sectionBorder, opacity: isEnabled ? 1 : 0.82 }}>
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={isEnabled} onChange={(e) => handleTogglePersonilSection(section.enabledKey, section.type, e.target.checked)} className="w-4 h-4" style={{ accentColor: section.iconColor }} />
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: section.iconBg, color: section.iconColor }}><i className={`fa-solid ${section.icon}`}></i></span>
                                    <span className="text-sm font-bold" style={{ color: section.iconColor }}>{section.title}</span>
                                </label>
                                {isEnabled && (
                                    <button type="button" onClick={() => handleAddPersonil(section.type)} className="px-3 py-1.5 text-xs font-semibold rounded-lg" style={{ backgroundColor: section.buttonBg, color: section.buttonColor }}>
                                        <i className="fa-solid fa-plus mr-1"></i>Tambah
                                    </button>
                                )}
                            </div>
                            {!isEnabled && <p className="text-sm text-slate-500">{section.note}</p>}
                            {isEnabled && (
                                <div className="space-y-3">
                                    {data[section.type].map((personil, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: section.iconBg, color: section.iconColor }}>{index + 1}</span>
                                                <input type="text" value={personil} onChange={(e) => handlePersonilChange(section.type, index, e.target.value)} placeholder={`${section.placeholder} ${index + 1}`} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm" />
                                            </div>
                                            {data[section.type].length > 1 && (
                                                <button type="button" onClick={() => handleRemovePersonil(section.type, index)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><i className="fa-regular fa-trash-can"></i></button>
                                            )}
                                        </div>
                                    ))}
                                    {errors[section.type] && <p className="text-xs text-red-600 flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i>{errors[section.type]}</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <hr className="border-slate-200" />

            {/* Pendanaan & Jadwal */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-wallet text-sigap-blue"></i>Pendanaan & Jadwal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sumber Dana</label>
                        <select value={data.sumber_dana} onChange={(e) => { setData('sumber_dana', e.target.value); clearErrors('sumber_dana'); }} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.sumber_dana ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                            <option value="" disabled>Pilih Sumber Dana</option>
                            <option value="DIPA Poltekpar">DIPA Poltekpar</option>
                            <option value="Mandiri">Mandiri / Pribadi</option>
                            <option value="Sponsor Luar">Sponsor Eksternal</option>
                        </select>
                        {errors.sumber_dana && <p className="mt-1 text-xs text-red-600">{errors.sumber_dana}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Anggaran (RAB)</label>
                        <div className="flex items-center gap-2 px-3 py-2.5 border border-slate-200 rounded-lg focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100">
                            <span className="text-slate-500 font-medium text-sm">Rp</span>
                            <input type="number" value={data.total_RAB} onChange={(e) => { setData('total_RAB', e.target.value); clearErrors('total_RAB'); }} placeholder="0" className="flex-1 outline-none text-sm" />
                        </div>
                        {errors.total_RAB && <p className="mt-1 text-xs text-red-600">{errors.total_RAB}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Mulai</label>
                        <input type="date" value={data.tanggal_mulai} onChange={(e) => { setData('tanggal_mulai', e.target.value); clearErrors('tanggal_mulai'); }} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.tanggal_mulai ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                        {errors.tanggal_mulai && <p className="mt-1 text-xs text-red-600">{errors.tanggal_mulai}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Selesai</label>
                        <input type="date" value={data.tanggal_selesai} onChange={(e) => { setData('tanggal_selesai', e.target.value); clearErrors('tanggal_selesai'); }} className={`w-full px-3 py-2.5 border rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 text-sm ${errors.tanggal_selesai ? 'border-red-300 bg-red-50' : 'border-slate-200'}`} />
                        {errors.tanggal_selesai && <p className="mt-1 text-xs text-red-600">{errors.tanggal_selesai}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unggah Proposal (PDF)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-sigap-blue hover:bg-slate-50 transition-all">
                            <input type="file" id="proposal_inline" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) { setData('proposal', e.target.files[0]); clearErrors('proposal'); } }} className="hidden" />
                            <label htmlFor="proposal_inline" className="cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-sigap-blue flex items-center justify-center mx-auto mb-2">
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                </div>
                                <p className="text-sm font-semibold text-slate-900">{data.proposal ? data.proposal.name : 'Pilih File Proposal'}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{data.proposal ? `${(data.proposal.size / 1024 / 1024).toFixed(2)} MB` : 'Unggah dokumen proposal PKM dalam format PDF'}</p>
                            </label>
                        </div>
                        {errors.proposal && <p className="mt-1 text-xs text-red-600">{errors.proposal}</p>}
                    </div>
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
                {isProcessing ? <><i className="fa-solid fa-spinner fa-spin"></i>Memproses...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan</>}
            </button>
        </div>
    );

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
                    {!hideMainTabNav && mainTab === 'arsip' ? renderSubmissionHub() : (
                        <div className="p-6">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                {pkmStatusData.thumbnail ? <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${pkmStatusData.thumbnail})` }}></div> : <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400"><i className="fa-solid fa-image text-4xl"></i></div>}
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
                {!hideMainTabNav && mainTab === 'arsip' ? renderSubmissionHub() : (
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
                        <p className="text-sm text-slate-500 mt-0.5">Formulir pengajuan PKM untuk dosen</p>
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
            {!hideMainTabNav && mainTab === 'arsip' ? renderSubmissionHub() : (
                <form onSubmit={handleSubmit}>
                    {renderForm()}
                </form>
            )}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
        </div>
    );
}
