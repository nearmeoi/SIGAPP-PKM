import React from 'react';
import { Link } from '@inertiajs/react';

export default function CTABanner() {
    return (
        <section className="cta-banner" id="cta-pengajuan">
            <div className="cta-banner__glow"></div>
            <div className="cta-banner__content">
                <div className="cta-banner__icon-wrap">
                    <i className="fa-solid fa-paper-plane"></i>
                </div>
                <h2 className="cta-banner__title">
                    Mau melakukan pengajuan PKM?
                </h2>
                <p className="cta-banner__subtitle">
                    Silakan klik tombol di bawah ini untuk memulai proses pengajuan Pengabdian Kepada Masyarakat.
                </p>
                <Link href="/login" className="cta-banner__btn cta-banner__btn--guest">
                    <i className="fa-solid fa-arrow-down"></i>
                    <span>Buka Form Pengajuan</span>
                </Link>
            </div>
        </section>
    );
}
