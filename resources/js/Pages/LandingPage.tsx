import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/DefaultLayout';
import CTABanner from '@/Components/CTABanner';
import PkmMapDashboardCard from '@/Components/PkmMapDashboardCard';
import { resolvePublicPkmData } from '@/data/sigapData';
import { PkmData } from '@/types';
import '../../css/landing.css';

interface LandingPageProps {
    pkmData?: PkmData[] | null;
    publicPkmData?: PkmData[] | null;
}

export default function LandingPage({
    pkmData: serverPkmData = null,
    publicPkmData = null,
}: LandingPageProps) {
    const [pkmData] = useState<PkmData[]>(() => resolvePublicPkmData(publicPkmData ?? serverPkmData));

    return (
        <Layout mainClassName="site-main-content" mainStyle={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Head title="Geospatial PKM Dashboard" />
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col py-8">
                <PkmMapDashboardCard pkmData={pkmData} watchKey="landing-map" />
                <CTABanner />
            </div>
        </Layout>
    );
}
