import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';

const REQUEST_TEMPLATE_URL = 'https://p3m.poltekparmakassar.ac.id/dokumen/';

const createSubmittedLabel = () => (
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date())
);

const getPkmStatusLabel = (status) => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const getSubmissionHistoryStyle = (status) => {
    switch (status) {
        case 'diterima':
            return { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' };
        case 'ditangguhkan':
            return { label: 'Ditangguhkan', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' };
        case 'ditolak':
            return { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' };
        default:
            return { label: status, icon: 'fa-circle-info', bg: '#e2e8f0', color: '#475569' };
    }
};

const getSubmissionStatusStyle = (status) => {
    switch (status) {
        case 'diproses':
            return { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1d4ed8' };
        case 'ditangguhkan':
            return { label: 'Ditangguhkan', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' };
        case 'ditolak':
            return { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' };
        case 'diterima':
            return { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' };
        case 'berlangsung':
            return { label: 'Berlangsung', icon: 'fa-person-walking', bg: '#fef3c7', color: '#b45309' };
        case 'selesai':
            return { label: 'Selesai', icon: 'fa-flag-checkered', bg: '#dcfce7', color: '#15803d' };
        default:
            return { label: 'Belum Diajukan', icon: 'fa-file-circle-plus', bg: '#f1f5f9', color: '#64748b' };
    }
};

export default function MasyarakatSubmissionCard({
    submissionStatus = 'belum_diajukan',
    latestSubmission = null,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    onSubmitted,
    onUpdateSubmissionStatus,
    hideInlineStatusPanel = false,
}) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({
        kegiatan: false,
        riwayat: false,
    });
    const [expandedActivityId, setExpandedActivityId] = useState(() => pkmListData[0]?.id ?? null);
    const [expandedHistoryId, setExpandedHistoryId] = useState(() => submissionHistory[0]?.id ?? null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [revisionProcessing, setRevisionProcessing] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success', title: '', message: '' });
    const requestLetterRef = useRef(null);
    const revisionInputRef = useRef(null);

    const { data, setData, errors, setError, clearErrors, reset } = useForm({
        name: '',
        institution: '',
        needs: '',
        location: '',
        email: '',
        whatsapp: '',
        request_letter: null,
    });

    const requiredSubmissionIssues = [];

    if (!data.name.trim()) requiredSubmissionIssues.push('Nama perwakilan wajib diisi.');
    if (!data.institution.trim()) requiredSubmissionIssues.push('Nama institusi atau organisasi wajib diisi.');
    if (!data.needs.trim()) requiredSubmissionIssues.push('Kebutuhan atau permintaan wajib diisi.');
    if (!data.location.trim()) requiredSubmissionIssues.push('Lokasi kegiatan wajib diisi.');
    if (!data.email.trim()) requiredSubmissionIssues.push('Alamat email wajib diisi.');
    if (!data.whatsapp.trim()) requiredSubmissionIssues.push('Nomor WhatsApp wajib diisi.');
    if (!data.request_letter) requiredSubmissionIssues.push('Surat permohonan wajib dilampirkan sebelum pengajuan dikirim.');
    const hasStartedSubmission = Boolean(
        data.name.trim() ||
        data.institution.trim() ||
        data.needs.trim() ||
        data.location.trim() ||
        data.email.trim() ||
        data.whatsapp.trim() ||
        data.request_letter
    );

    const isSubmitDisabled = isMockSubmitting || requiredSubmissionIssues.length > 0;

    const handleFileChange = (event) => {
        const nextFile = event.target.files?.[0] ?? null;
        setData('request_letter', nextFile);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        clearErrors();
        setFeedbackDialog({ show: false, type: 'success', title: '', message: '' });

        let hasError = false;

        if (!data.name.trim()) {
            setError('name', 'Nama perwakilan wajib diisi.');
            hasError = true;
        }
        if (!data.institution.trim()) {
            setError('institution', 'Nama institusi atau organisasi wajib diisi.');
            hasError = true;
        }
        if (!data.needs.trim()) {
            setError('needs', 'Kebutuhan atau permintaan wajib diisi.');
            hasError = true;
        }
        if (!data.location.trim()) {
            setError('location', 'Lokasi kegiatan wajib diisi.');
            hasError = true;
        }
        if (!data.email.trim()) {
            setError('email', 'Alamat email wajib diisi.');
            hasError = true;
        }
        if (!data.whatsapp.trim()) {
            setError('whatsapp', 'Nomor WhatsApp wajib diisi.');
            hasError = true;
        }
        if (!data.request_letter) {
            setError('request_letter', 'Surat permohonan wajib dilampirkan.');
            hasError = true;
        }

        if (hasError) {
            setFeedbackDialog({
                show: true,
                type: 'error',
                title: 'Form Belum Siap Dikirim',
                message: 'Masih ada data wajib yang belum lengkap. Silakan lengkapi kolom yang diperlukan terlebih dahulu.',
            });
            return;
        }

        setIsMockSubmitting(true);

        window.setTimeout(() => {
            setIsMockSubmitting(false);
            onSubmitted?.({
                id: Date.now(),
                judul: `Pengajuan PKM ${data.institution}`,
                ringkasan: data.needs,
                tanggal: createSubmittedLabel(),
                status: 'diproses',
            });
            onUpdateSubmissionStatus?.('diproses');
            setFeedbackDialog({
                show: true,
                type: 'success',
                title: 'Pengajuan Berhasil Dikirim',
                message: 'Pengajuan masyarakat Anda sudah tersimpan dan akan diproses oleh tim P3M.',
            });
            reset();
            if (requestLetterRef.current) {
                requestLetterRef.current.value = '';
            }
        }, 900);
    };

    const handleUploadRevision = (selectedFile) => {
        if (!selectedFile) {
            return;
        }

        setRevisionProcessing(true);

        window.setTimeout(() => {
            setRevisionProcessing(false);
            if (revisionInputRef.current) {
                revisionInputRef.current.value = '';
            }
            onUpdateSubmissionStatus?.('diproses');
            setFeedbackDialog({
                show: true,
                type: 'success',
                title: 'Revisi Berhasil Terkirim',
                message: 'Dokumen revisi masyarakat sudah berhasil diunggah dan status pengajuan kembali masuk ke tahap diproses.',
            });
        }, 1000);
    };

    const handleCreateNewSubmission = () => {
        reset();
        clearErrors();
        if (requestLetterRef.current) {
            requestLetterRef.current.value = '';
        }
        if (revisionInputRef.current) {
            revisionInputRef.current.value = '';
        }
        onUpdateSubmissionStatus?.('belum_diajukan');
        setFeedbackDialog({
            show: true,
            type: 'success',
            title: 'Siap Mengajukan Ulang',
            message: 'Form pengajuan masyarakat sudah dibuka kembali dan siap Anda lengkapi dari awal.',
        });
    };

    const renderError = (field) => (
        errors[field]
            ? <span style={{ display: 'block', marginTop: '8px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>{errors[field]}</span>
            : null
    );

    const renderArchiveTab = () => (
        <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
            <div className="submission-hub-shell">
                <div className="submission-hub-centered">
                    <div
                        className="submission-hub-overview"
                        style={{
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            padding: '18px 20px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #eff6ff, #f8fafc)',
                            border: '1px solid #dbeafe',
                            marginBottom: '18px',
                        }}
                    >
                        <span
                            className="submission-hub-overview-icon"
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <i className="fa-solid fa-table-list"></i>
                        </span>
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>Daftar Kegiatan dan Riwayat Pengajuan</h4>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#64748b' }}>
                                Bagian arsip tetap mengikuti pola akun dosen agar pengalaman halaman tetap konsisten.
                            </p>
                        </div>
                    </div>

                    <div className={`submission-hub-panel ${expandedHubSections.kegiatan ? 'is-expanded' : ''}`}>
                        <button
                            type="button"
                            className="submission-hub-panel-toggle"
                            onClick={() => setExpandedHubSections((previous) => ({ ...previous, kegiatan: !previous.kegiatan }))}
                        >
                            <div className="submission-hub-panel-head">
                                <div>
                                    <h4>Daftar Kegiatan</h4>
                                    <p>Daftar titik kegiatan yang tersedia pada peta PKM.</p>
                                </div>
                                <span className="submission-hub-panel-badge">{pkmListData.length} kegiatan</span>
                            </div>
                            <span className="submission-hub-panel-caret">
                                <i className={`fa-solid fa-chevron-${expandedHubSections.kegiatan ? 'up' : 'down'}`}></i>
                            </span>
                        </button>

                        {expandedHubSections.kegiatan && (
                            <div className="submission-hub-list">
                                {pkmListData.map((activity) => {
                                    const isOpen = expandedActivityId === activity.id;

                                    return (
                                        <div key={activity.id} className={`submission-hub-item ${isOpen ? 'is-open' : ''}`}>
                                            <button
                                                type="button"
                                                className="submission-hub-item-toggle"
                                                onClick={() => setExpandedActivityId((previousId) => previousId === activity.id ? null : activity.id)}
                                            >
                                                <div className="submission-hub-item-copy">
                                                    <strong>{activity.nama}</strong>
                                                    <span>{activity.desa}, Kec. {activity.kecamatan}</span>
                                                </div>
                                                <div className="submission-hub-item-meta">
                                                    <span className={`submission-hub-status-chip ${activity.status}`}>
                                                        <i className={`fa-solid ${activity.status === 'berlangsung' ? 'fa-person-walking' : 'fa-flag-checkered'}`}></i>
                                                        {getPkmStatusLabel(activity.status)}
                                                    </span>
                                                    <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="submission-hub-item-body">
                                                    <p>{activity.deskripsi}</p>
                                                    <div className="submission-hub-detail-row">
                                                        <span><i className="fa-solid fa-calendar-days"></i> Tahun {activity.tahun}</span>
                                                        <span><i className="fa-solid fa-location-dot"></i> {activity.kabupaten}, {activity.provinsi}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={`submission-hub-panel ${expandedHubSections.riwayat ? 'is-expanded' : ''}`}>
                        <button
                            type="button"
                            className="submission-hub-panel-toggle"
                            onClick={() => setExpandedHubSections((previous) => ({ ...previous, riwayat: !previous.riwayat }))}
                        >
                            <div className="submission-hub-panel-head">
                                <div>
                                    <h4>Riwayat Pengajuan</h4>
                                    <p>Contoh histori pengajuan untuk menampilkan alur status yang sama seperti akun dosen.</p>
                                </div>
                                <span className="submission-hub-panel-badge history">{submissionHistory.length} riwayat</span>
                            </div>
                            <span className="submission-hub-panel-caret">
                                <i className={`fa-solid fa-chevron-${expandedHubSections.riwayat ? 'up' : 'down'}`}></i>
                            </span>
                        </button>

                        {expandedHubSections.riwayat && (
                            <div className="submission-hub-list">
                                {submissionHistory.map((historyItem) => {
                                    const isOpen = expandedHistoryId === historyItem.id;
                                    const historyStyle = getSubmissionHistoryStyle(historyItem.status);

                                    return (
                                        <div key={historyItem.id} className={`submission-hub-item ${isOpen ? 'is-open' : ''}`}>
                                            <button
                                                type="button"
                                                className="submission-hub-item-toggle"
                                                onClick={() => setExpandedHistoryId((previousId) => previousId === historyItem.id ? null : historyItem.id)}
                                            >
                                                <div className="submission-hub-item-copy">
                                                    <strong>{historyItem.judul}</strong>
                                                    <span>{historyItem.tanggal}</span>
                                                </div>
                                                <div className="submission-hub-item-meta">
                                                    <span
                                                        className="submission-hub-status-chip"
                                                        style={{ backgroundColor: historyStyle.bg, color: historyStyle.color }}
                                                    >
                                                        <i className={`fa-solid ${historyStyle.icon}`}></i>
                                                        {historyStyle.label}
                                                    </span>
                                                    <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="submission-hub-item-body">
                                                    <p>{historyItem.ringkasan}</p>
                                                    <div className="submission-hub-detail-row">
                                                        <span><i className="fa-solid fa-note-sticky"></i> {historyItem.catatan}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMainTabNav = () => (
        <div className="submission-main-nav-shell">
            <div className="submission-main-nav">
                <button
                    type="button"
                    className={`submission-main-tab ${mainTab === 'pengajuan' ? 'is-active' : ''}`}
                    onClick={() => setMainTab('pengajuan')}
                >
                    <span className="submission-main-tab-icon">
                        <i className="fa-solid fa-file-signature"></i>
                    </span>
                    <span className="submission-main-tab-copy">
                        <strong>Pengajuan PKM</strong>
                        <small>Form langsung tampil di panel kanan</small>
                    </span>
                </button>

                <button
                    type="button"
                    className={`submission-main-tab ${mainTab === 'arsip' ? 'is-active' : ''}`}
                    onClick={() => setMainTab('arsip')}
                >
                    <span className="submission-main-tab-icon secondary">
                        <i className="fa-solid fa-layer-group"></i>
                    </span>
                    <span className="submission-main-tab-copy">
                        <strong>Kegiatan & Riwayat</strong>
                        <small>Daftar kegiatan dan histori pengajuan</small>
                    </span>
                </button>
            </div>
        </div>
    );

    const renderSubmissionTab = () => (
        <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
            {!hideInlineStatusPanel && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 35px -32px rgba(15, 23, 42, 0.35)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span
                            style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '14px',
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <i className={`fa-solid ${statusStyle.icon}`}></i>
                        </span>
                        <div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a' }}>Status Pengajuan</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                                Form tampil langsung seperti akun dosen, tetapi isi field memakai format masyarakat.
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '14px' }}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '7px 12px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: statusStyle.color,
                                backgroundColor: statusStyle.bg,
                            }}
                        >
                            <i className={`fa-solid ${statusStyle.icon}`}></i>
                            {statusStyle.label}
                        </span>
                    </div>
                </div>
            )}

            {latestSubmission && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: '18px 20px',
                        borderRadius: '18px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '15px' }}>Pengajuan Terbaru</strong>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{latestSubmission.tanggal}</span>
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px', marginBottom: '8px' }}>{latestSubmission.judul}</div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{latestSubmission.ringkasan}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '18px' }}>
                <div className="form-section" style={{ padding: 0, background: 'transparent' }}>
                    <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                        <i className="fa-solid fa-id-card text-blue"></i> Identitas Pemohon
                    </h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nama Lengkap / Perwakilan <span className="required-star">*</span></label>
                            <input type="text" className="fintech-input" placeholder="Masukkan nama perwakilan" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                            {renderError('name')}
                        </div>

                        <div className="form-group">
                            <label>Nama Institusi / Organisasi <span className="required-star">*</span></label>
                            <input type="text" className="fintech-input" placeholder="Masukkan nama institusi" value={data.institution} onChange={(event) => setData('institution', event.target.value)} />
                            {renderError('institution')}
                        </div>

                        <div className="form-group">
                            <label>Alamat Email <span className="required-star">*</span></label>
                            <input type="email" className="fintech-input" placeholder="email@contoh.com" value={data.email} onChange={(event) => setData('email', event.target.value)} />
                            {renderError('email')}
                        </div>

                        <div className="form-group">
                            <label>Nomor WhatsApp <span className="required-star">*</span></label>
                            <input type="tel" className="fintech-input" placeholder="081234567890" value={data.whatsapp} onChange={(event) => setData('whatsapp', event.target.value)} />
                            {renderError('whatsapp')}
                        </div>
                    </div>
                </div>

                <hr className="form-divider" style={{ margin: '4px 0' }} />

                <div className="form-section" style={{ padding: 0, background: 'transparent' }}>
                    <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                        <i className="fa-solid fa-handshake-angle text-blue"></i> Kebutuhan Kegiatan
                    </h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Kebutuhan / Permintaan <span className="required-star">*</span></label>
                            <textarea className="fintech-input" placeholder="Jelaskan kebutuhan atau permintaan PKM secara singkat" rows="4" value={data.needs} onChange={(event) => setData('needs', event.target.value)} style={{ resize: 'vertical', minHeight: '110px' }}></textarea>
                            {renderError('needs')}
                        </div>

                        <div className="form-group full-width">
                            <label>Lokasi / Titik Kegiatan <span className="required-star">*</span></label>
                            <input type="text" className="fintech-input" placeholder="Contoh: Desa Bira, Makassar" value={data.location} onChange={(event) => setData('location', event.target.value)} />
                            {renderError('location')}
                        </div>
                    </div>
                </div>

                <hr className="form-divider" style={{ margin: '4px 0' }} />

                <div className="form-section" style={{ padding: 0, background: 'transparent' }}>
                    <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                        <i className="fa-solid fa-file-arrow-up text-blue"></i> Dokumen Pendukung
                    </h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Surat Permohonan (PDF) <span className="required-star">*</span></label>
                            <div className="file-upload-wrapper">
                                <input ref={requestLetterRef} type="file" className="file-upload-input" id="request_letter_inline" accept=".pdf" onChange={handleFileChange} />
                                <label htmlFor="request_letter_inline" className={`file-upload-trigger ${data.request_letter ? 'has-file' : ''}`}>
                                    <span className="file-upload-icon-shell">
                                        <i className={`fa-solid ${data.request_letter ? 'fa-file-pdf' : 'fa-cloud-arrow-up'}`}></i>
                                    </span>
                                    <span className="file-upload-copy">
                                        <span className="file-upload-title">
                                            {data.request_letter ? 'Surat permohonan sudah dipilih' : 'Pilih surat permohonan'}
                                        </span>
                                        <span className="file-name">
                                            {data.request_letter ? data.request_letter.name : 'Unggah dokumen PDF maksimal 5MB'}
                                        </span>
                                    </span>
                                </label>
                            </div>
                            <a
                                href={REQUEST_TEMPLATE_URL}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'inline-block',
                                    marginTop: '12px',
                                    color: '#1d4ed8',
                                    fontSize: '12.5px',
                                    fontWeight: '700',
                                    lineHeight: '1.6',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                }}
                            >
                                Silakan klik tautan ini untuk mengunduh template surat permohonan.
                            </a>
                            {renderError('request_letter')}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginTop: '8px' }}>
                    {hasStartedSubmission && requiredSubmissionIssues.length > 0 && (
                        <div className="form-validation-alert" style={{ width: '100%', marginTop: 0, marginBottom: '12px' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <div>
                                <strong>Form belum bisa dikirim</strong>
                                <p>{requiredSubmissionIssues[0]}</p>
                            </div>
                        </div>
                    )}
                    <button type="submit" className={`btn-modal-submit ${isMockSubmitting ? 'btn-loading' : ''}`} style={{ width: '100%', borderRadius: '12px' }} disabled={isSubmitDisabled}>
                        {isMockSubmitting ? 'Memproses...' : 'Kirim Pengajuan'}
                        <i className={`fa-solid ${isMockSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                    </button>
                </div>
            </form>

            {pkmStatusData && (
                <div
                    style={{
                        marginTop: '18px',
                        padding: '20px',
                        borderRadius: '20px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div>
                            <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: '#0f172a' }}>{pkmStatusData.nama}</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{pkmStatusData.deskripsi}</p>
                        </div>
                        <span className={`submission-hub-status-chip ${pkmStatusData.status}`} style={{ flexShrink: 0 }}>
                            <i className={`fa-solid ${pkmStatusData.status === 'berlangsung' ? 'fa-person-walking' : 'fa-flag-checkered'}`}></i>
                            {getPkmStatusLabel(pkmStatusData.status)}
                        </span>
                    </div>

                    <div style={{ marginTop: '14px', fontSize: '13px', color: '#475569' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#64748b', marginRight: '6px' }}></i>
                        {pkmStatusData.desa}, Kec. {pkmStatusData.kecamatan}, {pkmStatusData.kabupaten}, {pkmStatusData.provinsi}
                    </div>
                </div>
            )}
        </div>
    );

    const statusCardConfig = {
        diproses: {
            icon: 'fa-clock',
            iconBg: '#dbeafe',
            iconColor: '#1d4ed8',
            title: 'Pengajuan PKM Anda sedang diproses.',
            message: 'Mohon menunggu proses verifikasi dari tim kami. Informasi lanjutan akan diberikan setelah peninjauan selesai.',
        },
        ditangguhkan: {
            icon: 'fa-file-pen',
            iconBg: '#fef3c7',
            iconColor: '#b45309',
            title: 'Pengajuan PKM Anda memerlukan revisi dokumen.',
            message: 'Silakan perbarui surat atau informasi pengajuan sesuai catatan, lalu unggah kembali agar pengajuan dapat kami proses ulang.',
        },
        ditolak: {
            icon: 'fa-circle-xmark',
            iconBg: '#fee2e2',
            iconColor: '#b91c1c',
            title: 'Maaf, pengajuan PKM Anda belum dapat kami terima.',
            message: 'Anda dapat menyiapkan pengajuan masyarakat yang baru atau diperbarui, lalu mengajukan kembali saat sudah siap.',
        },
        diterima: {
            icon: 'fa-circle-check',
            iconBg: '#dcfce7',
            iconColor: '#15803d',
            title: 'Selamat, pengajuan PKM Anda telah diterima.',
            message: 'Silakan cek email Anda secara berkala untuk melihat informasi lanjutan dan arahan berikutnya dari tim kami.',
        },
        berlangsung: {
            icon: 'fa-person-walking',
            iconBg: '#fef3c7',
            iconColor: '#b45309',
            title: 'Program PKM Anda sedang berlangsung.',
            message: 'Berikut ringkasan kegiatan yang saat ini sedang berjalan sesuai data PKM pada sistem.',
        },
        selesai: {
            icon: 'fa-flag-checkered',
            iconBg: '#dcfce7',
            iconColor: '#15803d',
            title: 'Program PKM Anda telah selesai dilaksanakan.',
            message: 'Berikut dokumentasi dan umpan balik kegiatan yang tersimpan pada data PKM.',
        },
    };

    if (submissionStatus !== 'belum_diajukan' && statusCardConfig[submissionStatus]) {
        const currentStatusCard = statusCardConfig[submissionStatus];
        const isRevisionMode = submissionStatus === 'ditangguhkan';
        const isRejectedMode = submissionStatus === 'ditolak';
        const isPkmBerlangsung = submissionStatus === 'berlangsung';
        const isPkmSelesai = submissionStatus === 'selesai';

        if ((isPkmBerlangsung || isPkmSelesai) && pkmStatusData) {
            return (
                <div className="chart-card public-access-card" style={{ overflow: 'visible' }}>
                    <div className="chart-card-header public-access-card-header" style={{ paddingBottom: '14px' }}>
                        <div className="chart-card-icon public-access-card-icon">
                            <i className="fa-solid fa-file-signature"></i>
                        </div>
                        <div>
                            <h3 className="chart-card-title">Akses Pengajuan PKM</h3>
                            <p className="chart-card-subtitle">Informasi kegiatan PKM yang sedang berjalan pada akun Anda</p>
                        </div>
                    </div>

                    {renderMainTabNav()}

                    {mainTab === 'arsip' ? (
                        renderArchiveTab()
                    ) : (
                        <div
                            className="public-access-card-body"
                            style={{
                                flex: '1 1 0%',
                                height: 0,
                                maxHeight: '100%',
                                padding: '0 24px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isPkmBerlangsung ? 'center' : 'stretch',
                                justifyContent: isPkmBerlangsung ? 'center' : 'flex-start',
                                minHeight: 0,
                                overflowY: isPkmSelesai ? 'auto' : 'hidden',
                            }}
                        >
                            <div className="location-card" style={{ marginTop: isPkmBerlangsung ? '0' : '16px', width: '100%', flex: '0 0 auto' }}>
                                <div
                                    className={`card-image-wrapper ${pkmStatusData.thumbnail ? 'has-image' : ''}`}
                                    style={pkmStatusData.thumbnail ? { backgroundImage: `url(${pkmStatusData.thumbnail})` } : {}}
                                >
                                    {!pkmStatusData.thumbnail && <i className="fa-solid fa-image"></i>}
                                </div>

                                <div className="card-body">
                                    <div className="card-header-flex">
                                        <h2 className="card-title">{pkmStatusData.nama}</h2>
                                        <span className="card-year">{pkmStatusData.tahun}</span>
                                    </div>

                                    <div className={`card-status ${pkmStatusData.status === 'berlangsung' ? 'status-open' : 'status-closed'}`}>
                                        <i className={`fa-solid ${pkmStatusData.status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double'}`}></i>{' '}
                                        {pkmStatusData.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}
                                    </div>

                                    <p className="card-description">{pkmStatusData.deskripsi}</p>

                                    {isPkmSelesai && (
                                        <>
                                            <DocumentationGallery status={pkmStatusData.status} driveLink={pkmStatusData.dokumentasi} />
                                            <TestimonialSidebarDisplay status={pkmStatusData.status} />
                                            <div
                                                style={{
                                                    marginTop: '18px',
                                                    padding: '18px 20px',
                                                    borderRadius: '18px',
                                                    border: '1px solid rgba(191, 219, 254, 0.9)',
                                                    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.98), rgba(248, 250, 252, 0.96))',
                                                    boxShadow: '0 20px 36px -30px rgba(29, 78, 216, 0.28)',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '52px',
                                                        height: '52px',
                                                        margin: '0 auto 12px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '16px',
                                                        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                                        color: '#1d4ed8',
                                                        fontSize: '1.15rem',
                                                    }}
                                                >
                                                    <i className="fa-solid fa-file-circle-plus"></i>
                                                </div>
                                                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                                                    Ingin membuat pengajuan PKM baru?
                                                </h4>
                                                <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
                                                    Jika kegiatan sebelumnya sudah selesai, Anda dapat langsung menyiapkan dan mengajukan program PKM berikutnya dari sini.
                                                </p>
                                                <button
                                                    type="button"
                                                    className="btn-modal-submit"
                                                    onClick={handleCreateNewSubmission}
                                                    style={{ width: '100%', maxWidth: '320px', margin: '0 auto', borderRadius: '12px' }}
                                                >
                                                    Buat Pengajuan Baru <i className="fa-solid fa-arrow-right"></i>
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    <div className="card-location">
                                        <i className="fa-solid fa-map-pin"></i> {pkmStatusData.desa}, Kec. {pkmStatusData.kecamatan}, {pkmStatusData.kabupaten}, {pkmStatusData.provinsi}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <ActionFeedbackDialog
                        show={feedbackDialog.show}
                        type={feedbackDialog.type}
                        title={feedbackDialog.title}
                        message={feedbackDialog.message}
                        onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })}
                    />
                </div>
            );
        }

        return (
            <div className="chart-card public-access-card" style={{ overflow: 'visible' }}>
                <div className="chart-card-header public-access-card-header" style={{ paddingBottom: '14px' }}>
                    <div className="chart-card-icon public-access-card-icon">
                        <i className="fa-solid fa-file-signature"></i>
                    </div>
                    <div>
                        <h3 className="chart-card-title">Akses Pengajuan PKM</h3>
                        <p className="chart-card-subtitle">Informasi status terbaru pengajuan PKM Anda</p>
                    </div>
                </div>

                {renderMainTabNav()}

                {mainTab === 'arsip' ? (
                    renderArchiveTab()
                ) : (
                    <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '18px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '100%',
                                textAlign: 'center',
                                padding: '24px 0 8px',
                            }}
                        >
                            <div
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '22px',
                                    backgroundColor: currentStatusCard.iconBg,
                                    color: currentStatusCard.iconColor,
                                    fontSize: '1.6rem',
                                    boxShadow: '0 18px 36px -28px rgba(15, 23, 42, 0.35)',
                                }}
                            >
                                <i className={`fa-solid ${currentStatusCard.icon}`}></i>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '540px' }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
                                    {currentStatusCard.title}
                                </h4>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.96rem', lineHeight: 1.7 }}>
                                    {currentStatusCard.message}
                                </p>
                            </div>

                            {isRevisionMode && (
                                <div style={{ width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <input
                                        ref={revisionInputRef}
                                        type="file"
                                        className="file-upload-input"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(event) => handleUploadRevision(event.target.files?.[0] ?? null)}
                                    />

                                    <button
                                        type="button"
                                        className={`btn-modal-submit ${revisionProcessing ? 'btn-loading' : ''}`}
                                        onClick={() => revisionInputRef.current?.click()}
                                        disabled={revisionProcessing}
                                        style={{ width: '100%', borderRadius: '12px' }}
                                    >
                                        Unggah Dokumen Revisi <i className="fa-solid fa-upload"></i>
                                    </button>
                                </div>
                            )}

                            {isRejectedMode && (
                                <button
                                    type="button"
                                    className="btn-modal-submit"
                                    onClick={handleCreateNewSubmission}
                                    style={{ width: '100%', maxWidth: '360px', borderRadius: '12px' }}
                                >
                                    Buat Pengajuan Baru <i className="fa-solid fa-rotate-right"></i>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <ActionFeedbackDialog
                    show={feedbackDialog.show}
                    type={feedbackDialog.type}
                    title={feedbackDialog.title}
                    message={feedbackDialog.message}
                    onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })}
                />
            </div>
        );
    }

    return (
        <div className="chart-card public-access-card" style={{ overflow: 'visible' }}>
            <div className="chart-card-header public-access-card-header" style={{ paddingBottom: '14px' }}>
                <div className="chart-card-icon public-access-card-icon">
                    <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                    <h3 className="chart-card-title">Akses Pengajuan PKM</h3>
                    <p className="chart-card-subtitle">Tampilan mengikuti akun dosen, isi form memakai format masyarakat</p>
                </div>
            </div>

            {renderMainTabNav()}

            {mainTab === 'arsip' ? renderArchiveTab() : renderSubmissionTab()}

            <ActionFeedbackDialog
                show={feedbackDialog.show}
                type={feedbackDialog.type}
                title={feedbackDialog.title}
                message={feedbackDialog.message}
                onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })}
            />
        </div>
    );
}