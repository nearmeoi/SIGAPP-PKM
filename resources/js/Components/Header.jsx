import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const menuItems = [
    {
        label: 'Beranda',
        href: 'https://p3m.poltekparmakassar.ac.id/',
    },
    {
        label: 'Profil',
        children: [
            { label: 'Tentang Kami', href: 'https://p3m.poltekparmakassar.ac.id/profil/tentang-kami/' },
            { label: 'Visi dan Misi', href: 'https://p3m.poltekparmakassar.ac.id/profil/visi-dan-misi/' },
            { label: 'Struktur Organisasi Tahun 2026', href: 'https://p3m.poltekparmakassar.ac.id/profil/struktur-organisasi/' },
            { label: 'Hubungi Kami', href: 'https://p3m.poltekparmakassar.ac.id/hubungi-kami/' },
        ],
    },
    {
        label: 'Kegiatan',
        children: [
            { label: 'Penelitian', href: 'https://p3m.poltekparmakassar.ac.id/kegiatan/penelitian/' },
            { label: 'Conference Internasional', href: 'https://p3m.poltekparmakassar.ac.id/conference-internasional/' },
            { label: 'Seminar Nasional', href: 'https://p3m.poltekparmakassar.ac.id/seminar-nasional/' },
        ],
    },
    {
        label: 'Informasi',
        children: [
            { label: 'Berita', href: 'https://p3m.poltekparmakassar.ac.id/informasi/berita/' },
            { label: 'Info Seminar', href: 'https://p3m.poltekparmakassar.ac.id/informasi/pengumuman/' },
            { label: 'Pengumuman', href: 'https://p3m.poltekparmakassar.ac.id/pengumuman/' },
        ],
    },
    {
        label: 'Dokumen',
        href: 'https://p3m.poltekparmakassar.ac.id/dokumen/',
    },
    {
        label: 'Publikasi',
        children: [
            { label: 'Penelitian', href: 'https://p3m.poltekparmakassar.ac.id/penelitian/' },
            { label: 'Pengabdian', href: 'https://p3m.poltekparmakassar.ac.id/pengabdian/' },
            { label: 'Padaidi', href: 'https://journal.poltekparmakassar.ac.id/index.php/padaidi', target: '_blank' },
            { label: 'Pusaka', href: 'https://journal.poltekparmakassar.ac.id/index.php/pusaka', target: '_blank' },
            { label: 'Hak Cipta', href: 'https://p3m.poltekparmakassar.ac.id/publikasi/sentra-haki/hak-cipta/' },
            { label: 'Buku', href: 'https://p3m.poltekparmakassar.ac.id/buku/' },
        ],
    },
];

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(null);
    const { url = '' } = usePage();
    const showLogoutButton = url.startsWith('/login/dosen') || url.startsWith('/login/masyarakat');

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => {
            const next = !prev;
            if (!next) {
                setSubmenuOpen(null);
            }
            return next;
        });
    };

    const toggleSubmenu = (index) => {
        if (window.innerWidth > 768) {
            return;
        }

        setSubmenuOpen((prev) => (prev === index ? null : index));
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setSubmenuOpen(null);
    };

    return (
        <header className="bikinmap-header">
            <div className="header-container">
                <a href="https://p3m.poltekparmakassar.ac.id/" className="header-brand">
                    <img
                        src="https://p3m.poltekparmakassar.ac.id/storage/2025/10/cropped-Screenshot_2024-01-15_101923-removebg-preview.png"
                        alt="P3M Poltekpar"
                        className="header-brand-logo"
                    />
                    <div className="header-brand-copy">
                        <span className="brand-line">PUSAT PENELITIAN DAN</span>
                        <span className="brand-line">PENGABDIAN MASYARAKAT</span>
                        <span className="brand-line">POLITEKNIK PARIWISATA MAKASSAR</span>
                        <span className="brand-subline">Centre for Marine Tourism</span>
                    </div>
                </a>

                <nav className={`header-nav ${mobileMenuOpen ? 'active' : ''}`}>
                    <ul className="nav-menu">
                        {menuItems.map((item, index) => {
                            const hasChildren = Boolean(item.children?.length);

                            return (
                                <li
                                    key={item.label}
                                    className={`nav-item ${hasChildren ? 'has-submenu' : ''} ${submenuOpen === index ? 'submenu-visible' : ''}`}
                                >
                                    {hasChildren ? (
                                        <>
                                            <button
                                                type="button"
                                                className="nav-link nav-toggle"
                                                aria-expanded={submenuOpen === index}
                                                onClick={() => toggleSubmenu(index)}
                                            >
                                                <span>{item.label}</span>
                                                <i className="fa-solid fa-bars"></i>
                                            </button>
                                            <ul className="submenu">
                                                {item.children.map((child) => (
                                                    <li key={child.label}>
                                                        <a
                                                            href={child.href}
                                                            className="submenu-link"
                                                            target={child.target}
                                                            rel={child.target === '_blank' ? 'noreferrer' : undefined}
                                                            onClick={closeMobileMenu}
                                                        >
                                                            {child.label}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <a href={item.href} className="nav-link" onClick={closeMobileMenu}>
                                            <span>{item.label}</span>
                                        </a>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="header-controls">
                    {showLogoutButton ? (
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="btn-primary"
                            style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '99px', textDecoration: 'none' }}
                        >
                            Logout
                        </Link>
                    ) : (
                        <a href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '99px', textDecoration: 'none' }}>
                            Login
                        </a>
                    )}
                    <button type="button" className="header-control-button header-control-primary" aria-label="Quick menu">
                        <i className="fa-solid fa-align-justify"></i>
                    </button>
                    <button type="button" className="header-control-button header-control-flag" aria-label="English">
                        <img src="https://flagcdn.com/w40/gb.png" alt="English" style={{ width: '24px', height: '18px', borderRadius: '2px', objectFit: 'cover' }} />
                    </button>
                    <button type="button" className="header-control-button header-control-caret" aria-label="Collapse">
                        <i className="fa-solid fa-angle-up"></i>
                    </button>
                </div>

                <button
                    className={`hamburger-menu ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
