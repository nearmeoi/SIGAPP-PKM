import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/DefaultLayout';
import DosenSubmissionCard from '@/Components/DosenSubmissionCard';
import MasyarakatSubmissionCard from '@/Components/MasyarakatSubmissionCard';
import '../../../css/landing.css';
import '../../../css/lecturer-form.css';

/** Tipe pengajuan yang datang dari backend (tabel `pengajuan`) */
export interface PengajuanRecord {
    id: number;                 // id_pengajuan
    judul: string;              // judul_kegiatan
    ringkasan: string;          // kebutuhan / instansi_mitra
    tanggal: string;            // created_at formatted
    status: string;             // status_pengajuan
    catatan?: string;           // catatan_admin
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
    nama_pengusul?: string;
    email_pengusul?: string;
    kebutuhan?: string;
    tim_kegiatan?: { nama: string; peran: string }[];
}

interface PengajuanProps {
    role?: string;
    initialView?: string;
    /** Daftar pengajuan milik user yang login, dikirim dari server */
    userSubmissions?: PengajuanRecord[] | null;
}

export default function Pengajuan({
    role = 'masyarakat',
    initialView = 'form',
    userSubmissions = null,
}: PengajuanProps) {
    const resolvedRole = role === 'dosen' ? 'dosen' : 'masyarakat';

    // Data pengajuan user — diinisialisasi dari props server
    const [submissions, setSubmissions] = useState<PengajuanRecord[]>(
        () => userSubmissions ?? []
    );

    const [activeView, setActiveView] = useState<'form' | 'status'>(
        initialView as 'form' | 'status'
    );

    // Sync activeView apabila server mengirim initialView berbeda (navigasi back/forward)
    useEffect(() => {
        setActiveView(initialView as 'form' | 'status');
    }, [initialView]);

    const latestSubmission = submissions[0] ?? null;
    const currentStatus = latestSubmission?.status ?? 'belum_diajukan';

    /** Callback setelah form dikirim — bisa optimistic-update atau cukup flip view */
    const handleSubmitted = (newRecord: PengajuanRecord) => {
        setSubmissions((prev) => [newRecord, ...prev]);
        setActiveView('status');
    };

    /** Callback saat status berubah (misal: buat pengajuan baru setelah ditolak) */
    const handleUpdateStatus = (nextStatus: string) => {
        if (nextStatus === 'belum_diajukan') {
            setActiveView('form');
            return;
        }
        setActiveView('status');
    };

    const pageTitle =
        activeView === 'status'
            ? `Cek Status Pengajuan ${resolvedRole === 'dosen' ? 'Dosen' : 'Masyarakat'}`
            : `Pengajuan PKM ${resolvedRole === 'dosen' ? 'Dosen' : 'Masyarakat'}`;

    return (
        <Layout
            mainClassName="site-main-content site-main-content--landing-balanced"
            mainStyle={{ flex: '0 0 auto' }}
        >
            <Head title={pageTitle} />

            <div className="landing-page login-dosen-page">
                <div
                    style={{
                        maxWidth: activeView === 'status' ? '1000px' : '880px',
                        margin: '0 auto',
                        padding: '32px 12px 40px',
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    {resolvedRole === 'dosen' ? (
                        <DosenSubmissionCard
                            submissionStatus={
                                activeView === 'status' ? currentStatus : 'belum_diajukan'
                            }
                            submissionHistory={submissions}
                            onSubmitted={handleSubmitted}
                            onUpdateSubmissionStatus={handleUpdateStatus}
                            onlyShowStatus={activeView === 'status'}
                            hideMainTabNav
                        />
                    ) : (
                        <MasyarakatSubmissionCard
                            submissionStatus={
                                activeView === 'status' ? currentStatus : 'belum_diajukan'
                            }
                            latestSubmission={latestSubmission}
                            submissionHistory={submissions}
                            onSubmitted={handleSubmitted}
                            onUpdateSubmissionStatus={handleUpdateStatus}
                            onlyShowStatus={activeView === 'status'}
                            hideInlineStatusPanel
                            hideMainTabNav
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
}
