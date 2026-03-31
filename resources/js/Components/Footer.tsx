import React from 'react';

export default function Footer() {
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <footer className="bg-slate-900 text-white" itemScope="itemscope" itemType="https://schema.org/WPFooter">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-slate-100">Kontak Kami</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-map-marker-alt text-sigap-blue mt-1"></i>
                                    <span className="text-slate-300 text-sm leading-relaxed">
                                        Jl. Gunung Rinjani, Kota Mandiri Tanjung Bunga, Makassar 90224
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <i className="fa-solid fa-phone-alt text-sigap-blue"></i>
                                    <span className="text-slate-300 text-sm">(0411) 838456</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <i className="fa-solid fa-envelope text-sigap-blue"></i>
                                    <a href="mailto:p3m@poltekparmakassar.ac.id" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        p3m@poltekparmakassar.ac.id
                                    </a>
                                </li>
                            </ul>

                            <h3 className="text-lg font-bold mt-6 mb-4 text-slate-100">Follow</h3>
                            <div className="flex items-center gap-3">
                                <a
                                    href="https://www.instagram.com/poltekparmakassar/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-sigap-blue transition-colors"
                                    aria-label="Instagram"
                                >
                                    <i className="fa-brands fa-instagram"></i>
                                </a>
                                <a
                                    href="https://www.facebook.com/poltekparmakassar"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-sigap-blue transition-colors"
                                    aria-label="Facebook"
                                >
                                    <i className="fa-brands fa-facebook-f"></i>
                                </a>
                                <a
                                    href="https://x.com/poltekpar_mks"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-sigap-blue transition-colors"
                                    aria-label="X"
                                >
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>
                                <a
                                    href="https://www.youtube.com/@poltekparmakassar"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-sigap-blue transition-colors"
                                    aria-label="Youtube"
                                >
                                    <i className="fa-brands fa-youtube"></i>
                                </a>
                            </div>
                        </div>

                        {/* Profil Kami */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-slate-100">Profil Kami</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/profil/tentang-kami/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Tentang Kami
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/profil/visi-dan-misi/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Visi dan Misi
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/profil/struktur-organisasi/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Struktur Organisasi Tahun 2026
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/hubungi-kami/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Hubungi Kami
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Kegiatan */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-slate-100">Kegiatan</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/penelitian/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Penelitian
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/pengabdian/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Pengabdian
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/pelatihan/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Pelatihan
                                    </a>
                                </li>
                                <li>
                                    <a href="https://p3m.poltekparmakassar.ac.id/galeri/" className="text-slate-300 text-sm hover:text-sigap-blue transition-colors">
                                        Galeri
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Statistik Pengunjung */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-slate-100">Statistik Pengunjung</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-slate-400">Today&apos;s Views:</span>
                                    <strong className="text-white">2</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-slate-400">Today&apos;s Visitors:</span>
                                    <strong className="text-white">2</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-slate-400">Last 7 Days Views:</span>
                                    <strong className="text-white">142</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-slate-400">Last 30 Days Views:</span>
                                    <strong className="text-white">553</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-slate-400">Total Visitors:</span>
                                    <strong className="text-white">2,430</strong>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 text-center">
                        <p className="text-slate-400 text-sm">Copyright 2026 &copy; P3M Poltekpar Makassar</p>
                    </div>
                </div>
            </footer>

            <button
                type="button"
                className="fixed bottom-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-sigap-blue text-white shadow-lg hover:bg-sigap-darkBlue transition-all hover:shadow-xl z-40"
                aria-label="Back to top"
                onClick={handleScrollToTop}
            >
                <i className="fa-solid fa-angle-up text-lg"></i>
            </button>
        </>
    );
}
