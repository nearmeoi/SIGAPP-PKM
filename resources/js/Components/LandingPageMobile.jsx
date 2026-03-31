import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LandingCharts from './LandingCharts';
import MapLegend from './MapLegend';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';
import MobileSplashScreen from './MobileSplashScreen';
import { createPkmMarkerIcon } from '@/data/pkmMapVisuals';
import '../../css/landing-mobile.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const mobileMenuItems = [
    { label: 'Beranda', href: 'https://p3m.poltekparmakassar.ac.id/' },
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
    { label: 'Dokumen', href: 'https://p3m.poltekparmakassar.ac.id/dokumen/' },
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

const getStatusBadge = (status) => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status) => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status) => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

function MobileMapEvents({ onMapClick }) {
    useMapEvents({
        click() {
            onMapClick?.();
        },
    });
    return null;
}

function MobileMapInvalidator({ watchKey }) {
    const map = useMap();

    useEffect(() => {
        const invalidate = () => map.invalidateSize({ animate: false, pan: false });
        const frameId = window.requestAnimationFrame(invalidate);
        const timeoutId = window.setTimeout(invalidate, 180);
        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(timeoutId);
        };
    }, [map, watchKey]);

    return null;
}

function MobileMapSearch({ pkmData, isHidden, onSelect }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = pkmData.filter((pkm) => (
        pkm.nama.toLowerCase().includes(query.toLowerCase()) ||
        pkm.deskripsi.toLowerCase().includes(query.toLowerCase())
    ));

    return (
        <div className={`landing-mobile-map-search ${isHidden ? 'is-hidden' : ''}`}>
            <div className="landing-mobile-map-search-shell">
                <i className="fa-solid fa-search"></i>
                <input
                    type="text"
                    placeholder="Cari titik PKM..."
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        type="button"
                        className="landing-mobile-map-search-clear"
                        onClick={() => {
                            setQuery('');
                            setIsOpen(false);
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                )}
            </div>

            {isOpen && query && (
                <div className="landing-mobile-map-search-results">
                    {filtered.length > 0 ? (
                        filtered.map((pkm) => (
                            <button
                                key={pkm.id}
                                type="button"
                                className="landing-mobile-map-search-item"
                                onClick={() => {
                                    onSelect(pkm);
                                    setQuery(pkm.nama);
                                    setIsOpen(false);
                                }}
                            >
                                <strong>{pkm.nama}</strong>
                                <span>{pkm.desa}, {pkm.kecamatan}</span>
                            </button>
                        ))
                    ) : (
                        <div className="landing-mobile-map-search-empty">
                            Tidak ada hasil untuk "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MobileMenuDrawer({ isOpen, onClose }) {
    const [expandedIndex, setExpandedIndex] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setExpandedIndex(null);
        }
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                className={`landing-mobile-drawer-backdrop ${isOpen ? 'is-open' : ''}`}
                aria-label="Tutup menu"
                onClick={onClose}
            ></button>

            <aside className={`landing-mobile-drawer ${isOpen ? 'is-open' : ''}`}>
                <div className="landing-mobile-drawer-header">
                    <div>
                        <span className="landing-mobile-drawer-eyebrow">Navigasi Mobile</span>
                        <h3>Menu P3M Poltekpar</h3>
                        <p>Semua menu header tampil rapi di sini, dengan submenu yang default-nya tertutup.</p>
                    </div>
                    <button type="button" className="landing-mobile-drawer-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="landing-mobile-drawer-body">
                    {mobileMenuItems.map((item, index) => {
                        const hasChildren = Boolean(item.children?.length);
                        const isExpanded = expandedIndex === index;

                        return (
                            <div key={item.label} className={`landing-mobile-menu-group ${isExpanded ? 'is-expanded' : ''}`}>
                                {hasChildren ? (
                                    <>
                                        <button
                                            type="button"
                                            className="landing-mobile-menu-trigger"
                                            onClick={() => setExpandedIndex((previous) => previous === index ? null : index)}
                                        >
                                            <span className="landing-mobile-menu-heading">{item.label}</span>
                                            <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                        </button>

                                        <div className="landing-mobile-menu-children">
                                            {item.children.map((child) => (
                                                <a
                                                    key={child.label}
                                                    href={child.href}
                                                    target={child.target}
                                                    rel={child.target === '_blank' ? 'noreferrer' : undefined}
                                                    className="landing-mobile-menu-link"
                                                    onClick={onClose}
                                                >
                                                    {child.label}
                                                </a>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <a
                                        href={item.href}
                                        className="landing-mobile-menu-link landing-mobile-menu-link--solo"
                                        onClick={onClose}
                                    >
                                        <span className="landing-mobile-menu-heading">{item.label}</span>
                                        <i className="fa-solid fa-chevron-down landing-mobile-menu-placeholder" aria-hidden="true"></i>
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}

function MobileAccessPanel() {
    return (
        <section className="landing-mobile-screen landing-mobile-screen--centered">
            <div className="landing-mobile-card landing-mobile-access-card">
                <div className="landing-mobile-card-header center">
                    <span className="landing-mobile-card-label">Akses Pengajuan</span>
                    <h3>Pengajuan PKM siap diakses dari akun Anda</h3>
                    <p>Format kontennya mengikuti web, tetapi tata letaknya dipusatkan dan dirapikan untuk mobile.</p>
                </div>

                <div className="landing-mobile-access-preview">
                    <div className="landing-mobile-access-blur">
                        <div className="landing-mobile-access-form">
                            {['Nama Lengkap / Perwakilan', 'Institusi / Organisasi', 'Lokasi Kegiatan', 'Email', 'WhatsApp'].map((field) => (
                                <div key={field} className="landing-mobile-access-row">
                                    <label>{field}</label>
                                    <div className="landing-mobile-access-input"></div>
                                </div>
                            ))}
                            <div className="landing-mobile-access-row full">
                                <label>Kebutuhan / Permintaan</label>
                                <div className="landing-mobile-access-input textarea"></div>
                            </div>
                        </div>
                    </div>

                    <div className="landing-mobile-access-copy">
                        <strong>Form pengajuan tersedia setelah login.</strong>
                        <p>Masuk ke akun Anda untuk membuat pengajuan dan memantau status PKM.</p>
                        <div className="landing-mobile-access-actions">
                            <a href="/login" className="btn-primary">Login</a>
                            <a href="/register" className="landing-mobile-ghost-btn">Daftar</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MobileDashboardPanel() {
    return (
        <section className="landing-mobile-screen landing-mobile-screen--dashboard">
            <div className="landing-mobile-dashboard-shell">
                <LandingCharts compactMobile pkmData={pkmData} />
            </div>
        </section>
    );
}

function MobileMapPanel({ pkmData, selectedPkm, onSelectPkm, onClosePkm, totals }) {
    return (
        <section className="landing-mobile-screen landing-mobile-screen--map">
            <div className="landing-mobile-map-shell">
                <div className="landing-mobile-map-stage">
                    <MobileMapSearch
                        pkmData={pkmData}
                        isHidden={!!selectedPkm}
                        onSelect={onSelectPkm}
                    />

                    <MapContainer
                        center={[-2.5, 118]}
                        zoom={5}
                        minZoom={4}
                        maxBounds={[[-15, 90], [10, 145]]}
                        className="landing-mobile-map-canvas"
                        zoomControl={false}
                    >
                        <ZoomControl position="topleft" />
                        <MobileMapInvalidator watchKey={selectedPkm?.id ?? 'none'} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {pkmData.map((pkm) => (
                            <Marker
                                key={pkm.id}
                                position={[pkm.lat, pkm.lng]}
                                icon={createPkmMarkerIcon(pkm)}
                                eventHandlers={{ click: () => onSelectPkm(pkm) }}
                            />
                        ))}
                        <MobileMapEvents onMapClick={onClosePkm} />
                    </MapContainer>

                    <div className={`landing-mobile-map-summary ${selectedPkm ? 'is-hidden' : ''}`}>
                        <MapLegend compact className="landing-mobile-map-legend-card" />

                        <div className="landing-mobile-map-stats">
                            <div className="landing-mobile-map-stat">
                                <span>Total PKM</span>
                                <strong>{totals.totalPkm}</strong>
                            </div>
                            <div className="landing-mobile-map-stat">
                                <span>PKM Selesai</span>
                                <strong>{totals.totalSelesai}</strong>
                            </div>
                            <div className="landing-mobile-map-stat">
                                <span>PKM Berlangsung</span>
                                <strong>{totals.totalBerlangsung}</strong>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={`landing-mobile-map-overlay ${selectedPkm ? 'is-open' : ''}`}
                        aria-label="Tutup detail titik"
                        onClick={onClosePkm}
                    ></button>

                    <aside className={`landing-mobile-map-sidebar ${selectedPkm ? 'is-open' : ''}`}>
                        {selectedPkm && (
                            <>
                                <button type="button" className="landing-mobile-map-sidebar-close" onClick={onClosePkm}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>

                                <div className="location-card location-card--mobile">
                                    <div
                                        className={`card-image-wrapper ${selectedPkm.thumbnail ? 'has-image' : ''}`}
                                        style={selectedPkm.thumbnail ? { backgroundImage: `url(${selectedPkm.thumbnail})` } : {}}
                                    >
                                        {!selectedPkm.thumbnail && <i className="fa-solid fa-image"></i>}
                                    </div>

                                    <div className="card-body">
                                        <div className="card-header-flex">
                                            <h2 className="card-title">{selectedPkm.nama}</h2>
                                            <span className="card-year">{selectedPkm.tahun}</span>
                                        </div>

                                        <div className={`card-status ${getStatusBadge(selectedPkm.status)}`}>
                                            <i className={`fa-solid ${getStatusIcon(selectedPkm.status)}`}></i> {getStatusText(selectedPkm.status)}
                                        </div>

                                        <p className="card-description">{selectedPkm.deskripsi}</p>

                                        <DocumentationGallery status={selectedPkm.status} />
                                        <TestimonialSidebarDisplay status={selectedPkm.status} />

                                        <div className="card-location">
                                            <i className="fa-solid fa-map-pin"></i> {selectedPkm.desa}, Kec. {selectedPkm.kecamatan}, {selectedPkm.kabupaten}, {selectedPkm.provinsi}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </div>
        </section>
    );
}

export default function LandingPageMobile({ pkmData = [] }) {
    const [activeTab, setActiveTab] = useState('peta');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedPkm, setSelectedPkm] = useState(null);
    const [parkedPkm, setParkedPkm] = useState(null);

    const totals = useMemo(() => ({
        totalPkm: pkmData.length,
        totalSelesai: pkmData.filter((item) => item.status === 'selesai').length,
        totalBerlangsung: pkmData.filter((item) => item.status === 'berlangsung').length,
    }), [pkmData]);

    const closeMenuPanel = () => {
        setIsMenuOpen(false);

        if (parkedPkm) {
            setSelectedPkm(parkedPkm);
            setParkedPkm(null);
        }
    };

    const closePkmPanel = () => {
        setSelectedPkm(null);
        setParkedPkm(null);
    };

    const handleOpenMenu = () => {
        if (isMenuOpen) {
            closeMenuPanel();
            return;
        }

        if (selectedPkm) {
            setParkedPkm(selectedPkm);
            setSelectedPkm(null);
        }

        setIsMenuOpen(true);
    };

    const handleSelectPkm = (pkm) => {
        if (isMenuOpen) {
            setIsMenuOpen(false);
            setParkedPkm(null);
        }

        setSelectedPkm(pkm);
    };

    const handleTabChange = (tabId) => {
        if (tabId === 'login') {
            window.location.href = '/login';
            return;
        }

        if (tabId === 'menu') {
            handleOpenMenu();
            return;
        }

        setIsMenuOpen(false);
        setSelectedPkm(null);
        setParkedPkm(null);
        setActiveTab(tabId);
    };

    return (
        <div className="landing-mobile-app">
            <MobileSplashScreen />
            <MobileMenuDrawer isOpen={isMenuOpen} onClose={closeMenuPanel} />

            {activeTab === 'peta' && (
                <MobileMapPanel
                    pkmData={pkmData}
                    selectedPkm={selectedPkm}
                    onSelectPkm={handleSelectPkm}
                    onClosePkm={closePkmPanel}
                    totals={totals}
                />
            )}

            {activeTab === 'dashboard' && <MobileDashboardPanel />}
            {activeTab === 'akses' && <MobileAccessPanel />}

            <nav className="landing-mobile-tabbar" aria-label="Navigasi mobile landing page">
                {[
                    { id: 'menu', label: 'Menu', icon: 'fa-solid fa-bars' },
                    { id: 'peta', label: 'Peta', icon: 'fa-solid fa-map-location-dot' },
                    { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
                    { id: 'akses', label: 'Akses', icon: 'fa-solid fa-file-signature' },
                    { id: 'login', label: 'Login', icon: 'fa-solid fa-user-lock' },
                ].map((tab) => {
                    const isActive = tab.id === 'menu' ? isMenuOpen : activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            className={`landing-mobile-tabbar-item ${isActive ? 'is-active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <i className={tab.icon}></i>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
