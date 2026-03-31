import React, { useState, useCallback, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ProfileDropdown from '@/Components/ProfileDropdown';
import '../../css/navbar.css';

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
};

const getContextRole = (pageUrl, user) => {
    const search = pageUrl.includes('?') ? pageUrl.split('?')[1] : '';
    const params = new URLSearchParams(search);
    const queryRole = params.get('role');

    if (queryRole === 'dosen' || queryRole === 'masyarakat') {
        return queryRole;
    }

    if (pageUrl.startsWith('/login/dosen')) {
        return 'dosen';
    }

    if (pageUrl.startsWith('/login/masyarakat')) {
        return 'masyarakat';
    }

    const role = String(user?.role || '').toLowerCase();
    return role.includes('dosen') ? 'dosen' : role ? 'masyarakat' : null;
};

const getNavLinks = (pageUrl, user) => {
    const role = getContextRole(pageUrl, user);
    const pengajuanHref = role ? `/pengajuan?role=${role}&view=form` : '/login';
    const statusHref = role ? `/pengajuan?role=${role}&view=status` : '/login';

    return [
        { label: 'Beranda', href: '/', icon: 'fa-house' },
        { label: 'Cek Status', href: statusHref, icon: 'fa-magnifying-glass' },
        { label: 'Pengajuan', href: pengajuanHref, icon: 'fa-file-circle-plus' },
        { label: 'Panduan', href: '#panduan', icon: 'fa-book-open' },
    ];
};

export default function Navbar() {
    const page = usePage();
    const { auth } = page.props;
    const currentUrl = page.url || '/';
    const user = auth?.user ?? null;
    const poltekparLogoSrc = '/logo-poltekpar.png';
    const navLinks = useMemo(() => getNavLinks(currentUrl, user), [currentUrl, user]);

    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleMobile = useCallback(() => {
        setMobileOpen((prev) => !prev);
    }, []);

    const closeMobile = useCallback(() => {
        setMobileOpen(false);
    }, []);

    return (
        <header className="sigap-navbar">
            <div className="sigap-navbar__inner">
                {/* Brand */}
                <a href="https://p3m.poltekparmakassar.ac.id/" className="sigap-navbar__brand">
                    <span className="sigap-navbar__logo" aria-hidden="true">
                        <img
                            src={poltekparLogoSrc}
                            alt=""
                            className="sigap-navbar__logo-img"
                        />
                    </span>
                    <div className="sigap-navbar__brand-text" style={{ gap: '0' }}>
                        <span className="sigap-navbar__brand-line" style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0', textTransform: 'uppercase', color: '#475569', lineHeight: '1.2' }}>Sistem Informasi Geospasial dan Akses Pelayanan<br />Pengabdian Kepada Masyarakat (SIGAP-PKM)</span>
                        <span className="sigap-navbar__brand-sub" style={{ fontSize: '11px', fontWeight: '500', color: '#64748b', marginTop: '2px' }}>Politeknik Pariwisata Makassar</span>
                    </div>
                </a>

                {/* Desktop Nav */}
                <nav className="sigap-navbar__nav" role="navigation" aria-label="Main navigation">
                    <ul className="sigap-navbar__links">
                        {navLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className="sigap-navbar__link"
                                    onClick={closeMobile}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sigap-navbar__utility">
                    <a
                        href="https://p3m.poltekparmakassar.ac.id/peta-sebaran-p3m"
                        className="sigap-navbar__portal-btn"
                    >
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        <span>Portal P3M</span>
                    </a>
                </div>

                {/* Right Controls */}
                <div className="sigap-navbar__controls">
                    <ProfileDropdown auth={auth} />

                    {/* Hamburger */}
                    <button
                        type="button"
                        className={`sigap-navbar__hamburger ${mobileOpen ? 'is-active' : ''}`}
                        onClick={toggleMobile}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileOpen}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <div className={`sigap-navbar__drawer ${mobileOpen ? 'is-open' : ''}`}>
                <ul className="sigap-navbar__drawer-links">
                    {navLinks.map((item) => (
                        <li key={item.label}>
                            <Link
                                href={item.href}
                                className="sigap-navbar__drawer-link"
                                onClick={closeMobile}
                            >
                                <i className={`fa-solid ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile Auth */}
                <div className="sigap-navbar__drawer-footer">
                    {user ? (
                        <div className="sigap-navbar__drawer-user">
                            <div className="sigap-navbar__drawer-user-info">
                                <div className="sigap-navbar__avatar sigap-navbar__avatar--sm">
                                    <span className="sigap-navbar__avatar-initials">{getInitials(user.name)}</span>
                                </div>
                                <div>
                                    <p className="sigap-navbar__drawer-user-name">{user.name}</p>
                                    <p className="sigap-navbar__drawer-user-email">{user.email}</p>
                                </div>
                            </div>
                            <Link href="/logout" method="post" as="button" className="sigap-navbar__drawer-logout">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                Log Out
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login" className="sigap-navbar__drawer-login" onClick={closeMobile}>
                            <i className="fa-solid fa-right-to-bracket"></i>
                            Masuk / Login
                        </Link>
                    )}
                </div>
            </div>

            {/* Backdrop */}
            {mobileOpen && (
                <div className="sigap-navbar__backdrop" onClick={closeMobile}></div>
            )}
        </header>
    );
}
