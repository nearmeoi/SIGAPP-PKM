import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { useForm } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';

interface FormData {
    name: string;
    institution: string;
    needs: string;
    location: string;
    email: string;
    whatsapp: string;
    request_letter: File | null;
}

interface GeneralSubmissionFormProps {
    onClose: () => void;
    onSubmitted?: (submission: { id: number; judul: string; ringkasan: string; tanggal: string; status: string }) => void;
}

const createSubmittedLabel = (): string =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date());

export default function GeneralSubmissionForm({ onClose, onSubmitted }: GeneralSubmissionFormProps) {
    const { data, setData, post, processing, errors, progress } = useForm<FormData>({
        name: '',
        institution: '',
        needs: '',
        location: '',
        email: '',
        whatsapp: '',
        request_letter: null,
    });

    const letterInputRef = useRef<HTMLInputElement>(null);
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success' as const, title: '', message: '' });
    const requiredSubmissionIssues: string[] = [];

    if (!data.name.trim()) requiredSubmissionIssues.push('Nama lengkap atau perwakilan wajib diisi.');
    if (!data.institution.trim()) requiredSubmissionIssues.push('Nama institusi atau organisasi wajib diisi.');
    if (!data.needs.trim()) requiredSubmissionIssues.push('Kebutuhan atau permintaan wajib diisi.');
    if (!data.location.trim()) requiredSubmissionIssues.push('Lokasi kegiatan wajib diisi.');
    if (!data.email.trim()) requiredSubmissionIssues.push('Alamat email wajib diisi.');
    if (!data.whatsapp.trim()) requiredSubmissionIssues.push('Nomor WhatsApp wajib diisi.');
    if (!data.request_letter) requiredSubmissionIssues.push('Surat permohonan wajib dilampirkan.');

    const hasStartedSubmission = Boolean(
        data.name.trim() ||
        data.institution.trim() ||
        data.needs.trim() ||
        data.location.trim() ||
        data.email.trim() ||
        data.whatsapp.trim() ||
        data.request_letter
    );

    const isSubmitDisabled = processing || requiredSubmissionIssues.length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (requiredSubmissionIssues.length > 0) {
            setFeedbackDialog({
                show: true,
                type: 'error',
                title: 'Form Belum Siap Dikirim',
                message: 'Masih ada data wajib yang belum lengkap. Silakan lengkapi kolom yang diperlukan terlebih dahulu.',
            });
            return;
        }

        post(route('pkm.general.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onSubmitted?.({
                    id: Date.now(),
                    judul: `Pengajuan PKM ${data.institution || data.name || 'Masyarakat'}`,
                    ringkasan: data.needs || `Permintaan dari ${data.name || 'pemohon'}`,
                    tanggal: createSubmittedLabel(),
                    status: 'diproses',
                });
                setFeedbackDialog({
                    show: true,
                    type: 'success',
                    title: 'Pengajuan Berhasil Dikirim',
                    message: 'Pengajuan PKM umum Anda sudah tersimpan dan siap diproses lebih lanjut.',
                });
            },
        });
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('request_letter', e.target.files[0]);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData('request_letter', e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Pengajuan PKM Umum</h2>
                            <p className="text-sm text-slate-600 mt-1">Lengkapi profil dan unggah dokumen proposal Anda.</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-400"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identitas Pemohon */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-id-card text-sigap-blue"></i>
                                Identitas Pemohon
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nama Lengkap / Perwakilan <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-solid fa-user text-slate-400"></i>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Masukkan Nama Anda"
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nama Institusi / Organisasi <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.institution ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-solid fa-building text-slate-400"></i>
                                        <input
                                            type="text"
                                            value={data.institution}
                                            onChange={(e) => setData('institution', e.target.value)}
                                            placeholder="Masukkan Nama Institusi"
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                    {errors.institution && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.institution}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Alamat Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-solid fa-envelope text-slate-400"></i>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="email@contoh.com"
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nomor WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.whatsapp ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-brands fa-whatsapp text-slate-400"></i>
                                        <input
                                            type="tel"
                                            value={data.whatsapp}
                                            onChange={(e) => setData('whatsapp', e.target.value)}
                                            placeholder="081234567890"
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                    {errors.whatsapp && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.whatsapp}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Kebutuhan Kegiatan */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-handshake-angle text-sigap-blue"></i>
                                Kebutuhan Kegiatan
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Kebutuhan / Permintaan <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-start gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.needs ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-solid fa-clipboard-list text-slate-400 mt-1"></i>
                                        <textarea
                                            value={data.needs}
                                            onChange={(e) => setData('needs', e.target.value)}
                                            placeholder="Jelaskan secara singkat jenis bantuan / kebutuhan PKM"
                                            rows={3}
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400 resize-none"
                                        />
                                    </div>
                                    {errors.needs && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.needs}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Lokasi / Titik Kegiatan <span className="text-red-500">*</span>
                                    </label>
                                    <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-colors ${
                                        errors.location ? 'border-red-300 bg-red-50' : 'border-slate-200 focus-within:border-sigap-blue focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}>
                                        <i className="fa-solid fa-map-pin text-slate-400"></i>
                                        <input
                                            type="text"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            placeholder="Contoh: Desa Bira, Makassar"
                                            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                    {errors.location && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.location}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-200" />

                        {/* Dokumen Pendukung */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-file-arrow-up text-sigap-blue"></i>
                                Dokumen Pendukung
                            </h3>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Surat Permohonan (PDF) <span className="text-red-500">*</span>
                                </label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                        data.request_letter
                                            ? 'border-sigap-blue bg-blue-50'
                                            : 'border-slate-300 hover:border-sigap-blue hover:bg-slate-50'
                                    }`}
                                    onClick={() => letterInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        ref={letterInputRef}
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        className="hidden"
                                        required={!data.request_letter}
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                                            data.request_letter ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-sigap-blue'
                                        }`}>
                                            <i className={`fa-solid text-2xl ${data.request_letter ? 'fa-file-pdf' : 'fa-cloud-arrow-up'}`}></i>
                                        </div>
                                        {data.request_letter ? (
                                            <>
                                                <div className="text-sm font-semibold text-slate-900">{data.request_letter.name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {(data.request_letter.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-sm font-semibold text-slate-900">Tap atau Tarik Surat Permohonan</div>
                                                <div className="text-xs text-slate-500 mt-0.5">Format PDF, maksimal 5MB</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {progress && progress.percentage && data.request_letter && !errors.request_letter && (
                                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-sigap-blue transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        ></div>
                                    </div>
                                )}
                                {errors.request_letter && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.request_letter}</p>}
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
                                disabled={processing}
                                className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className={`flex-1 px-4 py-3 text-sm font-semibold text-white bg-sigap-blue hover:bg-sigap-darkBlue rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                    processing ? 'opacity-75' : ''
                                }`}
                            >
                                {processing ? (
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
