import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import MobileTabBar from '@/Components/MobileTabBar';
import BottomSheet from '@/Components/BottomSheet';

export interface PkmData {
    id: number | null;
    nama: string;
    tahun: number;
    status: string;
    deskripsi: string;
    thumbnail: string | null;
    laporan: string;
    dokumentasi: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: number | string;
    lng: number | string;
}

// Leaflet Setup
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status: string) => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status: string) => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status: string) => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const createCustomIcon = (status: string) => {
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

function MapEvents({ isPickingLocation, onLocationPicked, setSidebarPkm }: { isPickingLocation: boolean, onLocationPicked: Function, setSidebarPkm: Function }) {
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

// ----------------------------------------------------
// Map Search Widget Component
// ----------------------------------------------------

interface MapSearchWidgetProps {
    pkmData: PkmData[];
    onSelectPkm: (pkm: PkmData) => void;
    isHidden: boolean;
}

const MapSearchWidget = ({ pkmData, onSelectPkm, isHidden }: MapSearchWidgetProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = pkmData.filter((pkm: PkmData) =>
        pkm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkm.deskripsi && pkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="map-search-widget" style={{
            position: 'absolute', top: '24px', left: '80px', zIndex: 1000, width: '380px', maxWidth: 'calc(100vw - 100px)',
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
                            {filteredData.map((pkm: PkmData) => (
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

// ----------------------------------------------------
// Main Landing Page Component
// ----------------------------------------------------

export default function LandingPage() {
    const [pkmData, setPkmData] = useState<PkmData[]>([
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

    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);
    const [isMenuListOpen, setIsMenuListOpen] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState('peta');
    const [mobileBottomSheet, setMobileBottomSheet] = useState<'detail' | 'kegiatan' | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isModalHiddenTemporarily, setIsModalHiddenTemporarily] = useState(false);
    const [formData, setFormData] = useState<PkmData>({
        id: null, nama: '', tahun: 2026, status: 'berlangsung', deskripsi: '', thumbnail: '', laporan: '', dokumentasi: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', lat: '', lng: '',
    });

    const handleMarkerClick = (pkm: PkmData) => {
        if (window.innerWidth <= 768) {
            setSidebarPkm(pkm);
            setMobileBottomSheet('detail');
        } else {
            setSidebarPkm(pkm);
        }
    };

    const handleMobileTabChange = (tabId: string) => {
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

    const handleEditPKM = (pkm: PkmData) => {
        setFormData(pkm);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsPickingLocation(false);
        setIsModalHiddenTemporarily(false);
        setFormData({
            id: null, nama: '', tahun: 2026, status: 'berlangsung', deskripsi: '', thumbnail: '', laporan: '', dokumentasi: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', lat: '', lng: '',
        });
    };

    const handlePickLocation = () => {
        setIsPickingLocation(true);
        setIsModalHiddenTemporarily(true);
    };

    const onLocationPicked = (latlng: any) => {
        setFormData((prev) => ({
            ...prev,
            lat: latlng.lat.toFixed(5),
            lng: latlng.lng.toFixed(5),
        }));
        setIsPickingLocation(false);
        setIsModalHiddenTemporarily(false);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result as string | null;
            if (result) {
                setFormData((prev) => ({ ...prev, thumbnail: result }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (!formData.id && !formData.thumbnail) {
            alert('Silakan pilih thumbnail gambar terlebih dahulu.');
            return;
        }

        if (formData.id) {
            setPkmData((prev) => prev.map((item) => (item.id === formData.id ? { ...formData } : item)));
            setSidebarPkm(null);
        } else {
            setPkmData((prev) => [...prev, { ...formData, id: Date.now() }]);
        }

        handleCloseModal();
        setIsSuccessModalOpen(true);
    };

    return (
        <Layout>
            <Head title="Beranda - P3M Poltekpar Makassar" />

            <div className="landing-page">
                {/* 1. Interactive Map Section */}
                <section className="py-16 md:py-24 container mx-auto px-4" id="peta-sebaran">
                    <div className="text-center mb-10 md:mb-16">
                        <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">Pemetaan Publik</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 mb-4">Peta Sebaran Kegiatan</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">Eksplorasi interaktif pergerakan dan distribusi kegiatan pengabdian kami di seluruh wilayah.</p>
                    </div>

                    <div className={`map-picking-mode-container ${isPickingLocation ? 'map-picking-mode' : ''}`}>
                        <div className="landing-map-wrapper map-section-boxed">
                            <div className="map-wrapper-boxed" style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>

                                <MapSearchWidget pkmData={pkmData} onSelectPkm={(pkm: PkmData) => setSidebarPkm(pkm)} isHidden={!!sidebarPkm || isMenuListOpen} />

                                {/* Hamburger Menu Button */}
                                <div style={{
                                    position: 'absolute', top: '24px', left: '24px', zIndex: 1000,
                                    opacity: (!!sidebarPkm || isMenuListOpen) ? 0 : 1,
                                    pointerEvents: (!!sidebarPkm || isMenuListOpen) ? 'none' : 'auto',
                                    transform: (!!sidebarPkm || isMenuListOpen) ? 'translateY(-20px)' : 'translateY(0)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}>
                                    <button
                                        className="hamburger-menu-btn"
                                        onClick={() => setIsMenuListOpen(!isMenuListOpen)}
                                        style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: '#0f172a' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <i className={`fa-solid ${isMenuListOpen ? 'fa-xmark' : 'fa-bars'}`} style={{ fontSize: '20px' }}></i>
                                    </button>
                                </div>

                                {/* Hamburger Menu List Panel - Now a Left Sidebar */}
                                <div
                                    className="left-sidebar-menu"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 1005,
                                        width: '360px',
                                        height: '100%',
                                        backgroundColor: 'white',
                                        boxShadow: '10px 0 30px rgba(15, 23, 42, 0.08)',
                                        transform: isMenuListOpen ? 'translateX(0)' : 'translateX(-100%)',
                                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: '0 24px 24px 0',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#0f172a' }}>Daftar Kegiatan</h3>
                                        <button
                                            onClick={() => setIsMenuListOpen(false)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    </div>
                                    <div style={{ overflowY: 'auto', flex: 1, padding: '0' }}>
                                        {pkmData.map((pkm: PkmData) => (
                                            <div
                                                key={pkm.id}
                                                onClick={() => {
                                                    setSidebarPkm(pkm);
                                                    setIsMenuListOpen(false);
                                                }}
                                                style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <div
                                                    style={{
                                                        width: '72px',
                                                        height: '72px',
                                                        borderRadius: '12px',
                                                        backgroundColor: '#f1f5f9',
                                                        flexShrink: 0,
                                                        backgroundImage: pkm.thumbnail ? `url(${pkm.thumbnail})` : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                                                    }}
                                                >
                                                    {!pkm.thumbnail && <i className="fa-solid fa-image" style={{ color: '#cbd5e1', fontSize: '24px' }}></i>}
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                                    <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a', lineHeight: '1.4', marginBottom: '6px' }}>{pkm.nama}</div>
                                                    <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '8px' }}>
                                                        <i className="fa-solid fa-location-dot" style={{ marginRight: '6px', color: '#94a3b8' }}></i>
                                                        {pkm.desa}, Kec. {pkm.kecamatan}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pkm.status === 'berlangsung' ? '#f59e0b' : '#16a34a' }}></span>
                                                        <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pkm.status === 'berlangsung' ? 'Berlangsung' : 'Selesai'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <MapContainer center={[-5.132, 119.49]} zoom={15} className="map-container">
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {pkmData.map((pkm: PkmData) => (
                                        <Marker
                                            key={pkm.id}
                                            position={[Number(pkm.lat), Number(pkm.lng)]}
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

                                <div className={`map-overlay ${sidebarPkm || isMenuListOpen ? 'active' : ''}`} onClick={() => { setSidebarPkm(null); setIsMenuListOpen(false); }}></div>

                                <button className="fab" title="Tambah Data PKM" onClick={() => setIsModalOpen(true)}>
                                    <i className="fa-solid fa-plus"></i>
                                </button>

                                <aside className={`sidebar ${!sidebarPkm ? 'sidebar-hidden' : ''}`}>
                                    <div className="dashboard-content">
                                        {sidebarPkm && (
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

                                                    <div className="card-location">
                                                        <i className="fa-solid fa-map-pin"></i> {sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan},{' '}
                                                        {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}
                                                    </div>

                                                    <div className="card-actions">
                                                        <button
                                                            className="action-button"
                                                            onClick={() => window.open(`https://maps.google.com/?q=${sidebarPkm.lat},${sidebarPkm.lng}`)}
                                                        >
                                                            <i className="fa-solid fa-location-arrow"></i> Rute
                                                        </button>
                                                        {sidebarPkm.laporan ? (
                                                            <button className="action-button laporan" onClick={() => window.open(sidebarPkm.laporan)}>
                                                                <i className="fa-solid fa-file-alt"></i> Laporan
                                                            </button>
                                                        ) : (
                                                            <button className="action-button disabled" disabled>
                                                                <i className="fa-solid fa-file-alt"></i> Laporan
                                                            </button>
                                                        )}
                                                        {sidebarPkm.status === 'selesai' &&
                                                            (sidebarPkm.dokumentasi ? (
                                                                <button
                                                                    className="action-button dokumentasi"
                                                                    onClick={() => window.open(sidebarPkm.dokumentasi)}
                                                                >
                                                                    <i className="fa-solid fa-camera"></i> Dokumentasi
                                                                </button>
                                                            ) : (
                                                                <button className="action-button disabled" disabled>
                                                                    <i className="fa-solid fa-camera"></i> Dokumentasi
                                                                </button>
                                                            ))}
                                                    </div>

                                                    <button className="btn-secondary edit-btn" onClick={() => handleEditPKM(sidebarPkm)}>
                                                        <i className="fa-solid fa-pen"></i> Edit Data
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </aside>
                            </div>
                        </div>
                    </div>
                </section>

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
                    title="Daftar Kegiatan"
                >
                    <div className="mobile-kegiatan-list">
                        {pkmData.map((pkm: PkmData) => (
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

                {/* Data Entry Modals from existing Map structure */}
                {isModalOpen && !isModalHiddenTemporarily && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{formData.id ? 'Edit Data PKM' : 'Tambah Data PKM Baru'}</h2>
                                <button className="close-btn" onClick={handleCloseModal}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form className="modal-body" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="nama">Nama Kegiatan PKM</label>
                                    <input
                                        type="text"
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(event) => setFormData({ ...formData, nama: event.target.value })}
                                        placeholder="Masukkan nama kegiatan"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="tahun">Tahun</label>
                                        <select
                                            id="tahun"
                                            value={formData.tahun}
                                            onChange={(event) => setFormData({ ...formData, tahun: parseInt(event.target.value, 10) })}
                                            required
                                        >
                                            <option value="2024">2024</option>
                                            <option value="2025">2025</option>
                                            <option value="2026">2026</option>
                                            <option value="2027">2027</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="status">Status</label>
                                        <select
                                            id="status"
                                            value={formData.status}
                                            onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                                            required
                                        >
                                            <option value="berlangsung">Berlangsung</option>
                                            <option value="selesai">Selesai</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="deskripsi">Deskripsi</label>
                                    <textarea
                                        id="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={(event) => setFormData({ ...formData, deskripsi: event.target.value })}
                                        placeholder="Deskripsi kegiatan..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thumbnail Gambar</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange} />
                                </div>

                                {formData.thumbnail && (
                                    <img src={formData.thumbnail} alt="Thumbnail Preview" className="thumbnail-preview" />
                                )}

                                <div className="form-section-title">
                                    Lokasi <span className="hint-text">(Klik tombol di bawah untuk memilih dari peta)</span>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="provinsi">Provinsi</label>
                                        <input
                                            type="text"
                                            id="provinsi"
                                            value={formData.provinsi}
                                            onChange={(event) => setFormData({ ...formData, provinsi: event.target.value })}
                                            placeholder="Contoh: Sulawesi Selatan"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="kabupaten">Kabupaten/Kota</label>
                                        <input
                                            type="text"
                                            id="kabupaten"
                                            value={formData.kabupaten}
                                            onChange={(event) => setFormData({ ...formData, kabupaten: event.target.value })}
                                            placeholder="Contoh: Makassar"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="kecamatan">Kecamatan</label>
                                        <input
                                            type="text"
                                            id="kecamatan"
                                            value={formData.kecamatan}
                                            onChange={(event) => setFormData({ ...formData, kecamatan: event.target.value })}
                                            placeholder="Contoh: Tamalanrea"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="desa">Desa/Kelurahan</label>
                                        <input
                                            type="text"
                                            id="desa"
                                            value={formData.desa}
                                            onChange={(event) => setFormData({ ...formData, desa: event.target.value })}
                                            placeholder="Contoh: Bira"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="lat">Latitude</label>
                                        <input
                                            type="text"
                                            id="lat"
                                            value={formData.lat}
                                            onChange={(event) => setFormData({ ...formData, lat: event.target.value })}
                                            placeholder="-5.13500"
                                            readOnly
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="lng">Longitude</label>
                                        <input
                                            type="text"
                                            id="lng"
                                            value={formData.lng}
                                            onChange={(event) => setFormData({ ...formData, lng: event.target.value })}
                                            placeholder="119.49500"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <button type="button" className="btn-pick-map" onClick={handlePickLocation}>
                                    <i className="fa-solid fa-map-pin"></i> Pilih Lokasi dari Peta
                                </button>

                                <div className="form-section-title">Informasi Tambahan</div>

                                <div className="form-group">
                                    <label htmlFor="laporan">Link Laporan (Opsional)</label>
                                    <input
                                        type="url"
                                        id="laporan"
                                        value={formData.laporan}
                                        onChange={(event) => setFormData({ ...formData, laporan: event.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dokumentasi">Link Dokumentasi (Opsional)</label>
                                    <input
                                        type="url"
                                        id="dokumentasi"
                                        value={formData.dokumentasi}
                                        onChange={(event) => setFormData({ ...formData, dokumentasi: event.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                    Batal
                                </button>
                                <button type="button" className="btn-primary" onClick={handleSubmit}>
                                    <i className="fa-solid fa-save"></i> Simpan Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isPickingLocation && (
                    <div className="picking-toast">
                        <i className="fa-solid fa-hand-pointer"></i> Klik lokasi pada peta... (Tekan <b>ESC</b> untuk batal)
                    </div>
                )}

                {isSuccessModalOpen && (
                    <div className="modal-overlay" style={{ zIndex: 3000 }}>
                        <div className="success-content">
                            <div className="success-icon-container">
                                <i className="fa-solid fa-check success-check"></i>
                            </div>
                            <h2 style={{ fontSize: '1.625rem', fontWeight: 700, margin: '0 0 12px 0' }}>Berhasil!</h2>
                            <p style={{ color: '#64748b', marginBottom: '32px' }}>Data PKM berhasil disimpan ke peta.</p>
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsSuccessModalOpen(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
