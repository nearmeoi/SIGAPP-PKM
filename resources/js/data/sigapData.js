const SIGAP_DEMO_DATA_ENABLED = import.meta.env.VITE_ENABLE_SIGAP_DEMO_DATA !== 'false';

const demoPkmRecords = [
    {
        id: 1,
        nama: 'Pemberdayaan UMKM Kripik Pisang',
        tahun: 2025,
        status: 'selesai',
        deskripsi: 'Program pendampingan pemasaran digital dan perbaikan kemasan untuk industri rumah tangga kripik pisang di wilayah Tamalanrea.',
        thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        laporan: '',
        dokumentasi: 'https://drive.google.com/',
        provinsi: 'Sulawesi Selatan',
        kabupaten: 'Makassar',
        kecamatan: 'Tamalanrea',
        desa: 'Bira',
        lat: -5.135,
        lng: 119.495,
    },
    {
        id: 2,
        nama: 'Edukasi Sanitasi Lingkungan',
        tahun: 2026,
        status: 'berlangsung',
        deskripsi: 'Penyuluhan mengenai pentingnya memilah sampah organik dan non-organik serta pembuatan bank sampah mandiri tingkat RW.',
        thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
        laporan: '',
        dokumentasi: '',
        provinsi: 'Sulawesi Selatan',
        kabupaten: 'Makassar',
        kecamatan: 'Tamalanrea',
        desa: 'Tamalanrea Indah',
        lat: -5.13,
        lng: 119.485,
    },
];

const demoSubmissionHistoryByRole = {
    dosen: [
        {
            id: 'history-accepted',
            judul: 'PKM Literasi Digital Pelaku UMKM',
            tanggal: '14 Feb 2026',
            status: 'diterima',
            ringkasan: 'Pengajuan dinyatakan lengkap dan lolos ke tahap pelaksanaan setelah review akhir tim P3M.',
            catatan: 'Dokumen proposal, RAB, dan susunan tim dinilai telah sesuai.',
        },
        {
            id: 'history-suspended',
            judul: 'PKM Pelatihan Hygiene Kuliner',
            tanggal: '28 Jan 2026',
            status: 'ditangguhkan',
            ringkasan: 'Pengajuan perlu revisi pada bagian luaran kegiatan dan penyesuaian jadwal pelaksanaan.',
            catatan: 'Perlu unggah ulang dokumen proposal revisi sebelum diproses kembali.',
        },
        {
            id: 'history-rejected',
            judul: 'PKM Penguatan Branding Desa Wisata',
            tanggal: '07 Des 2025',
            status: 'ditolak',
            ringkasan: 'Pengajuan belum dapat dilanjutkan karena ruang lingkup program belum selaras dengan skema yang tersedia.',
            catatan: 'Disarankan menyiapkan proposal baru dengan fokus kegiatan yang lebih spesifik.',
        },
    ],
    masyarakat: [
        {
            id: 'history-accepted',
            judul: 'PKM Literasi Digital Pelaku UMKM',
            tanggal: '14 Feb 2026',
            status: 'diterima',
            ringkasan: 'Pengajuan dinyatakan lengkap dan lolos ke tahap pelaksanaan setelah review akhir tim P3M.',
            catatan: 'Dokumen pengantar dan kebutuhan kegiatan dinilai telah sesuai.',
        },
        {
            id: 'history-suspended',
            judul: 'PKM Pelatihan Hygiene Kuliner',
            tanggal: '28 Jan 2026',
            status: 'ditangguhkan',
            ringkasan: 'Pengajuan perlu revisi pada penjelasan kebutuhan kegiatan dan penyesuaian jadwal pelaksanaan.',
            catatan: 'Lengkapi detail kebutuhan dan unggah ulang dokumen pendukung sebelum diproses kembali.',
        },
        {
            id: 'history-rejected',
            judul: 'PKM Penguatan Branding Desa Wisata',
            tanggal: '07 Des 2025',
            status: 'ditolak',
            ringkasan: 'Pengajuan belum dapat dilanjutkan karena ruang lingkup program belum selaras dengan skema yang tersedia.',
            catatan: 'Disarankan menyiapkan pengajuan baru dengan fokus kegiatan yang lebih spesifik.',
        },
    ],
};

const previewSummaryByRole = {
    dosen: 'Pratinjau status pengajuan untuk halaman akun dosen.',
    masyarakat: 'Pratinjau status pengajuan untuk halaman akun masyarakat.',
};

const cloneData = (value) => JSON.parse(JSON.stringify(value));

const resolveCollection = (serverData, demoData) => {
    if (Array.isArray(serverData)) {
        return cloneData(serverData);
    }

    if (!SIGAP_DEMO_DATA_ENABLED) {
        return [];
    }

    return cloneData(demoData);
};

const getPreviewStatusFromLocation = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return new URLSearchParams(window.location.search).get('preview_status');
};

export const resolvePublicPkmData = (serverData) => resolveCollection(serverData, demoPkmRecords);

export const resolveUserPkmData = (serverData) => resolveCollection(serverData, demoPkmRecords);

export const resolveUserSubmissionHistory = (serverData, role = 'dosen') => (
    resolveCollection(serverData, demoSubmissionHistoryByRole[role] ?? [])
);

export const resolveUserSubmissionData = (serverData, { role = 'dosen', previewStatus } = {}) => {
    if (Array.isArray(serverData)) {
        return cloneData(serverData);
    }

    if (!SIGAP_DEMO_DATA_ENABLED) {
        return [];
    }

    const activePreviewStatus = previewStatus ?? getPreviewStatusFromLocation();
    const allowedStatuses = ['diproses', 'ditangguhkan', 'ditolak', 'diterima', 'berlangsung', 'selesai'];

    if (!activePreviewStatus || activePreviewStatus === 'belum_diajukan' || !allowedStatuses.includes(activePreviewStatus)) {
        return [];
    }

    return [{
        id: `demo-${role}-${activePreviewStatus}`,
        judul: 'Demo Status Pengajuan PKM',
        ringkasan: previewSummaryByRole[role] ?? previewSummaryByRole.dosen,
        tanggal: '28 Mar 2026',
        status: activePreviewStatus,
    }];
};

export { SIGAP_DEMO_DATA_ENABLED };
