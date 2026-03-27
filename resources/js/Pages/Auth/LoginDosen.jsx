import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import MobileTabBar from '@/Components/MobileTabBar';
import BottomSheet from '@/Components/BottomSheet';

import LecturerSubmissionForm from '@/Components/LecturerSubmissionForm';
import DocumentationGallery from '@/Components/DocumentationGallery';
import TestimonialSidebarDisplay from '@/Components/TestimonialSidebarDisplay';
import LandingCharts from '@/Components/LandingCharts';
import DosenSubmissionCard from '@/Components/DosenSubmissionCard';
import '../../../css/landing.css';
import '../../../css/lecturer-form.css';

// Leaflet Setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status) => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status) => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status) => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const createCustomIcon = (status) => {
    const markerColor = status === 'berlangsung' ? '#f59e0b' : '#16a34a';
    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="marker-pin" style="background-color: ${markerColor}">
                <i class="fa-solid fa-hands-holding-child"></i>
            </div>
            <div class="marker-pulse" style="border-color: ${markerColor}"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
    });
};

function MapEvents({ isPickingLocation, onLocationPicked, setSidebarPkm }) {
    useMapEvents({
        click(event) {
            if (isPickingLocation) {
                onLocationPicked(event.latlng);
            } else {
                setSidebarPkm(null);
            }
        },
    });
    return null;
}

