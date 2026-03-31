import React, { useState, ChangeEvent } from 'react';
import { useForm } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';

interface FormData {
    nama_dosen: string;
    judul_proyek: string;
    lokasi: string;
    dosen_terlibat: string[];
    staff_terlibat: string[];
    mahasiswa_terlibat: string[];
    sumber_dana: string;
    total_RAB: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    proposal: File | null;
}

interface LecturerSubmissionFormProps {
    onClose: () => void;
}

const getFilledTeamMembers = (members: string[] = []): string[] => members.filter((member) => member.trim());

interface TeamSection {
    enabledKey: string;
    type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat';
    title: string;
    placeholder: string;
    icon: string;
    titleColor: string;
    iconBg: string;
    iconColor: string;
    sectionBg: string;
    sectionBorder: string;
    buttonBg: string;
    buttonColor: string;
    note: string;
}

export default function LecturerSubmissionForm({ onClose }: LecturerSubmissionFormProps) {
    const { data, setData, post, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm<FormData>({
        nama_dosen: '',
        judul_proyek: '',
        lokasi: '',
        dosen_terlibat: [''],
        staff_terlibat: [''],
        mahasiswa_terlibat: [''],
        sumber_dana: '',
        total_RAB: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        proposal: null,
    });

    const [mockProcessing, setMockProcessing] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success' as const, title: '', message: '' });
    const requiredSubmissionIssues: string[] = [];

    if (!data.judul_proyek.trim()) requiredSubmissionIssues.push('Judul proyek wajib diisi.');
    if (!data.nama_dosen.trim()) requiredSubmissionIssues.push('Ketua kelompok wajib diisi.');
    if (!data.lokasi.trim()) requiredSubmissionIssues.push('Lokasi pengabdian wajib diisi.');
    if (
        getFilledTeamMembers(data.dosen_terlibat).length === 0 &&
        getFilledTeamMembers(data.staff_terlibat).length === 0 &&
        getFilledTeamMembers(data.mahasiswa_terlibat).length === 0
    ) {
        requiredSubmissionIssues.push('Isi minimal satu nama anggota pada salah satu bagian tim pelaksana.');
    }
    if (!data.sumber_dana) requiredSubmissionIssues.push('Sumber dana wajib dipilih.');
    if (!String(data.total_RAB).trim()) requiredSubmissionIssues.push('Total anggaran wajib diisi.');
    if (!data.tanggal_mulai) requiredSubmissionIssues.push('Tanggal mulai wajib diisi.');
    if (!data.tanggal_selesai) requiredSubmissionIssues.push('Tanggal selesai wajib diisi.');
    if (!data.proposal) requiredSubmissionIssues.push('Proposal wajib diunggah.');

    const hasStartedSubmission = Boolean(
        data.judul_proyek.trim() ||
        data.nama_dosen.trim() ||
        data.lokasi.trim() ||
        data.sumber_dana ||
        String(data.total_RAB).trim() ||
        data.tanggal_mulai ||
        data.tanggal_selesai ||
        data.proposal ||
        getFilledTeamMembers(data.dosen_terlibat).length ||
        getFilledTeamMembers(data.staff_terlibat).length ||
        getFilledTeamMembers(data.mahasiswa_terlibat).length
    );

    const isProcessing = inertiaProcessing || mockProcessing;
    const isSubmitDisabled = isProcessing || requiredSubmissionIssues.length > 0;

    const handleAddPersonil = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat') => {
        setData(type, [...data[type], '']);
    };

    const handleRemovePersonil = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', indexToRemove: number) => {
        const filtered = data[type].filter((_, index) => index !== indexToRemove);
        setData(type, filtered);
    };

    const handlePersonilChange = (type: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', index: number, value: string) => {
        const updated = [...data[type]];
        updated[index] = value;
        setData(type, updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        let hasErrors = false;
        if (!data.judul_proyek) { setError('judul_proyek', 'Judul proyek wajib diisi'); hasErrors = true; }
        if (!data.nama_dosen) { setError('nama_dosen', 'Ketua kelompok wajib diisi'); hasErrors = true; }
        if (!data.lokasi) { setError('lokasi', 'Lokasi pengabdian wajib diisi'); hasErrors = true; }
        if (
            getFilledTeamMembers(data.dosen_terlibat).length === 0 &&
            getFilledTeamMembers(data.staff_terlibat).length === 0 &&
            getFilledTeamMembers(data.mahasiswa_terlibat).length === 0
        ) {
            setError('dosen_terlibat', 'Isi minimal satu anggota pada dosen, staf, atau mahasiswa.');
            hasErrors = true;
        }
        if (!data.sumber_dana) { setError('sumber_dana', 'Sumber dana wajib dipilih.'); hasErrors = true; }
        if (!String(data.total_RAB).trim()) { setError('total_RAB', 'Total anggaran wajib diisi.'); hasErrors = true; }
        if (!data.tanggal_mulai) { setError('tanggal_mulai', 'Tanggal mulai wajib diisi.'); hasErrors = true; }
        if (!data.tanggal_selesai) { setError('tanggal_selesai', 'Tanggal selesai wajib diisi.'); hasErrors = true; }
        if (!data.proposal) { setError('proposal', 'Proposal wajib diunggah.'); hasErrors = true; }

        if (hasErrors) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Siap Dikirim', message: 'Masih ada data wajib yang belum lengkap. Silakan periksa kembali bagian yang diperlukan.' });
            return;
        }

        setMockProcessing(true);
        setTimeout(() => {
            setMockProcessing(false);
            setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil Dikirim', message: 'Pengajuan PKM Anda sudah berhasil dikirim dan siap diproses lebih lanjut.' });
            setTimeout(() => {
                reset();
            }, 300);
        }, 1500);
    };

    const teamSections: TeamSection[] = [
        {
            enabledKey: 'sertakan_dosen_terlibat',
            type: 'dosen_terlibat',
            title: 'Dosen Terlibat',
            placeholder: 'Nama Dosen',
            icon: 'fa-user-tie',
            titleColor: '#1e293b',
            iconBg: '#e0f2fe',
            iconColor: '#0369a1',
            sectionBg: '#f8fafc',
            sectionBorder: '#e2e8f0',
            buttonBg: '#e0f2fe',
            buttonColor: '#0369a1',
            note: 'Centang jika ada dosen lain yang ikut selain ketua kelompok.',
        },
        {
            enabledKey: 'sertakan_staff_terlibat',
            type: 'staff_terlibat',
            title: 'Staf Terlibat',
            placeholder: 'Nama Staf',
            icon: 'fa-id-badge',
            titleColor: '#4c1d95',
            iconBg: '#f3e8ff',
            iconColor: '#6d28d9',
            sectionBg: '#fbf5ff',
            sectionBorder: '#f3e8ff',
            buttonBg: '#ede9fe',
            buttonColor: '#6d28d9',
            note: 'Centang jika ada staf yang ikut dalam pelaksanaan.',
        },
        {
            enabledKey: 'sertakan_mahasiswa_terlibat',
            type: 'mahasiswa_terlibat',
            title: 'Mahasiswa Terlibat',
            placeholder: 'Nama Mahasiswa',
            icon: 'fa-graduation-cap',
            titleColor: '#14532d',
            iconBg: '#dcfce7',
            iconColor: '#16a34a',
            sectionBg: '#f0fdf4',
            sectionBorder: '#dcfce7',
            buttonBg: '#dcfce7',
            buttonColor: '#16a34a',
            note: 'Centang jika ada mahasiswa yang ikut dalam pelaksanaan.',
        },
    ];

    const renderTeamSection = (section: TeamSection, isEnabled: boolean, onToggle: (checked: boolean) => void) => (
        <div
            key={section.type}
            className="p-4 rounded-xl border mb-4 transition-opacity"
            style={{
                backgroundColor: section.sectionBg,
                borderColor: section.sectionBorder,
                opacity: isEnabled ? 1 : 0.82,
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="w-4 h-4 accent-current"
                        style={{ accentColor: section.iconColor }}
                    />
                    <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                        style={{ backgroundColor: section.iconBg, color: section.iconColor }}
                    >
                        <i className={`fa-solid ${section.icon}`}></i>
                    </span>
                    <span className="text-sm font-bold" style={{ color: section.titleColor }}>
                        {section.title}
                    </span>
                </label>
                {isEnabled && (
                    <button
                        type="button"
                        onClick={() => handleAddPersonil(section.type)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                        style={{ backgroundColor: section.buttonBg, color: section.buttonColor }}
                    >
                        <i className="fa-solid fa-plus mr-1"></i> Tambah
                    </button>
                )}
            </div>

            {!isEnabled && (
                <p className="text-sm text-slate-500">{section.note}</p>
            )}

            {isEnabled && (
                <div className="space-y-3">
                    {data[section.type].map((personil, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="flex items-center gap-3 flex-1">
                                <span
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                                    style={{ backgroundColor: section.iconBg, color: section.iconColor }}
                                >
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={personil}
                                    onChange={(e) => handlePersonilChange(section.type, index, e.target.value)}
                                    placeholder={`${section.placeholder} ${index + 1}`}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors"
                                />
                            </div>
                            {data[section.type].length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemovePersonil(section.type, index)}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                </button>
                            )}
                        </div>
                    ))}
                    {errors[section.type] && (
                        <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {errors[section.type]}
                        </p>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 my-8">
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Pengajuan PKM Dosen</h2>
                            <p className="text-sm text-slate-600 mt-1">Lengkapi detail proyek pengabdian masyarakat Anda</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                            aria-label="Tutup"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
                    {/* Detail Proyek */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-folder-open text-sigap-blue"></i>
                            Detail Proyek
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Judul Proyek PKM <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.judul_proyek}
                                    onChange={(e) => setData('judul_proyek', e.target.value)}
                                    placeholder="Masukkan judul pengabdian..."
                                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                        errors.judul_proyek ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                />
                                {errors.judul_proyek && <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i> {errors.judul_proyek}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Ketua Kelompok <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_dosen}
                                        onChange={(e) => setData('nama_dosen', e.target.value)}
                                        placeholder="Nama Lengkap & Gelar..."
                                        className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                            errors.nama_dosen ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                        }`}
                                    />
                                    {errors.nama_dosen && <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i> {errors.nama_dosen}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Lokasi Pengabdian <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.lokasi}
                                        onChange={(e) => setData('lokasi', e.target.value)}
                                        placeholder="Desa, Kecamatan, Kota..."
                                        className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                            errors.lokasi ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                        }`}
                                    />
                                    {errors.lokasi && <p className="mt-1.5 text-sm text-red-600 font-medium flex items-center gap-1.5"><i className="fa-solid fa-circle-exclamation"></i> {errors.lokasi}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-200" />

                    {/* Tim Pelaksana */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <i className="fa-solid fa-users text-sigap-blue"></i>
                            Tim Pelaksana
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Masukkan nama dosen, staf, atau mahasiswa yang turut serta dalam proyek ini.</p>

                        {teamSections.map((section) => {
                            const enabledKey = section.enabledKey as keyof typeof data;
                            const isEnabled = data[enabledKey as 'sertakan_dosen_terlibat' | 'sertakan_staff_terlibat' | 'sertakan_mahasiswa_terlibat'] as unknown as boolean;

                            return renderTeamSection(
                                section,
                                isEnabled,
                                (checked: boolean) => {
                                    setData(enabledKey as 'sertakan_dosen_terlibat' | 'sertakan_staff_terlibat' | 'sertakan_mahasiswa_terlibat', checked);
                                    if (checked && data[section.type].length === 0) {
                                        setData(section.type, ['']);
                                    }
                                    if (!checked) {
                                        clearErrors(section.type);
                                    }
                                }
                            );
                        })}
                    </div>

                    <hr className="border-slate-200" />

                    {/* Pendanaan & Jadwal */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-wallet text-sigap-blue"></i>
                            Pendanaan & Jadwal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana</label>
                                <select
                                    value={data.sumber_dana}
                                    onChange={(e) => setData('sumber_dana', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                        errors.sumber_dana ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                >
                                    <option value="" disabled>Pilih Sumber Dana</option>
                                    <option value="DIPA Poltekpar">DIPA Poltekpar</option>
                                    <option value="Mandiri">Mandiri / Pribadi</option>
                                    <option value="Sponsor Luar">Sponsor Eksternal</option>
                                </select>
                                {errors.sumber_dana && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.sumber_dana}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Total Anggaran (RAB)</label>
                                <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100 transition-colors">
                                    <span className="text-slate-500 font-medium">Rp</span>
                                    <input
                                        type="number"
                                        value={data.total_RAB}
                                        onChange={(e) => setData('total_RAB', e.target.value)}
                                        placeholder="0"
                                        className="flex-1 outline-none text-slate-900"
                                    />
                                </div>
                                {errors.total_RAB && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.total_RAB}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                        errors.tanggal_mulai ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                />
                                {errors.tanggal_mulai && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.tanggal_mulai}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 transition-colors ${
                                        errors.tanggal_selesai ? 'border-red-300 bg-red-50' : 'border-slate-200'
                                    }`}
                                />
                                {errors.tanggal_selesai && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.tanggal_selesai}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Unggah Proposal (PDF)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-sigap-blue hover:bg-slate-50 transition-all">
                                    <input
                                        type="file"
                                        id="proposal"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setData('proposal', e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label htmlFor="proposal" className="cursor-pointer">
                                        <div className="flex flex-col items-center">
                                            <div className="w-14 h-14 rounded-full bg-blue-100 text-sigap-blue flex items-center justify-center mb-3">
                                                <i className="fa-solid fa-cloud-arrow-up text-2xl"></i>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900">
                                                {data.proposal ? data.proposal.name : 'Pilih file PDF pengajuan...'}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                                {errors.proposal && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.proposal}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Validation Alert */}
                    {hasStartedSubmission && requiredSubmissionIssues.length > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5"></i>
                            <div>
                                <strong className="text-amber-900 text-sm">Form belum bisa dikirim</strong>
                                <p className="text-amber-700 text-sm mt-0.5">{requiredSubmissionIssues[0]}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitDisabled}
                            className={`flex-1 px-4 py-3 text-sm font-semibold text-white bg-sigap-blue hover:bg-sigap-darkBlue rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                isProcessing ? 'opacity-75' : ''
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane"></i>
                                    <span>Kirim Pengajuan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <ActionFeedbackDialog
                show={feedbackDialog.show}
                type={feedbackDialog.type}
                title={feedbackDialog.title}
                message={feedbackDialog.message}
                onClose={() => {
                    const wasSuccess = feedbackDialog.type === 'success';
                    setFeedbackDialog({ ...feedbackDialog, show: false });
                    if (wasSuccess) {
                        onClose();
                    }
                }}
            />
        </div>
    );
}
