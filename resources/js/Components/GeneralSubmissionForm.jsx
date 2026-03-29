import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';

const createSubmittedLabel = () => (
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date())
);

export default function GeneralSubmissionForm({ onClose, onSubmitted }) {
    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        institution: '',
        needs: '',
        location: '',
        email: '',
        whatsapp: '',
        request_letter: null,
    });

    const letterInputRef = useRef(null);
    const [feedbackDialog, setFeedbackDialog] = React.useState({ show: false, type: 'success', title: '', message: '' });
    const requiredSubmissionIssues = [];

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

    const handleSubmit = (e) => {
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

    const handleFileChange = (field, e) => {
        if (e.target.files && e.target.files[0]) {
            setData(field, e.target.files[0]);
        }
    };

    const handleDrop = (field, e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setData(field, e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="masyarakat-form-overlay">
            <div className="masyarakat-form-backdrop" onClick={onClose}></div>
            <div className="masyarakat-form-modal">
                <div className="masyarakat-form-header">
                    <h2>Pengajuan PKM Umum</h2>
                    <p>Lengkapi profil dan unggah dokumen proposal Anda.</p>
                    <button type="button" onClick={onClose} className="masyarakat-form-close">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="masyarakat-form-body">
                    <form onSubmit={handleSubmit} className="custom-submission-form">

                        <div className="form-group">
                            <label>Nama Lengkap / Perwakilan <span className="required">*</span></label>
                            <div className="input-wrapper">
                                <i className="fa-solid fa-user input-icon"></i>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Masukkan Nama Anda" required />
                            </div>
                            {errors.name && <div className="field-error">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label>Nama Institusi / Organisasi <span className="required">*</span></label>
                            <div className="input-wrapper">
                                <i className="fa-solid fa-building input-icon"></i>
                                <input type="text" value={data.institution} onChange={e => setData('institution', e.target.value)} placeholder="Masukkan Nama Institusi" required />
                            </div>
                            {errors.institution && <div className="field-error">{errors.institution}</div>}
                        </div>

                        <div className="form-group">
                            <label>Kebutuhan / Permintaan <span className="required">*</span></label>
                            <div className="input-wrapper align-top">
                                <i className="fa-solid fa-clipboard-list input-icon"></i>
                                <textarea value={data.needs} onChange={e => setData('needs', e.target.value)} placeholder="Jelaskan secara singkat jenis bantuan / kebutuhan PKM" rows="3" required></textarea>
                            </div>
                            {errors.needs && <div className="field-error">{errors.needs}</div>}
                        </div>

                        <div className="form-group">
                            <label>Lokasi / Titik Kegiatan <span className="required">*</span></label>
                            <div className="input-wrapper">
                                <i className="fa-solid fa-map-pin input-icon"></i>
                                <input type="text" value={data.location} onChange={e => setData('location', e.target.value)} placeholder="Contoh: Desa Bira, Makassar" required />
                            </div>
                            {errors.location && <div className="field-error">{errors.location}</div>}
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label>Alamat Email <span className="required">*</span></label>
                                <div className="input-wrapper">
                                    <i className="fa-solid fa-envelope input-icon"></i>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="email@contoh.com" required />
                                </div>
                                {errors.email && <div className="field-error">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <label>Nomor WhatsApp <span className="required">*</span></label>
                                <div className="input-wrapper">
                                    <i className="fa-brands fa-whatsapp input-icon"></i>
                                    <input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} placeholder="081234567890" required />
                                </div>
                                {errors.whatsapp && <div className="field-error">{errors.whatsapp}</div>}
                            </div>
                        </div>



                        <div className="form-group">
                            <label className="file-label">Surat Permohonan (PDF) <span className="required">*</span></label>
                            <div
                                className={`file-dropzone ${data.request_letter ? 'file-selected' : ''}`}
                                onClick={() => letterInputRef.current.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDrop('request_letter', e)}
                            >
                                <input type="file" ref={letterInputRef} onChange={(e) => handleFileChange('request_letter', e)} accept=".pdf" className="hidden-input" required={!data.request_letter} />
                                <div className="dropzone-inner">
                                    <div className="dropzone-icon-wrapper">
                                        <i className={`fa-solid ${data.request_letter ? 'fa-file-pdf icon-pdf' : 'fa-cloud-arrow-up icon-upload'}`}></i>
                                    </div>
                                    <div className="dropzone-text">
                                        {data.request_letter ? (
                                            <>
                                                <div className="file-name">{data.request_letter.name}</div>
                                                <div className="file-size">{(data.request_letter.size / 1024 / 1024).toFixed(2)} MB</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="upload-title">Tap atau Tarik Surat Permohonan</div>
                                                <div className="upload-subtitle">Format PDF, maksimal 5MB</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {progress && progress.percentage && data.request_letter && !errors.request_letter && (
                                <div className="upload-progress">
                                    <div className="progress-bar" style={{ width: `${progress.percentage}%` }}></div>
                                </div>
                            )}
                            {errors.request_letter && <div className="field-error">{errors.request_letter}</div>}
                        </div>

                        <div className="form-actions">
                            {hasStartedSubmission && requiredSubmissionIssues.length > 0 && (
                                <div className="form-validation-alert" style={{ marginTop: 0, marginBottom: '12px' }}>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <div>
                                        <strong>Form belum bisa dikirim</strong>
                                        <p>{requiredSubmissionIssues[0]}</p>
                                    </div>
                                </div>
                            )}
                            <button type="button" className="btn-form-cancel" onClick={onClose} disabled={processing}>Batal</button>
                            <button type="submit" className="btn-form-submit" disabled={isSubmitDisabled}>
                                {processing ? (
                                    <><i className="fa-solid fa-spinner fa-spin"></i> Memproses...</>
                                ) : (
                                    <><i className="fa-solid fa-paper-plane"></i> Kirim Pengajuan</>
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
                        onClose?.();
                    }
                }}
            />
        </div>
    );
}
