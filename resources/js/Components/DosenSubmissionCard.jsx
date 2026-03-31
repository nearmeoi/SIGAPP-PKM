import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';

const createSubmittedLabel = () => (
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date())
);

const getFilledTeamMembers = (members = []) => members.filter((member) => member.trim());
const teamValidationDefinitions = [
    { enabledKey: 'sertakan_dosen_terlibat', type: 'dosen_terlibat', title: 'Dosen Terlibat' },
    { enabledKey: 'sertakan_staff_terlibat', type: 'staff_terlibat', title: 'Staf Terlibat' },
    { enabledKey: 'sertakan_mahasiswa_terlibat', type: 'mahasiswa_terlibat', title: 'Mahasiswa Terlibat' },
];
const getTeamEntryValidationMessage = (title) => `Lengkapi semua nama pada bagian ${title.toLowerCase()}. Silakan hapus entri tambahan jika memang tidak ada tambahan lagi.`;
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

export default function DosenSubmissionCard({
    onSubmitted,
    submissionStatus = 'belum_diajukan',
    onUpdateSubmissionStatus,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    hideMainTabNav = false,
}) {
    const { data, setData, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm({
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
    const [feedbackDialog, setFeedbackDialog] = useState({ show: false, type: 'success', title: '', message: '' });
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({
        kegiatan: false,
        riwayat: false,
    });
    const [expandedActivityId, setExpandedActivityId] = useState(() => pkmListData[0]?.id ?? null);
    const [expandedHistoryId, setExpandedHistoryId] = useState(() => submissionHistory[0]?.id ?? null);
    const revisionInputRef = useRef(null);

    const handleAddPersonil = (type) => {
        setData(type, [...data[type], '']);
    };

    const handleRemovePersonil = (type, indexToRemove) => {
        const filtered = data[type].filter((_, index) => index !== indexToRemove);
        setData(type, filtered);
        clearErrors(type);
    };

    const handlePersonilChange = (type, index, value) => {
        const updated = [...data[type]];
        updated[index] = value;
        setData(type, updated);
        clearErrors(type, 'team_selection');
    };

    const handleTogglePersonilSection = (enabledKey, type, checked) => {
        setData(enabledKey, checked);

        if (checked && data[type].length === 0) {
            setData(type, ['']);
        }

        if (!checked) {
            clearErrors(type, 'team_selection');
        }
    };

    const requiredSubmissionIssues = [];

    if (!data.judul_proyek.trim()) {
        requiredSubmissionIssues.push('Judul proyek PKM wajib diisi sebelum pengajuan dapat dikirim.');
    }
    if (!data.nama_dosen.trim()) {
        requiredSubmissionIssues.push('Nama ketua kelompok wajib diisi.');
    }
    if (!data.lokasi.trim()) {
        requiredSubmissionIssues.push('Lokasi pengabdian wajib diisi.');
    }
    if (!teamValidationDefinitions.some((section) => data[section.enabledKey])) {
        requiredSubmissionIssues.push('Pilih minimal satu kategori tim pelaksana: dosen, staf, atau mahasiswa.');
    }
    teamValidationDefinitions.forEach((section) => {
        if (data[section.enabledKey] && data[section.type].some((member) => !member.trim())) {
            requiredSubmissionIssues.push(getTeamEntryValidationMessage(section.title));
        }
    });
    if (!data.sumber_dana) {
        requiredSubmissionIssues.push('Sumber dana wajib dipilih.');
    }
    if (!String(data.total_RAB).trim()) {
        requiredSubmissionIssues.push('Total anggaran wajib diisi.');
    }
    if (!data.tanggal_mulai) {
        requiredSubmissionIssues.push('Tanggal mulai wajib diisi.');
    }
    if (!data.tanggal_selesai) {
        requiredSubmissionIssues.push('Tanggal selesai wajib diisi.');
    }
    if (!data.proposal) {
        requiredSubmissionIssues.push('File proposal wajib diunggah sebelum pengajuan dikirim.');
    }
    const hasStartedSubmission = Boolean(
        data.judul_proyek.trim() ||
        data.nama_dosen.trim() ||
        data.lokasi.trim() ||
        data.sumber_dana ||
        String(data.total_RAB).trim() ||
        data.tanggal_mulai ||
        data.tanggal_selesai ||
        data.proposal ||
        teamValidationDefinitions.some((section) => data[section.enabledKey])
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        clearErrors();

        let hasErrors = false;
        if (!data.judul_proyek.trim()) {
            setError('judul_proyek', 'Judul proyek wajib diisi');
            hasErrors = true;
        }
        if (!data.nama_dosen.trim()) {
            setError('nama_dosen', 'Ketua kelompok wajib diisi');
            hasErrors = true;
        }
        if (!data.lokasi.trim()) {
            setError('lokasi', 'Lokasi pengabdian wajib diisi');
            hasErrors = true;
        }
        if (!teamValidationDefinitions.some((section) => data[section.enabledKey])) {
            setError('team_selection', 'Pilih minimal salah satu kategori tim pelaksana sebelum mengirim pengajuan.');
            hasErrors = true;
        }
        teamValidationDefinitions.forEach((section) => {
            if (data[section.enabledKey] && data[section.type].some((member) => !member.trim())) {
                setError(section.type, getTeamEntryValidationMessage(section.title));
                hasErrors = true;
            }
        });
        if (!data.sumber_dana) {
            setError('sumber_dana', 'Sumber dana wajib dipilih.');
            hasErrors = true;
        }
        if (!String(data.total_RAB).trim()) {
            setError('total_RAB', 'Total anggaran wajib diisi.');
            hasErrors = true;
        }
        if (!data.tanggal_mulai) {
            setError('tanggal_mulai', 'Tanggal mulai wajib diisi.');
            hasErrors = true;
        }
        if (!data.tanggal_selesai) {
            setError('tanggal_selesai', 'Tanggal selesai wajib diisi.');
            hasErrors = true;
        }
        if (!data.proposal) {
            setError('proposal', 'Proposal wajib diunggah dalam format PDF.');
            hasErrors = true;
        }

        if (hasErrors) {
            setFeedbackDialog({
                show: true,
                type: 'error',
                title: 'Form Belum Siap Dikirim',
                message: 'Masih ada data wajib yang belum lengkap. Silakan lengkapi bagian yang ditandai terlebih dahulu.',
            });
            return;
        }

        setMockProcessing(true);

        window.setTimeout(() => {
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
            setFeedbackDialog({
                show: true,
                type: 'success',
                title: 'Pengajuan Berhasil Dikirim',
                message: 'Data pengajuan PKM Anda sudah tersimpan dan siap masuk ke tahap peninjauan berikutnya.',
            });
            window.setTimeout(() => {
                reset();
            }, 300);
        }, 1200);
    };

    const isProcessing = inertiaProcessing || mockProcessing;
    const isSubmitDisabled = isProcessing || requiredSubmissionIssues.length > 0;
    const teamSections = [
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
            message: 'Silakan perbarui dokumen sesuai catatan revisi, lalu unggah kembali agar pengajuan dapat kami proses ulang.',
        },
        ditolak: {
            icon: 'fa-circle-xmark',
            iconBg: '#fee2e2',
            iconColor: '#b91c1c',
            title: 'Maaf, pengajuan PKM Anda belum dapat kami terima.',
            message: 'Anda dapat menyiapkan dokumen yang baru atau diperbarui, lalu mengajukan kembali saat sudah siap.',
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
                message: 'Dokumen revisi sudah berhasil diunggah dan status pengajuan kembali masuk ke tahap diproses.',
            });
        }, 1000);
    };

    const handleCreateNewSubmission = () => {
        reset();
        clearErrors();
        if (revisionInputRef.current) {
            revisionInputRef.current.value = '';
        }
        onUpdateSubmissionStatus?.('belum_diajukan');
        setFeedbackDialog({
            show: true,
            type: 'success',
            title: 'Siap Mengajukan Ulang',
            message: 'Form pengajuan baru sudah dibuka kembali dan siap Anda lengkapi dari awal.',
        });
    };

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
                        <small>Form aktif dan status berjalan</small>
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

    const renderSubmissionHub = () => (
        <div className="submission-hub-shell">
            <div className="submission-hub-centered">
                <div className="submission-hub-overview">
                    <span className="submission-hub-overview-icon">
                        <i className="fa-solid fa-table-list"></i>
                    </span>
                    <div>
                        <h4>Daftar Kegiatan dan Riwayat Pengajuan</h4>
                        <p>Bagian ini menampilkan arsip kegiatan PKM yang tersimpan serta contoh histori pengajuan di akun dosen.</p>
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
                                <p>Daftar ini mengambil titik PKM yang sudah tersedia pada developer map.</p>
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
                                <p>Pratinjau riwayat pengajuan untuk membantu menyiapkan pengalaman pengguna di akun dosen.</p>
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
                                                    <span><i className="fa-solid fa-clipboard-list"></i> {historyItem.catatan}</span>
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
    );

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

                    {!hideMainTabNav && renderMainTabNav()}

                    {!hideMainTabNav && mainTab === 'arsip' ? (
                        <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                            {renderSubmissionHub()}
                        </div>
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

                    {!hideMainTabNav && renderMainTabNav()}

                    {!hideMainTabNav && mainTab === 'arsip' ? (
                        <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                            {renderSubmissionHub()}
                        </div>
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
                    <p className="chart-card-subtitle">Formulir pengajuan proyek pengabdian masyarakat untuk dosen</p>
                </div>
            </div>

            {!hideMainTabNav && renderMainTabNav()}

            {!hideMainTabNav && mainTab === 'arsip' ? (
                <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                    {renderSubmissionHub()}
                </div>
            ) : (
            <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                            <i className="fa-solid fa-folder-open text-blue"></i> Detail Proyek
                        </h3>
                        <div className="form-grid">
                            <div className={`form-group full-width ${errors.judul_proyek ? 'has-error' : ''}`}>
                                <label>Judul Proyek PKM <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Masukkan judul pengabdian..."
                                    value={data.judul_proyek}
                                    onChange={(event) => setData('judul_proyek', event.target.value)}
                                />
                                {errors.judul_proyek && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.judul_proyek}</span>}
                            </div>

                            <div className={`form-group ${errors.nama_dosen ? 'has-error' : ''}`}>
                                <label>Ketua Kelompok <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Nama lengkap dan gelar..."
                                    value={data.nama_dosen}
                                    onChange={(event) => setData('nama_dosen', event.target.value)}
                                />
                                {errors.nama_dosen && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.nama_dosen}</span>}
                            </div>

                            <div className={`form-group ${errors.lokasi ? 'has-error' : ''}`}>
                                <label>Lokasi Pengabdian <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Desa, Kecamatan, Kota..."
                                    value={data.lokasi}
                                    onChange={(event) => setData('lokasi', event.target.value)}
                                />
                                {errors.lokasi && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.lokasi}</span>}
                            </div>
                        </div>
                    </div>

                    <hr className="form-divider" style={{ margin: '4px 0' }} />

                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <div className="form-section-header-flex" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 className="form-section-title mb-0" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, fontSize: '15px' }}>
                                <i className="fa-solid fa-users text-blue"></i> Tim Pelaksana
                            </h3>
                        </div>
                        <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', lineHeight: '1.6', color: '#64748b' }}>
                            Ketua kelompok tidak perlu diinput ulang. Centang hanya kategori anggota yang memang ikut dalam pelaksanaan.
                        </p>

                        {errors.team_selection && (
                            <span className="form-error-message" style={{ marginBottom: '16px' }}>
                                <i className="fa-solid fa-circle-exclamation"></i> {errors.team_selection}
                            </span>
                        )}

                        {teamSections.map((section, sectionIndex) => {
                            const isEnabled = data[section.enabledKey];

                            return (
                                <div
                                    key={section.type}
                                    className="team-sub-section"
                                    style={{
                                        padding: '16px',
                                        backgroundColor: section.sectionBg,
                                        borderRadius: '12px',
                                        border: `1px solid ${section.sectionBorder}`,
                                        marginBottom: sectionIndex === teamSections.length - 1 ? '0' : '16px',
                                        opacity: isEnabled ? 1 : 0.82,
                                    }}
                                >
                                    <div className="form-section-header-flex" style={{ marginBottom: isEnabled ? '16px' : '10px', borderBottom: 'none', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isEnabled}
                                                    onChange={(event) => handleTogglePersonilSection(section.enabledKey, section.type, event.target.checked)}
                                                    style={{ width: '16px', height: '16px', accentColor: section.iconColor, cursor: 'pointer' }}
                                                />
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: section.iconBg, color: section.iconColor, borderRadius: '8px', fontSize: '12px' }}>
                                                    <i className={`fa-solid ${section.icon}`}></i>
                                                </span>
                                                <span style={{ fontSize: '13.5px', fontWeight: '700', color: section.titleColor }}>
                                                    {section.title}
                                                </span>
                                            </label>
                                        </div>

                                        {isEnabled && (
                                            <button
                                                type="button"
                                                className="btn-add-dynamic"
                                                onClick={() => handleAddPersonil(section.type)}
                                                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', color: section.buttonColor, backgroundColor: section.buttonBg }}
                                            >
                                                <i className="fa-solid fa-plus"></i> Tambah
                                            </button>
                                        )}
                                    </div>

                                    {!isEnabled && (
                                        <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.6', color: '#64748b' }}>
                                            {section.note}
                                        </p>
                                    )}

                                    {isEnabled && (
                                        <div className="dynamic-array-container">
                                            {data[section.type].map((personil, index) => (
                                                <div key={index} className="dynamic-array-row" style={{ marginBottom: '12px' }}>
                                                    <div className="dynamic-input-wrapper">
                                                        <span className="dynamic-numbering" style={{ backgroundColor: section.iconBg, color: section.iconColor }}>
                                                            {index + 1}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="fintech-input"
                                                            placeholder={`${section.placeholder} ${index + 1}`}
                                                            value={personil}
                                                            onChange={(event) => handlePersonilChange(section.type, index, event.target.value)}
                                                        />
                                                    </div>
                                                    {data[section.type].length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn-remove-dynamic"
                                                            onClick={() => handleRemovePersonil(section.type, index)}
                                                        >
                                                            <i className="fa-regular fa-trash-can"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {errors[section.type] && (
                                                <span className="form-error-message">
                                                    <i className="fa-solid fa-circle-exclamation"></i> {errors[section.type]}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <hr className="form-divider" style={{ margin: '4px 0' }} />

                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                            <i className="fa-solid fa-wallet text-blue"></i> Pendanaan & Jadwal
                        </h3>
                        <div className="form-grid">
                            <div className={`form-group ${errors.sumber_dana ? 'has-error' : ''}`}>
                                <label>Sumber Dana</label>
                                <select
                                    className="fintech-input"
                                    value={data.sumber_dana}
                                    onChange={(event) => {
                                        setData('sumber_dana', event.target.value);
                                        clearErrors('sumber_dana');
                                    }}
                                    required
                                >
                                    <option value="" disabled>Pilih Sumber Dana</option>
                                    <option value="DIPA Poltekpar">DIPA Poltekpar</option>
                                    <option value="Mandiri">Mandiri / Pribadi</option>
                                    <option value="Sponsor Luar">Sponsor Eksternal</option>
                                </select>
                                {errors.sumber_dana && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.sumber_dana}</span>}
                            </div>

                            <div className={`form-group ${errors.total_RAB ? 'has-error' : ''}`}>
                                <label>Total Anggaran (RAB)</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">Rp</span>
                                    <input
                                        type="number"
                                        className="fintech-input"
                                        placeholder="0"
                                        value={data.total_RAB}
                                        onChange={(event) => {
                                            setData('total_RAB', event.target.value);
                                            clearErrors('total_RAB');
                                        }}
                                        required
                                    />
                                </div>
                                {errors.total_RAB && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.total_RAB}</span>}
                            </div>

                            <div className={`form-group ${errors.tanggal_mulai ? 'has-error' : ''}`}>
                                <label>Tanggal Mulai</label>
                                <input
                                    type="date"
                                    className="fintech-input input-date"
                                    value={data.tanggal_mulai}
                                    onChange={(event) => {
                                        setData('tanggal_mulai', event.target.value);
                                        clearErrors('tanggal_mulai');
                                    }}
                                    required
                                />
                                {errors.tanggal_mulai && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.tanggal_mulai}</span>}
                            </div>

                            <div className={`form-group ${errors.tanggal_selesai ? 'has-error' : ''}`}>
                                <label>Tanggal Selesai</label>
                                <input
                                    type="date"
                                    className="fintech-input input-date"
                                    value={data.tanggal_selesai}
                                    onChange={(event) => {
                                        setData('tanggal_selesai', event.target.value);
                                        clearErrors('tanggal_selesai');
                                    }}
                                    required
                                />
                                {errors.tanggal_selesai && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.tanggal_selesai}</span>}
                            </div>

                            <div className={`form-group full-width ${errors.proposal ? 'has-error' : ''}`}>
                                <label>Unggah Proposal (PDF)</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="proposal_inline"
                                        className="file-upload-input"
                                        accept=".pdf"
                                        onChange={(event) => {
                                            setData('proposal', event.target.files[0]);
                                            clearErrors('proposal');
                                        }}
                                    />
                                    <label htmlFor="proposal_inline" className={`file-upload-trigger ${data.proposal ? 'has-file' : ''}`}>
                                        <span className="file-upload-icon-shell">
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                        </span>
                                        <span className="file-upload-copy">
                                            <span className="file-upload-title">
                                                {data.proposal ? 'Proposal Berhasil Dipilih' : 'Pilih File Proposal'}
                                            </span>
                                            <span className="file-name">
                                                {data.proposal ? data.proposal.name : 'Unggah dokumen proposal PKM dalam format PDF'}
                                            </span>
                                        </span>
                                    </label>
                                </div>
                                {errors.proposal && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.proposal}</span>}
                            </div>
                        </div>
                    </div>

                    {hasStartedSubmission && requiredSubmissionIssues.length > 0 && (
                        <div className="form-validation-alert">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <div>
                                <strong>Form belum bisa dikirim</strong>
                                <p>{requiredSubmissionIssues[0]}</p>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button type="submit" className={`btn-modal-submit ${isProcessing ? 'btn-loading' : ''}`} style={{ width: '100%', borderRadius: '12px' }} disabled={isSubmitDisabled}>
                            Kirim Pengajuan <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
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
