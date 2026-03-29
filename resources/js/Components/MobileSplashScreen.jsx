import React, { useEffect, useState } from 'react';
import '../../css/mobile-splash.css';

const SPLASH_SESSION_KEY = 'sigap-pkm-mobile-splash-seen';
const POLTEKPAR_LOGO_URL = 'https://p3m.poltekparmakassar.ac.id/storage/2025/10/cropped-Screenshot_2024-01-15_101923-removebg-preview.png';

export default function MobileSplashScreen() {
    const [phase, setPhase] = useState('hidden');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const hasSeenSplash = window.sessionStorage.getItem(SPLASH_SESSION_KEY) === '1';
        if (hasSeenSplash) {
            return undefined;
        }

        window.sessionStorage.setItem(SPLASH_SESSION_KEY, '1');
        setPhase('visible');

        const fadeTimer = window.setTimeout(() => {
            setPhase('closing');
        }, 1850);

        const removeTimer = window.setTimeout(() => {
            setPhase('hidden');
        }, 2280);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(removeTimer);
        };
    }, []);

    if (phase === 'hidden') {
        return null;
    }

    return (
        <div className={`mobile-splash-screen ${phase === 'closing' ? 'is-closing' : 'is-visible'}`} aria-hidden="true">
            <div className="mobile-splash-backdrop"></div>
            <div className="mobile-splash-orb orb-left"></div>
            <div className="mobile-splash-orb orb-right"></div>

            <div className="mobile-splash-card">
                <div className="mobile-splash-logo-shell">
                    <span className="mobile-splash-logo-ring ring-one"></span>
                    <span className="mobile-splash-logo-ring ring-two"></span>
                    <div className="mobile-splash-logo-viewport" aria-hidden="true">
                        <img src={POLTEKPAR_LOGO_URL} alt="Logo Poltekpar Makassar" className="mobile-splash-logo" />
                    </div>
                </div>

                <div className="mobile-splash-copy">
                    <p className="mobile-splash-kicker">Sistem Informasi Geospasial dan Akses Pelayanan Pengabdian Kepada Masyarakat</p>
                    <h1>SIGAP PKM</h1>
                    <p className="mobile-splash-subtitle">Politeknik Pariwisata Makassar</p>
                </div>

                <div className="mobile-splash-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
}
