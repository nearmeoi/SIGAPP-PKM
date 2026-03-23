import React from 'react';

const Footer = () => {
    return (
        <>
            <footer className="site-footer" itemScope="itemscope" itemType="https://schema.org/WPFooter">
                <div className="footer-container">
                    <div className="footer-widgets">
                        <div className="footer-widget">
                            <h3 className="widget-title">Kontak Kami</h3>
                            <ul className="contact-info">
                                <li>
                                    <i className="fa-solid fa-map-marker-alt"></i>
                                    <span>Jl. Gunung Rinjani, Kota Mandiri Tanjung Bunga, Makassar 90224</span>
                                </li>
                                <li>
                                    <i className="fa-solid fa-phone-alt"></i>
                                    <span>(0411) 838456</span>
                                </li>
                                <li>
                                    <i className="fa-solid fa-envelope"></i>
                                    <a href="mailto:p3m@poltekparmakassar.ac.id">[email protected]</a>
                                </li>
                            </ul>

                            <h3 className="widget-title footer-follow-title">Follow</h3>
                            <div className="footer-socials">
                                <a href="https://www.instagram.com/poltekparmakassar/" target="_blank" rel="noreferrer" aria-label="Instagram">
                                    <i className="fa-brands fa-instagram"></i>
                                </a>
                                <a href="https://www.facebook.com/poltekparmakassar" target="_blank" rel="noreferrer" aria-label="Facebook">
                                    <i className="fa-brands fa-facebook-f"></i>
                                </a>
                                <a href="https://x.com/poltekpar_mks" target="_blank" rel="noreferrer" aria-label="X">
                                    <i className="fa-brands fa-x-twitter"></i>
                                </a>
                                <a href="https://www.youtube.com/@poltekparmakassar" target="_blank" rel="noreferrer" aria-label="Youtube">
                                    <i className="fa-brands fa-youtube"></i>
                                </a>
                            </div>
                        </div>

                        <div className="footer-widget">
                            <h3 className="widget-title">Profil Kami</h3>
                            <ul className="footer-link-list">
                                <li><a href="https://p3m.poltekparmakassar.ac.id/profil/tentang-kami/">Tentang Kami</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/profil/visi-dan-misi/">Visi dan Misi</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/profil/struktur-organisasi/">Struktur Organisasi Tahun 2026</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/hubungi-kami/">Hubungi Kami</a></li>
                            </ul>
                        </div>

                        <div className="footer-widget">
                            <h3 className="widget-title">Kegiatan</h3>
                            <ul className="footer-link-list">
                                <li><a href="https://p3m.poltekparmakassar.ac.id/penelitian/">Penelitian</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/pengabdian/">Pengabdian</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/pelatihan/">Pelatihan</a></li>
                                <li><a href="https://p3m.poltekparmakassar.ac.id/galeri/">Galeri</a></li>
                            </ul>
                        </div>

                        <div className="footer-widget">
                            <h3 className="widget-title">Statistik Pengunjung</h3>
                            <ul className="footer-stats-list">
                                <li><span>Today&apos;s Views:</span><strong>2</strong></li>
                                <li><span>Today&apos;s Visitors:</span><strong>2</strong></li>
                                <li><span>Last 7 Days Views:</span><strong>142</strong></li>
                                <li><span>Last 30 Days Views:</span><strong>553</strong></li>
                                <li><span>Total Visitors:</span><strong>2,430</strong></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer-copyright">
                        <p>Copyright 2026 &copy; P3M Poltekpar Makassar</p>
                    </div>
                </div>
            </footer>

            <button
                type="button"
                className="scroll-top-button"
                aria-label="Back to top"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <i className="fa-solid fa-angle-up"></i>
            </button>
        </>
    );
};

export default Footer;
