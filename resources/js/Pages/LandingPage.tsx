import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import LandingCharts from '@/Components/LandingCharts';
import MapLegend from '@/Components/MapLegend';
import DocumentationGallery from '@/Components/DocumentationGallery';
import LandingPageMobile from '@/Components/LandingPageMobile';
import TestimonialSidebarDisplay from '@/Components/TestimonialSidebarDisplay';
import ActionFeedbackDialog from '@/Components/ActionFeedbackDialog';
import CTABanner from '@/Components/CTABanner';
import { resolvePublicPkmData } from '@/data/sigapData';
import { createPkmMarkerIcon } from '@/data/pkmMapVisuals';
import { PkmData, FeedbackDialogProps } from '@/types';

import '../../css/landing.css';
import '../../css/navbar.css';

// Leaflet Setup
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status: string): string => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status: string): string => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

interface MapEventsProps {
    isPickingLocation: boolean;
    onLocationPicked: (latlng: L.LatLng) => void;
    setSidebarPkm: React.Dispatch<React.SetStateAction<PkmData | null>>;
}

function MapEvents({ isPickingLocation, onLocationPicked, setSidebarPkm }: MapEventsProps): null {
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

interface MapSizeInvalidatorProps {
    watchKey: string;
}

function MapSizeInvalidator({ watchKey }: MapSizeInvalidatorProps): null {
    const map = useMap();

    useEffect(() => {
        const runInvalidate = () => {
            map.invalidateSize({ animate: false, pan: false });
        };

        const frameId = window.requestAnimationFrame(runInvalidate);
        const timeoutId = window.setTimeout(runInvalidate, 180);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.clearTimeout(timeoutId);
        };
    }, [map, watchKey]);

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

const MapSearchWidget: React.FC<MapSearchWidgetProps> = ({ pkmData, onSelectPkm, isHidden }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = pkmData.filter(pkm =>
        pkm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkm.deskripsi && pkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="map-search-widget" style={{
            position: 'absolute', top: '18px', left: '18px', zIndex: 1000, width: '360px', maxWidth: 'calc(100vw - 48px)',
            opacity: isHidden ? 0 : 1,
            pointerEvents: isHidden ? 'none' : 'auto',
            transform: isHidden ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div className="relative bg-white rounded-xl shadow-lg flex items-center p-3 border border-gray-200">
                <i className="fa-solid fa-search text-blue-600 mr-3 text-lg"></i>
                <input
                    type="text"
                    placeholder="Cari lokasi kegiatan P3M..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="border-none outline-none w-full text-base font-medium text-gray-900"
                />
                {searchQuery && (
                    <i className="fa-solid fa-xmark cursor-pointer text-gray-400 ml-3 text-base" onClick={() => { setSearchQuery(''); setIsOpen(false); }}></i>
                )}
            </div>

            {isOpen && searchQuery && (
                <div className="mt-2 bg-white rounded-xl shadow-xl max-h-[350px] overflow-y-auto overflow-x-hidden border border-gray-200">
                    {filteredData.length > 0 ? (
                        <div className="py-2">
                            {filteredData.map(pkm => (
                                <div
                                    key={pkm.id}
                                    onClick={() => {
                                        onSelectPkm(pkm);
                                        setIsOpen(false);
                                        setSearchQuery(pkm.nama);
                                    }}
                                    className="px-5 py-3 border-b border-gray-100 cursor-pointer flex flex-col gap-1 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="font-semibold text-[14.5px] text-gray-900 leading-tight">{pkm.nama}</div>
                                    <div className="text-[12.5px] text-gray-500"><i className="fa-solid fa-location-dot mr-1.5 text-gray-400"></i>{pkm.desa}, {pkm.kecamatan}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 text-sm">
                            <i className="fa-solid fa-magnifying-glass-minus text-2xl text-gray-300 mb-3 block"></i>
                            Tidak ada hasil ditemukan untuk <b>"{searchQuery}"</b>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface MapSummaryOverlayProps {
    totalPkm: number;
    totalSelesai: number;
    totalBerlangsung: number;
    isHidden: boolean;
}

const MapSummaryOverlay: React.FC<MapSummaryOverlayProps> = ({ totalPkm, totalSelesai, totalBerlangsung, isHidden }) => (
    <div className={`landing-map-info-overlay ${isHidden ? 'is-hidden' : ''}`} aria-label="Ringkasan peta PKM">
        <MapLegend className="landing-map-legend-card" />

        <div className="landing-map-floating-stats">
            <div className="landing-map-stat-card compact">
                <span className="landing-map-stat-label">Total PKM</span>
                <strong className="landing-map-stat-value">{totalPkm}</strong>
            </div>
            <div className="landing-map-stat-card compact">
                <span className="landing-map-stat-label">PKM Selesai</span>
                <strong className="landing-map-stat-value">{totalSelesai}</strong>
            </div>
            <div className="landing-map-stat-card compact">
                <span className="landing-map-stat-label">PKM Berlangsung</span>
                <strong className="landing-map-stat-value">{totalBerlangsung}</strong>
            </div>
        </div>
    </div>
);

interface FormData {
    id: number | null;
    nama: string;
    tahun: number;
    status: 'berlangsung' | 'selesai';
    deskripsi: string;
    thumbnail: string;
    laporan: string;
    dokumentasi: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: string;
    lng: string;
}

interface LinkFormData {
    pkmId: string;
    linkDokumentasi: string;
    linkLaporan: string;
}

interface LandingPageProps {
    publicPkmData?: PkmData[] | null;
}

// ----------------------------------------------------
// Main Landing Page Component
// ----------------------------------------------------

export default function LandingPage({ publicPkmData = null }: LandingPageProps) {
    const [isMobileViewport, setIsMobileViewport] = useState(() => (
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
    ));
    const [pkmData, setPkmData] = useState<PkmData[]>(() => resolvePublicPkmData(publicPkmData));

    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isModalHiddenTemporarily, setIsModalHiddenTemporarily] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogProps>({ show: false, type: 'success', title: '', message: '' });
    const [formData, setFormData] = useState<FormData>({
        id: null, nama: '', tahun: 2026, status: 'berlangsung', deskripsi: '', thumbnail: '', laporan: '', dokumentasi: '', provinsi: '', kabupaten: '', kecamatan: '', desa: '', lat: '', lng: '',
    });

    // Accordion & Link Form states
    const [expandedSection, setExpandedSection] = useState<'kegiatan' | null>(null);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkFormData, setLinkFormData] = useState<LinkFormData>({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });

    const toggleSection = (section: 'kegiatan') => {
        setExpandedSection(prev => prev === section ? null : section);
    };

    const handleLinkFormChange = (field: keyof LinkFormData, value: string) => {
        setLinkFormData(prev => ({ ...prev, [field]: value }));
    };

    const dataEntryIssues: string[] = [];
    if (!formData.nama.trim()) dataEntryIssues.push('Nama kegiatan PKM wajib diisi.');
    if (!String(formData.tahun).trim()) dataEntryIssues.push('Tahun kegiatan wajib dipilih.');
    if (!formData.status) dataEntryIssues.push('Status kegiatan wajib dipilih.');
    if (!formData.deskripsi.trim()) dataEntryIssues.push('Deskripsi kegiatan wajib diisi.');
    if (!formData.id && !formData.thumbnail) dataEntryIssues.push('Thumbnail gambar wajib dipilih untuk data PKM baru.');
    if (!formData.provinsi.trim()) dataEntryIssues.push('Provinsi wajib diisi.');
    if (!formData.kabupaten.trim()) dataEntryIssues.push('Kabupaten atau kota wajib diisi.');
    if (!formData.kecamatan.trim()) dataEntryIssues.push('Kecamatan wajib diisi.');
    if (!formData.desa.trim()) dataEntryIssues.push('Desa atau kelurahan wajib diisi.');
    if (!String(formData.lat).trim() || !String(formData.lng).trim()) dataEntryIssues.push('Lokasi pada peta wajib dipilih terlebih dahulu.');
    const hasStartedDataEntry = Boolean(
        formData.nama.trim() ||
        formData.deskripsi.trim() ||
        formData.thumbnail ||
        formData.provinsi.trim() ||
        formData.kabupaten.trim() ||
        formData.kecamatan.trim() ||
        formData.desa.trim() ||
        String(formData.lat).trim() ||
        String(formData.lng).trim()
    );

    const linkSubmissionIssues: string[] = [];
    if (!linkFormData.pkmId) linkSubmissionIssues.push('Pilih kegiatan PKM terlebih dahulu.');
    if (!linkFormData.linkDokumentasi.trim() && !linkFormData.linkLaporan.trim()) linkSubmissionIssues.push('Isi minimal satu tautan dokumentasi atau laporan sebelum mengirim.');
    const hasStartedLinkSubmission = Boolean(linkFormData.pkmId || linkFormData.linkDokumentasi.trim() || linkFormData.linkLaporan.trim());

    const handleLinkFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (linkSubmissionIssues.length > 0) {
            setFeedbackDialog({
                show: true,
                type: 'error',
                title: 'Link Belum Bisa Dikirim',
                message: linkSubmissionIssues[0],
            });
            return;
        }
        // Update the pkmData with the submitted links
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
        setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' });
        setIsLinkModalOpen(false);
        setFeedbackDialog({
            show: true,
            type: 'success',
            title: 'Link Berhasil Dikirim',
            message: 'Tautan dokumentasi dan laporan sudah berhasil diperbarui pada kegiatan PKM terkait.',
        });
    };

    const handleMarkerClick = (pkm: PkmData) => {
        setSidebarPkm(pkm);
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

    const onLocationPicked = (latlng: L.LatLng) => {
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
            setFormData((prev) => ({ ...prev, thumbnail: loadEvent.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (dataEntryIssues.length > 0) {
            setFeedbackDialog({
                show: true,
                type: 'error',
                title: 'Data Belum Bisa Disimpan',
                message: dataEntryIssues[0],
            });
            return;
        }

        if (formData.id) {
            setPkmData((prev) => prev.map((item) => (item.id === formData.id ? { ...formData } : item)));
            setSidebarPkm(null);
        } else {
            setPkmData((prev) => [...prev, { ...formData, id: Date.now() } as PkmData]);
        }

        handleCloseModal();
        setFeedbackDialog({
            show: true,
            type: 'success',
            title: 'Data Berhasil Disimpan',
            message: 'Data PKM berhasil disimpan ke peta dan siap ditampilkan pada dashboard.',
        });
    };

    const totalPkm = pkmData.length;
    const totalSelesai = pkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = pkmData.filter((item) => item.status === 'berlangsung').length;

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateViewport = (event: MediaQueryListEvent) => {
            setIsMobileViewport(event.matches);
        };

        setIsMobileViewport(mediaQuery.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', updateViewport);
            return () => mediaQuery.removeEventListener('change', updateViewport);
        }

        mediaQuery.addListener(updateViewport);
        return () => mediaQuery.removeListener(updateViewport);
    }, []);

    if (isMobileViewport) {
        return (
            <Layout
                mainClassName="site-main-content site-main-content--landing-balanced"
                mainStyle={{ flex: '0 0 auto' }}
            >
                <Head title="Beranda - P3M Poltekpar Makassar" />
                <LandingPageMobile pkmData={pkmData} />
            </Layout>
        );
    }

    return (
        <Layout
            mainClassName="site-main-content site-main-content--landing-balanced"
            mainStyle={{ flex: '0 0 auto' }}
        >
            <Head title="Beranda - P3M Poltekpar Makassar" />

            <div className="landing-page">
                <div className="landing-map-row">
                    <section className="fintech-map-section landing-map-panel" id="peta-sebaran">
                        <div className="fintech-panel-header">
                            <h2 className="fintech-panel-title">Peta Sebaran Pengabdian PKM <span className="text-blue">Poltekpar Makassar</span></h2>
                        </div>

                        <div className={`landing-map-shell map-picking-mode-container ${isPickingLocation ? 'map-picking-mode' : ''}`}>
                            <div className="map-wrapper-boxed landing-map-canvas" style={{ overflow: 'hidden', position: 'relative' }}>

                                <MapSearchWidget
                                    pkmData={pkmData}
                                    onSelectPkm={(pkm) => {
                                        setSidebarPkm(pkm);
                                    }}
                                    isHidden={!!sidebarPkm}
                                />

                                <MapContainer
                                    center={[-2.5, 118]}
                                    zoom={5}
                                    minZoom={4}
                                    maxBounds={[[-15, 90], [10, 145]]}
                                    className="map-container"
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <MapSizeInvalidator watchKey={`${sidebarPkm?.id ?? 'none'}-${pkmData.length}`} />
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {pkmData.map((pkm) => (
                                        <Marker
                                            key={pkm.id}
                                            position={[pkm.lat, pkm.lng]}
                                            icon={createPkmMarkerIcon(pkm)}
                                            eventHandlers={{ click: () => handleMarkerClick(pkm) }}
                                        />
                                    ))}
                                    <MapEvents
                                        isPickingLocation={isPickingLocation}
                                        onLocationPicked={onLocationPicked}
                                        setSidebarPkm={setSidebarPkm}
                                    />
                                </MapContainer>

                                <MapSummaryOverlay
                                    totalPkm={totalPkm}
                                    totalSelesai={totalSelesai}
                                    totalBerlangsung={totalBerlangsung}
                                    isHidden={!!sidebarPkm}
                                />

                                <div className={`map-overlay ${sidebarPkm ? 'active' : ''}`} onClick={() => setSidebarPkm(null)}></div>


                                <aside className={`sidebar ${!sidebarPkm ? 'sidebar-hidden' : ''}`}>
                                    <div className="dashboard-content" style={{ position: 'relative' }}>
                                        {sidebarPkm && (
                                            <>
                                                <button
                                                    onClick={() => setSidebarPkm(null)}
                                                    className="sidebar-close-button"
                                                    title="Tutup Detail"
                                                >
                                                    <i className="fa-solid fa-xmark" style={{ fontSize: '16px' }}></i>
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
                    </section>
                </div>

                <div className="landing-insight-layout--fullwidth" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 12px 28px', boxSizing: 'border-box' }}>
                    <div className="landing-insight-card landing-dashboard-card">
                        <LandingCharts pkmData={pkmData} />
                    </div>
                </div>

                {/* Dynamic CTA Banner */}
                <CTABanner />

                {/* Mobile Bottom Sheet — Location Detail */}

                {/* Mobile Bottom Sheet — Daftar Kegiatan */}

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

                {/* Submit Link Dokumentasi & Laporan Modal */}
                {isLinkModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Submit Link Dokumentasi & Laporan</h2>
                                <button className="close-btn" onClick={() => { setIsLinkModalOpen(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form className="modal-body" onSubmit={handleLinkFormSubmit}>
                                <div className="form-group">
                                    <label htmlFor="linkPkmId">Pilih Kegiatan</label>
                                    <select
                                        id="linkPkmId"
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
                                    <label htmlFor="linkDokumentasi">Link Dokumentasi</label>
                                    <input
                                        type="url"
                                        id="linkDokumentasi"
                                        value={linkFormData.linkDokumentasi}
                                        onChange={(e) => handleLinkFormChange('linkDokumentasi', e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="linkLaporan">Link Laporan</label>
                                    <input
                                        type="url"
                                        id="linkLaporan"
                                        value={linkFormData.linkLaporan}
                                        onChange={(e) => handleLinkFormChange('linkLaporan', e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>

                                {hasStartedLinkSubmission && linkSubmissionIssues.length > 0 && (
                                    <div className="form-validation-alert" style={{ marginTop: '4px', marginBottom: '0' }}>
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                        <div>
                                            <strong>Link belum bisa dikirim</strong>
                                            <p>{linkSubmissionIssues[0]}</p>
                                        </div>
                                    </div>
                                )}
                            </form>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => { setIsLinkModalOpen(false); setLinkFormData({ pkmId: '', linkDokumentasi: '', linkLaporan: '' }); }}>
                                    Batal
                                </button>
                                <button type="button" className="btn-primary" onClick={handleLinkFormSubmit} disabled={linkSubmissionIssues.length > 0}>
                                    <i className="fa-solid fa-paper-plane"></i> Kirim Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <ActionFeedbackDialog
                    show={feedbackDialog.show}
                    type={feedbackDialog.type}
                    title={feedbackDialog.title}
                    message={feedbackDialog.message}
                    onClose={() => {
                        setFeedbackDialog({ ...feedbackDialog, show: false });
                        setIsSuccessModalOpen(false);
                    }}
                />
            </div>
        </Layout>
    );
}
