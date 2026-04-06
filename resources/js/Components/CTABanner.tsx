import React from 'react';
import { Link } from '@inertiajs/react';

export default function CTABanner() {
    return (
        <section className="py-10 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy rounded-xl sm:rounded-2xl shadow-glow overflow-hidden relative" id="cta-pengajuan">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
                    <i className="fa-solid fa-paper-plane text-4xl text-white"></i>
                </div>
                
                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Mau melakukan pengajuan PKM?
                </h2>
                
                {/* Subtitle */}
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                    Silakan klik tombol di bawah ini untuk memulai proses pengajuan Pengabdian Kepada Masyarakat.
                </p>
                
                {/* CTA Button */}
                <Link 
                    href="/cek-status" 
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-poltekpar-primary font-bold rounded-xl shadow-lg hover:bg-slate-50 hover:shadow-xl hover:scale-105 transition-all duration-200"
                >
                    <i className="fa-solid fa-arrow-down text-lg"></i>
                    <span>Buka Form Pengajuan</span>
                </Link>
            </div>
        </section>
    );
}
