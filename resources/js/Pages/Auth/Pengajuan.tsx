import React, { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/DefaultLayout';
import DosenSubmissionCard from '@/Components/DosenSubmissionCard';
import MasyarakatSubmissionCard from '@/Components/MasyarakatSubmissionCard';
import {
    resolveUserPkmData,
    resolveUserSubmissionData,
    resolveUserSubmissionHistory,
} from '@/data/sigapData';
import { PkmData } from '@/types';
import '../../../css/landing.css';
import '../../../css/lecturer-form.css';

const createPengajuanDateLabel = (): string => (
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date())
);

interface PengajuanData {
    id: number;
    judul: string;
    ringkasan: string;
    tanggal: string;
    status: string;
}

interface PengajuanProps {
    role?: string;
    initialView?: string;
    userPkmData?: PkmData[] | null;
    userSubmissionData?: PengajuanData[] | null;
    userSubmissionHistory?: PengajuanData[] | null;
}

interface SubmissionData extends PengajuanData {
    status: string;
}

export default function Pengajuan({
    role = 'masyarakat',
    initialView = 'form',
    userPkmData = null,
    userSubmissionData = null,
    userSubmissionHistory = null,
}: PengajuanProps): JSX.Element {
    const resolvedRole = role === 'dosen' ? 'dosen' : 'masyarakat';
    const [pengajuanData, setPengajuanData] = useState<SubmissionData[]>(() => (
        resolveUserSubmissionData(userSubmissionData, { role: resolvedRole })
    ));
    const [submissionHistoryData] = useState<PengajuanData[]>(() => (
        resolveUserSubmissionHistory(userSubmissionHistory, resolvedRole)
    ));
    const [pkmData] = useState<PkmData[]>(() => resolveUserPkmData(userPkmData));
    const [activeView, setActiveView] = useState<'form' | 'status'>(() => (
        initialView === 'status' && resolveUserSubmissionData(userSubmissionData, { role: resolvedRole }).length === 0
            ? 'form'
            : initialView
    ));

    const latestPengajuan = pengajuanData[0] ?? null;
    const hasSubmitted = pengajuanData.length > 0;
    const currentSubmissionStatus = latestPengajuan?.status ?? 'belum_diajukan';
    const currentPkmStatusData = ['berlangsung', 'selesai'].includes(currentSubmissionStatus)
        ? pkmData.find((item) => item.status === currentSubmissionStatus) ?? null
        : null;
    const mergedSubmissionHistory = useMemo(() => [...pengajuanData, ...submissionHistoryData], [pengajuanData, submissionHistoryData]);

    useEffect(() => {
        setActiveView(initialView === 'status' && !hasSubmitted ? 'form' : initialView);
    }, [hasSubmitted, initialView]);

    const handleSubmitted = (submission: SubmissionData) => {
        setPengajuanData((previous) => [submission, ...previous]);
        setActiveView('status');
    };

    const handleUpdateLatestPengajuanStatus = (nextStatus: string) => {
        if (nextStatus === 'belum_diajukan') {
            setActiveView('form');
            return;
        }

        setPengajuanData((previous) => {
            if (previous.length === 0) {
                return [{
                    id: Date.now(),
                    judul: resolvedRole === 'dosen' ? 'Pengajuan PKM' : 'Pengajuan PKM Masyarakat',
                    ringkasan: resolvedRole === 'dosen'
                        ? 'Status diperbarui dari halaman pengajuan dosen.'
                        : 'Status diperbarui dari halaman pengajuan masyarakat.',
                    tanggal: createPengajuanDateLabel(),
                    status: nextStatus,
                }];
            }

            return previous.map((item, index) => (
                index === 0
                    ? { ...item, status: nextStatus, tanggal: createPengajuanDateLabel() }
                    : item
            ));
        });

        if (nextStatus !== 'belum_diajukan') {
            setActiveView('status');
        }
    };

    const sharedCardProps = {
        pkmListData: pkmData,
        pkmStatusData: currentPkmStatusData,
        submissionHistory: mergedSubmissionHistory,
        onSubmitted: handleSubmitted,
        onUpdateSubmissionStatus: handleUpdateLatestPengajuanStatus,
    };

    const pageTitle = activeView === 'status'
        ? `Cek Status Pengajuan ${resolvedRole === 'dosen' ? 'Dosen' : 'Masyarakat'}`
        : `Pengajuan PKM ${resolvedRole === 'dosen' ? 'Dosen' : 'Masyarakat'}`;

    return (
        <Layout
            mainClassName="site-main-content site-main-content--landing-balanced"
            mainStyle={{ flex: '0 0 auto' }}
        >
            <Head title={pageTitle} />

            <div className="landing-page login-dosen-page">
                <div style={{ maxWidth: '880px', margin: '0 auto', padding: '32px 12px 40px', width: '100%', boxSizing: 'border-box' }}>
                    {resolvedRole === 'dosen' ? (
                        activeView === 'status' && hasSubmitted ? (
                            <DosenSubmissionCard
                                {...sharedCardProps}
                                submissionStatus={currentSubmissionStatus}
                                hideMainTabNav
                            />
                        ) : (
                            <DosenSubmissionCard
                                {...sharedCardProps}
                                submissionStatus="belum_diajukan"
                                hideMainTabNav
                            />
                        )
                    ) : (
                        activeView === 'status' && hasSubmitted ? (
                            <MasyarakatSubmissionCard
                                {...sharedCardProps}
                                submissionStatus={currentSubmissionStatus}
                                latestSubmission={latestPengajuan}
                                hideInlineStatusPanel
                                hideMainTabNav
                            />
                        ) : (
                            <MasyarakatSubmissionCard
                                {...sharedCardProps}
                                submissionStatus="belum_diajukan"
                                latestSubmission={latestPengajuan}
                                hideInlineStatusPanel
                                hideMainTabNav
                            />
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
}