// Map Search Widget Component
const MapSearchWidget = ({ pkmData, onSelectPkm, isHidden }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = pkmData.filter(pkm =>
        pkm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkm.deskripsi && pkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="map-search-widget" style={{
            position: 'absolute', top: '24px', left: '16px', zIndex: 1000, width: '380px', maxWidth: 'calc(100vw - 32px)',
            opacity: isHidden ? 0 : 1,
            pointerEvents: isHidden ? 'none' : 'auto',
            transform: isHidden ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{ position: 'relative', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                <i className="fa-solid fa-search" style={{ color: '#046bd2', marginRight: '12px', fontSize: '18px' }}></i>
                <input
                    type="text"
                    placeholder="Cari lokasi kegiatan P3M..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '15px', fontWeight: '500', color: '#0f172a' }}
                />
                {searchQuery && (
                    <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', color: '#94a3b8', marginLeft: '12px', fontSize: '16px' }} onClick={() => { setSearchQuery(''); setIsOpen(false); }}></i>
                )}
            </div>

            {isOpen && searchQuery && (
                <div style={{ marginTop: '8px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '350px', overflowY: 'auto', overflowX: 'hidden', border: '1px solid #e2e8f0' }}>
                    {filteredData.length > 0 ? (
                        <div style={{ padding: '8px 0' }}>
                            {filteredData.map(pkm => (
                                <div
                                    key={pkm.id}
                                    onClick={() => {
                                        onSelectPkm(pkm);
                                        setIsOpen(false);
                                        setSearchQuery(pkm.nama);
                                    }}
                                    style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a', lineHeight: '1.4' }}>{pkm.nama}</div>
                                    <div style={{ fontSize: '12.5px', color: '#64748b' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '6px', color: '#94a3b8' }}></i>{pkm.desa}, {pkm.kecamatan}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                            <i className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: '24px', color: '#cbd5e1', margin: '0 0 12px 0', display: 'block' }}></i>
                            Tidak ada hasil ditemukan untuk <b>"{searchQuery}"</b>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ====================================================
// Login Dosen — Dashboard Page (Role: Dosen)
// ====================================================

export default function LoginDosen() {
    const [pkmData, setPkmData] = useState([
        {
            id: 1,
            nama: 'Pemberdayaan UMKM Kripik Pisang',
            tahun: 2025,
            status: 'selesai',
            deskripsi: 'Program pendampingan pemasaran digital dan perbaikan kemasan untuk industri rumah tangga kripik pisang di wilayah Tamalanrea.',
            thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
            laporan: '',
            dokumentasi: 'https://drive.google.com/',
            provinsi: 'Sulawesi Selatan',
            kabupaten: 'Makassar',
            kecamatan: 'Tamalanrea',
            desa: 'Bira',
            lat: -5.135,
            lng: 119.495,
        },
        {
            id: 2,
            nama: 'Edukasi Sanitasi Lingkungan',
            tahun: 2026,
            status: 'berlangsung',
            deskripsi: 'Penyuluhan mengenai pentingnya memilah sampah organik dan non-organik serta pembuatan bank sampah mandiri tingkat RW.',
            thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
            laporan: '',
            dokumentasi: '',
            provinsi: 'Sulawesi Selatan',
            kabupaten: 'Makassar',
            kecamatan: 'Tamalanrea',
            desa: 'Tamalanrea Indah',
            lat: -5.13,
            lng: 119.485,
        },
    ]);

    const [sidebarPkm, setSidebarPkm] = useState(null);
    const [isMenuListOpen, setIsMenuListOpen] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState('peta');
    const [mobileBottomSheet, setMobileBottomSheet] = useState(null);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isLecturerFormOpen, setIsLecturerFormOpen] = useState(false);

    // Accordion state for sidebar menu
    const [expandedSection, setExpandedSection] = useState(null);
    const toggleSection = (section) => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    // Link form states
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkFormData, setLinkFormData] = useState({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });
    const [linkFormSubmitted, setLinkFormSubmitted] = useState(false);

    const handleLinkFormChange = (field, value) => {
        setLinkFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLinkFormSubmit = (e) => {
        if (e) e.preventDefault();
        if (!linkFormData.pkmId) {
            alert('Silakan pilih kegiatan terlebih dahulu.');
            return;
        }
        if (!linkFormData.linkDokumentasi && !linkFormData.linkLaporan) {
            alert('Silakan isi minimal satu link.');
            return;
        }
        setPkmData(prev => prev.map(item => {
            if (item.id === parseInt(linkFormData.pkmId)) {
                return {
                    ...item,
                    dokumentasi: linkFormData.linkDokumentasi || item.dokumentasi,
                    laporan: linkFormData.linkLaporan || item.laporan,
                };
            }
            return item;
        }));
        setLinkFormSubmitted(true);
        setTimeout(() => {
            setLinkFormSubmitted(false);
            setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });
            setIsLinkModalOpen(false);
        }, 2500);
    };

    // Status Pengajuan data — will be populated from backend
    // Each item: { id, judul, tanggal, status: 'diproses'|'disetujui'|'ditangguhkan'|'ditolak' }
    const [pengajuanData] = useState([]);

    const getStatusPengajuanStyle = (status) => {
        switch (status) {
            case 'disetujui':
                return { bg: '#dcfce7', color: '#15803d', icon: 'fa-circle-check', label: 'Disetujui' };
            case 'diproses':
                return { bg: '#dbeafe', color: '#1d4ed8', icon: 'fa-clock', label: 'Diproses' };
            case 'ditangguhkan':
                return { bg: '#fef3c7', color: '#b45309', icon: 'fa-pause-circle', label: 'Ditangguhkan (Revisi)' };
            case 'ditolak':
                return { bg: '#fee2e2', color: '#b91c1c', icon: 'fa-circle-xmark', label: 'Ditolak' };
            default:
                return { bg: '#f1f5f9', color: '#64748b', icon: 'fa-question-circle', label: status };
        }
    };

    const handleMarkerClick = (pkm) => {
        if (window.innerWidth <= 768) {
            setSidebarPkm(pkm);
            setMobileBottomSheet('detail');
        } else {
            setSidebarPkm(pkm);
        }
    };

    const handleMobileTabChange = (tabId) => {
        setMobileActiveTab(tabId);
        if (tabId === 'kegiatan') {
            setMobileBottomSheet('kegiatan');
        }
    };

    const closeMobileBottomSheet = () => {
        setMobileBottomSheet(null);
        if (mobileActiveTab === 'kegiatan') {
            setMobileActiveTab('peta');
        }
    };

    const onLocationPicked = (latlng) => {
        setIsPickingLocation(false);
    };

    const handleFabClick = () => {
        setIsLecturerFormOpen(true);
    };

    return (
        <Layout>
            <Head title="Akun Dosen - P3M Poltekpar Makassar" />

            {/* Render Contextual Form Components */}
            {isLecturerFormOpen && (
                <LecturerSubmissionForm onClose={() => setIsLecturerFormOpen(false)} />
            )}

            <div className="landing-page">
                {/* Interactive Map & Dashboard Main Layout */}
                <div className="landing-main-layout" style={{ paddingTop: '80px', paddingBottom: '40px' }}>

                    {/* 1. Interactive Map Column (Left Side) - Stretched to match right column height */}
                    <div className={`landing-map-column ${mobileActiveTab !== 'peta' ? 'mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                        <section className="fintech-map-section" id="peta-sebaran" style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                            <div className="fintech-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="fintech-panel-title">
                                    Peta Sebaran Pengabdian PKM <span className="text-blue">Poltekpar Makassar</span>
                                </h2>

                                {/* Akun Dosen Static Desktop Indicator (Moved to Panel Header) */}
                                <div className="akun-dosen-desktop-indicator-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', padding: '6px 14px', borderRadius: '100px', fontWeight: '600', fontSize: '14px' }}>
                                    <i className="fa-solid fa-user-tie"></i>
                                    <span>Akun Dosen</span>
                                </div>
                            </div>

                            <div className={`map-picking-mode-container fintech-map-stretch-container ${isPickingLocation ? 'map-picking-mode' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="landing-map-wrapper map-section-boxed fintech-map-stretch-container" style={{ margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div className="map-wrapper-boxed fintech-map-inner" style={{ overflow: 'hidden', position: 'relative', flex: 1 }}>

                                        <MapSearchWidget pkmData={pkmData} onSelectPkm={(pkm) => setSidebarPkm(pkm)} isHidden={!!sidebarPkm || isMenuListOpen} />

                                        <style>
                                            {`
                                            .floating-status-btn {
                                                position: absolute; top: 200px; left: 16px; z-index: 1010;
                                                background-color: white; border-radius: 12px;
                                                box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; align-items: center;
                                                height: 48px; width: 48px; cursor: pointer; border: 1px solid #e2e8f0;
                                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                                overflow: hidden; padding: 0; box-sizing: border-box;
                                            }
                                            .floating-status-btn:hover, .floating-status-btn.active {
                                                width: 180px; background-color: #f8fafc;
                                            }
                                            .floating-status-icon {
                                                min-width: 48px; text-align: center; color: #7c3aed; font-size: 20px;
                                            }
                                            .floating-status-text {
                                                white-space: nowrap; font-weight: 600; font-size: 14px; color: #0f172a;
                                                opacity: 0; transition: opacity 0.2s; padding-right: 16px;
                                            }
                                            .floating-status-btn:hover .floating-status-text, .floating-status-btn.active .floating-status-text {
                                                opacity: 1; transition-delay: 0.1s;
                                            }
                                            `}
                                        </style>
                                        <div
                                            className={`floating-status-btn ${isMenuListOpen ? 'active' : ''}`}
                                            onClick={() => {
                                                if (isMenuListOpen) {
                                                    setIsMenuListOpen(false);
                                                } else {
                                                    setIsMenuListOpen(true);
                                                    setExpandedSection('pengajuan');
                                                    setSidebarPkm(null);
                                                }
                                            }}
                                            style={{
                                                opacity: (sidebarPkm || isMenuListOpen) ? 0 : 1,
                                                pointerEvents: (sidebarPkm || isMenuListOpen) ? 'none' : 'auto',
                                                transform: (sidebarPkm || isMenuListOpen) ? 'translateY(-20px)' : 'translateY(0)'
                                            }}
                                        >
                                            <div className="floating-status-icon">
                                                <i className="fa-solid fa-file-circle-check"></i>
                                            </div>
                                            <span className="floating-status-text">Status Pengajuan</span>
                                        </div>

                                        {/* Left Sidebar Menu Panel - Status Pengajuan Only */}
                                        <div
                                            className="left-sidebar-menu"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                zIndex: 1007,
                                                width: '400px',
                                                height: '100%',
                                                backgroundColor: 'white',
                                                boxShadow: isMenuListOpen ? '4px 0 16px rgba(15, 23, 42, 0.08)' : 'none',
                                                transform: isMenuListOpen ? 'translateX(0)' : 'translateX(-100%)',
                                                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                borderRadius: '0',
                                                borderLeft: '1px solid #f8fafc',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Sidebar Header */}
                                            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Status Pengajuan</h3>
                                                <button onClick={() => setIsMenuListOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', padding: '6px 12px', borderRadius: '8px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                    <i className="fa-solid fa-arrow-left"></i> Kembali
                                                </button>
                                            </div>

                                            {/* Scrollable Status Pengajuan Content */}
                                            <div style={{ overflowY: 'auto', flex: 1 }}>
                                                <div style={{ padding: '12px 0' }}>
                                                    {pengajuanData.length === 0 ? (
                                                        <div style={{ padding: '24px', textAlign: 'center' }}>
                                                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                                <i className="fa-solid fa-inbox" style={{ color: '#cbd5e1', fontSize: '24px' }}></i>
                                                            </div>
                                                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>—</div>
                                                            <div style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5' }}>Belum ada pengajuan PKM.</div>
                                                        </div>
                                                    ) : (
                                                        pengajuanData.map(item => {
                                                            const statusStyle = getStatusPengajuanStyle(item.status);
                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    style={{ padding: '14px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '14px', alignItems: 'center' }}
                                                                >
                                                                    <div style={{
                                                                        width: '44px', height: '44px', borderRadius: '12px',
                                                                        backgroundColor: statusStyle.bg,
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                                    }}>
                                                                        <i className={`fa-solid ${statusStyle.icon}`} style={{ color: statusStyle.color, fontSize: '18px' }}></i>
                                                                    </div>
                                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a', lineHeight: '1.4', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.judul}</div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                                                            <span style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                                                fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px',
                                                                                color: statusStyle.color,
                                                                                backgroundColor: statusStyle.bg,
                                                                                padding: '3px 10px', borderRadius: '20px'
                                                                            }}>
                                                                                <i className={`fa-solid ${statusStyle.icon}`} style={{ fontSize: '10px' }}></i>
                                                                                {statusStyle.label}
                                                                            </span>
                                                                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.tanggal}</span>
                                                                        </div>
                                                                        {item.status === 'ditangguhkan' && (
                                                                            <button
                                                                                onClick={() => { /* TODO: open edit form with item data */ }}
                                                                                style={{
                                                                                    marginTop: '8px', padding: '6px 16px', fontSize: '12px', fontWeight: '600',
                                                                                    color: '#b45309', backgroundColor: '#fef3c7', border: '1px solid #fde68a',
                                                                                    borderRadius: '8px', cursor: 'pointer', display: 'inline-flex',
                                                                                    alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                                                                                }}
                                                                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fde68a'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(180,83,9,0.15)'; }}
                                                                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef3c7'; e.currentTarget.style.boxShadow = 'none'; }}
                                                                            >
                                                                                <i className="fa-solid fa-pen-to-square" style={{ fontSize: '11px' }}></i>
                                                                                Edit Pengajuan
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <MapContainer center={[-2.5, 118]} zoom={5} minZoom={4} maxBounds={[[-15, 90], [10, 145]]} className="map-container">
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            {pkmData.map((pkm) => (
                                                <Marker
                                                    key={pkm.id}
                                                    position={[pkm.lat, pkm.lng]}
                                                    icon={createCustomIcon(pkm.status)}
                                                    eventHandlers={{ click: () => handleMarkerClick(pkm) }}
                                                />
                                            ))}
                                            <MapEvents
                                                isPickingLocation={isPickingLocation}
                                                onLocationPicked={onLocationPicked}
                                                setSidebarPkm={setSidebarPkm}
                                            />
                                        </MapContainer>

                                        {/* Premium Fintech Map Legend Overlay */}
                                        <div className="fintech-map-legend">
                                            <div className="legend-title">LEGENDA:</div>
                                            <div className="legend-item">
                                                <span className="legend-icon" style={{ backgroundColor: '#16a34a' }}></span>
                                                <span className="legend-text">PKM Selesai</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="legend-icon" style={{ backgroundColor: '#f59e0b' }}></span>
                                                <span className="legend-text">PKM Berlangsung</span>
                                            </div>
                                        </div>

                                        <div className={`map-overlay ${sidebarPkm || isMenuListOpen ? 'active' : ''}`} onClick={() => { setSidebarPkm(null); setIsMenuListOpen(false); }}></div>

                                        <aside className={`sidebar ${!sidebarPkm ? 'sidebar-hidden' : ''}`}>
                                            <div className="dashboard-content" style={{ position: 'relative' }}>
                                                {sidebarPkm && (
                                                    <>
                                                        <button
                                                            onClick={() => setSidebarPkm(null)}
                                                            style={{ position: 'absolute', top: '36px', right: '36px', zIndex: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#475569', transition: 'all 0.2s' }}
                                                            title={isMenuListOpen ? "Kembali ke Daftar" : "Tutup Detail"}
                                                        >
                                                            <i className={`fa-solid ${isMenuListOpen ? "fa-arrow-left" : "fa-xmark"}`} style={{ fontSize: '16px' }}></i>
                                                        </button>
                                                        <div className="location-card">
                                                            <div
                                                                className={`card-image-wrapper ${sidebarPkm.thumbnail ? 'has-image' : ''}`}
                                                                style={sidebarPkm.thumbnail ? { backgroundImage: `url(${sidebarPkm.thumbnail})` } : {}}
                                                            >
                                                                {!sidebarPkm.thumbnail && <i className="fa-solid fa-image"></i>}
                                                            </div>

                                                            <div className="card-body">
                                                                <div className="card-header-flex">
                                                                    <h2 className="card-title">{sidebarPkm.nama}</h2>
                                                                    <span className="card-year">{sidebarPkm.tahun}</span>
                                                                </div>

                                                                <div className={`card-status ${getStatusBadge(sidebarPkm.status)}`}>
                                                                    <i className={`fa-solid ${getStatusIcon(sidebarPkm.status)}`}></i> {getStatusText(sidebarPkm.status)}
                                                                </div>

                                                                <p className="card-description">{sidebarPkm.deskripsi}</p>

                                                                <DocumentationGallery status={sidebarPkm.status} />
                                                                <TestimonialSidebarDisplay status={sidebarPkm.status} />

                                                                <div className="card-location">
                                                                    <i className="fa-solid fa-map-pin"></i> {sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan},{' '}
                                                                    {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}
                                                                </div>

                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </aside>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 2. Data Visualization Charts Column (Right Side) */}
                    <div className={`landing-charts-column ${mobileActiveTab !== 'dashboard' ? 'mobile-hidden' : ''}`}>
                        <LandingCharts extraContent={<DosenSubmissionCard />} />
                    </div>
                </div>

                {/* Mobile Bottom Sheet — Location Detail */}
                <BottomSheet
                    isOpen={mobileBottomSheet === 'detail'}
                    onClose={() => { closeMobileBottomSheet(); setSidebarPkm(null); }}
                    title={sidebarPkm?.nama}
                >
                    {sidebarPkm && (
                        <div className="mobile-detail-content">
                            <div className="mobile-detail-image" style={sidebarPkm.thumbnail ? { backgroundImage: `url(${sidebarPkm.thumbnail})` } : {}}>
                                {!sidebarPkm.thumbnail && <i className="fa-solid fa-image" style={{ fontSize: '2rem', color: '#cbd5e1' }}></i>}
                            </div>
                            <div className="mobile-detail-body">
                                <div className="mobile-detail-meta">
                                    <span className={`card-status ${getStatusBadge(sidebarPkm.status)}`}>
                                        <i className={`fa-solid ${getStatusIcon(sidebarPkm.status)}`}></i> {getStatusText(sidebarPkm.status)}
                                    </span>
                                    <span className="card-year">{sidebarPkm.tahun}</span>
                                </div>
                                <p className="mobile-detail-desc">{sidebarPkm.deskripsi}</p>

                                <DocumentationGallery status={sidebarPkm.status} />
                                <TestimonialSidebarDisplay status={sidebarPkm.status} />

                                <div className="mobile-detail-location">
                                    <i className="fa-solid fa-map-pin"></i>
                                    <span>{sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan}, {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}</span>
                                </div>
                                <div className="mobile-detail-actions">
                                    <button className="mobile-action-btn primary" onClick={() => window.open(`https://maps.google.com/?q=${sidebarPkm.lat},${sidebarPkm.lng}`)}>
                                        <i className="fa-solid fa-location-arrow"></i> Rute
                                    </button>
                                    <button className="mobile-action-btn secondary" onClick={() => sidebarPkm.laporan && window.open(sidebarPkm.laporan)} disabled={!sidebarPkm.laporan}>
                                        <i className="fa-solid fa-file-alt"></i> Laporan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </BottomSheet>

                {/* Mobile Bottom Sheet — Daftar Kegiatan */}
                <BottomSheet
                    isOpen={mobileBottomSheet === 'kegiatan'}
                    onClose={closeMobileBottomSheet}
                    title="Kegiatan Saya"
                >
                    <div className="mobile-kegiatan-list">
                        {pkmData.map((pkm) => (
                            <div
                                key={pkm.id}
                                className="mobile-kegiatan-item"
                                onClick={() => {
                                    setSidebarPkm(pkm);
                                    setMobileBottomSheet('detail');
                                    setMobileActiveTab('peta');
                                }}
                            >
                                <div className="mobile-kegiatan-thumb" style={pkm.thumbnail ? { backgroundImage: `url(${pkm.thumbnail})` } : {}}>
                                    {!pkm.thumbnail && <i className="fa-solid fa-image" style={{ color: '#cbd5e1', fontSize: '20px' }}></i>}
                                </div>
                                <div className="mobile-kegiatan-info">
                                    <div className="mobile-kegiatan-name">{pkm.nama}</div>
                                    <div className="mobile-kegiatan-loc">
                                        <i className="fa-solid fa-location-dot"></i> {pkm.desa}, Kec. {pkm.kecamatan}
                                    </div>
                                    <div className="mobile-kegiatan-status">
                                        <span className={`status-dot ${pkm.status}`}></span>
                                        <span>{pkm.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </BottomSheet>

                {/* Mobile Bottom Tab Bar */}
                <MobileTabBar activeTab={mobileActiveTab} onTabChange={handleMobileTabChange} />

                {/* Submit Link Dokumentasi & Laporan Modal */}
                {isLinkModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Submit Link Dokumentasi & Laporan</h2>
                                <button className="close-btn" onClick={() => { setIsLinkModalOpen(false); setLinkFormSubmitted(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            {linkFormSubmitted ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                        <i className="fa-solid fa-check" style={{ color: '#16a34a', fontSize: '32px' }}></i>
                                    </div>
                                    <h3 style={{ fontWeight: '700', fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>Link Berhasil Dikirim!</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b' }}>Data kegiatan telah diperbarui.</p>
                                </div>
                            ) : (
                                <form className="modal-body" onSubmit={handleLinkFormSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="linkPkmIdDosen">Pilih Kegiatan</label>
                                        <select
                                            id="linkPkmIdDosen"
                                            value={linkFormData.pkmId}
                                            onChange={(e) => handleLinkFormChange('pkmId', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Pilih Kegiatan --</option>
                                            {pkmData.map(pkm => (
                                                <option key={pkm.id} value={pkm.id}>{pkm.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="linkDokumentasiDosen">Link Dokumentasi</label>
                                        <input
                                            type="url"
                                            id="linkDokumentasiDosen"
                                            value={linkFormData.linkDokumentasi}
                                            onChange={(e) => handleLinkFormChange('linkDokumentasi', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="linkLaporanDosen">Link Laporan</label>
                                        <input
                                            type="url"
                                            id="linkLaporanDosen"
                                            value={linkFormData.linkLaporan}
                                            onChange={(e) => handleLinkFormChange('linkLaporan', e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                        />
                                    </div>
                                </form>
                            )}

                            {!linkFormSubmitted && (
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => { setIsLinkModalOpen(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                        Batal
                                    </button>
                                    <button type="button" className="btn-primary" onClick={handleLinkFormSubmit}>
                                        <i className="fa-solid fa-paper-plane"></i> Kirim Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
