import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import MobileTabBar from '@/Components/MobileTabBar';
import BottomSheet from '@/Components/BottomSheet';
import DocumentationGallery from '@/Components/DocumentationGallery';
import TestimonialSidebarDisplay from '@/Components/TestimonialSidebarDisplay';
import LandingCharts from '@/Components/LandingCharts';
import MapLegend from '@/Components/MapLegend';
import LoginDosenMobile from '@/Components/LoginDosenMobile';
import {
    resolveUserPkmData,
    resolveUserSubmissionData,
    resolveUserSubmissionHistory,
} from '@/data/sigapData';
import { createPkmMarkerIcon } from '@/data/pkmMapVisuals';
import { PkmData } from '@/types';
import '../../../css/landing.css';
import '../../../css/lecturer-form.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status: string): string => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status: string): string => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

interface StatusStyle {
    bg: string;
    color: string;
    icon: string;
    label: string;
}

const getStatusPengajuanStyle = (status: string): StatusStyle => {
    switch (status) {
        case 'selesai':
            return { bg: '#dcfce7', color: '#15803d', icon: 'fa-flag-checkered', label: 'Selesai' };
        case 'berlangsung':
            return { bg: '#fef3c7', color: '#b45309', icon: 'fa-person-walking', label: 'Berlangsung' };
        case 'diterima':
        case 'disetujui':
            return { bg: '#dcfce7', color: '#15803d', icon: 'fa-circle-check', label: 'Diterima' };
        case 'diproses':
            return { bg: '#dbeafe', color: '#1d4ed8', icon: 'fa-clock', label: 'Diproses' };
        case 'ditangguhkan':
            return { bg: '#fef3c7', color: '#b45309', icon: 'fa-pause-circle', label: 'Ditangguhkan' };
        case 'ditolak':
            return { bg: '#fee2e2', color: '#b91c1c', icon: 'fa-circle-xmark', label: 'Ditolak' };
        case 'belum_diajukan':
            return { bg: '#f1f5f9', color: '#64748b', icon: 'fa-file-circle-plus', label: 'Belum Diajukan' };
        default:
            return { bg: '#f1f5f9', color: '#64748b', icon: 'fa-circle-info', label: status };
    }
};

const createPengajuanDateLabel = (): string => (
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date())
);

interface MapEventsProps {
    setSidebarPkm: React.Dispatch<React.SetStateAction<PkmData | null>>;
    setIsMenuListOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MapEvents({ setSidebarPkm, setIsMenuListOpen }: MapEventsProps): null {
    useMapEvents({
        click() {
            setSidebarPkm(null);
            setIsMenuListOpen(false);
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

interface MapSearchWidgetProps {
    pkmData: PkmData[];
    onSelectPkm: (pkm: PkmData) => void;
    isHidden: boolean;
}

const MapSearchWidget: React.FC<MapSearchWidgetProps> = ({ pkmData, onSelectPkm, isHidden }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredData = pkmData.filter((pkm) => (
        pkm.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pkm.deskripsi && pkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    ));

    return (
        <div
            className="map-search-widget"
            style={{
                position: 'absolute',
                top: '18px',
                left: '18px',
                zIndex: 1000,
                width: '360px',
                maxWidth: 'calc(100vw - 48px)',
                opacity: isHidden ? 0 : 1,
                pointerEvents: isHidden ? 'none' : 'auto',
                transform: isHidden ? 'translateY(-20px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            <div className="relative bg-white rounded-xl shadow-lg flex items-center p-3 border border-gray-200">
                <i className="fa-solid fa-search text-blue-600 mr-3 text-lg"></i>
                <input
                    type="text"
                    placeholder="Cari lokasi kegiatan P3M..."
                    value={searchQuery}
                    onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="border-none outline-none w-full text-base font-medium text-gray-900"
                />
                {searchQuery && (
                    <i
                        className="fa-solid fa-xmark cursor-pointer text-gray-400 ml-3 text-base"
                        onClick={() => {
                            setSearchQuery('');
                            setIsOpen(false);
                        }}
                    ></i>
                )}
            </div>

            {isOpen && searchQuery && (
                <div className="mt-2 bg-white rounded-xl shadow-xl max-h-[350px] overflow-y-auto overflow-x-hidden border border-gray-200">
                    {filteredData.length > 0 ? (
                        <div className="py-2">
                            {filteredData.map((pkm) => (
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
                                    <div className="text-[12.5px] text-gray-500">
                                        <i className="fa-solid fa-location-dot mr-1.5 text-gray-400"></i>
                                        {pkm.desa}, {pkm.kecamatan}
                                    </div>
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

interface PengajuanData {
    id: number;
    judul: string;
    ringkasan: string;
    tanggal: string;
    status: string;
}

interface StatusPengajuanPanelProps {
    isOpen: boolean;
    onClose: () => void;
    pengajuanData: PengajuanData[];
}

const StatusPengajuanPanel: React.FC<StatusPengajuanPanelProps> = ({ isOpen, onClose, pengajuanData }) => (
    <div className={`left-sidebar-menu dosen-status-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="dosen-status-sidebar-header">
            <div>
                <h3>Status Pengajuan</h3>
                <p>Monitoring pengajuan PKM dosen yang telah Anda kirim.</p>
            </div>
            <button type="button" className="dosen-status-sidebar-close" onClick={onClose}>
                <i className="fa-solid fa-arrow-left"></i>
                Kembali
            </button>
        </div>

        <div className="dosen-status-sidebar-body">
            {pengajuanData.length === 0 ? (
                <div className="dosen-status-empty">
                    <span className="dosen-status-empty-icon">
                        <i className="fa-solid fa-inbox"></i>
                    </span>
                    <strong>Belum ada pengajuan PKM</strong>
                    <p>Form di panel kanan bisa langsung digunakan untuk membuat pengajuan PKM baru.</p>
                </div>
            ) : (
                <div className="dosen-status-list">
                    {pengajuanData.map((item) => {
                        const statusStyle = getStatusPengajuanStyle(item.status);
                        return (
                            <div key={item.id} className="dosen-status-item">
                                <span className="dosen-status-icon" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                    <i className={`fa-solid ${statusStyle.icon}`}></i>
                                </span>
                                <div className="dosen-status-content">
                                    <div className="dosen-status-topline">
                                        <strong>{item.judul}</strong>
                                        <span>{item.tanggal}</span>
                                    </div>
                                    <p>{item.ringkasan}</p>
                                    <span className="dosen-status-chip" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                                        <i className={`fa-solid ${statusStyle.icon}`}></i>
                                        {statusStyle.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
);

interface LoginDosenProps {
    userPkmData?: PkmData[] | null;
    userSubmissionData?: PengajuanData[] | null;
    userSubmissionHistory?: PengajuanData[] | null;
}

interface SubmissionData extends PengajuanData {
    status: string;
}

export default function LoginDosen({
    userPkmData = null,
    userSubmissionData = null,
    userSubmissionHistory = null,
}: LoginDosenProps): JSX.Element {
    const [isMobileViewport, setIsMobileViewport] = useState(() => (
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false
    ));
    const [pkmData] = useState<PkmData[]>(() => resolveUserPkmData(userPkmData));
    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);
    const [isMenuListOpen, setIsMenuListOpen] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState<'peta' | 'dashboard' | 'kegiatan'>('peta');
    const [mobileBottomSheet, setMobileBottomSheet] = useState<'detail' | 'kegiatan' | null>(null);
    const [pengajuanData, setPengajuanData] = useState<SubmissionData[]>(() => resolveUserSubmissionData(userSubmissionData, { role: 'dosen' }));
    const [submissionHistoryData] = useState<PengajuanData[]>(() => resolveUserSubmissionHistory(userSubmissionHistory, 'dosen'));

    const handleMarkerClick = (pkm: PkmData) => {
        if (window.innerWidth <= 768) {
            setSidebarPkm(pkm);
            setMobileBottomSheet('detail');
            return;
        }
        setSidebarPkm(pkm);
        setIsMenuListOpen(false);
    };

    const handleMobileTabChange = (tabId: 'peta' | 'dashboard' | 'kegiatan') => {
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

    const totalPkm = pkmData.length;
    const totalSelesai = pkmData.filter((item) => item.status === 'selesai').length;
    const totalBerlangsung = pkmData.filter((item) => item.status === 'berlangsung').length;
    const latestPengajuan = pengajuanData[0] ?? null;
    const hasSubmissionHistory = pengajuanData.length > 0;
    const pengajuanHref = '/pengajuan?role=dosen&view=form';
    const cekStatusHref = hasSubmissionHistory ? '/pengajuan?role=dosen&view=status' : pengajuanHref;
    const currentSubmissionStatus = latestPengajuan?.status ?? 'belum_diajukan';
    const currentPkmStatusData = ['berlangsung', 'selesai'].includes(currentSubmissionStatus)
        ? pkmData.find((item) => item.status === currentSubmissionStatus) ?? null
        : null;

    const handleUpdateLatestPengajuanStatus = (nextStatus: string) => {
        if (nextStatus === 'belum_diajukan') {
            setPengajuanData([]);
            return;
        }

        setPengajuanData((previous) => {
            if (previous.length === 0) {
                return [{
                    id: Date.now(),
                    judul: 'Pengajuan PKM',
                    ringkasan: 'Status diperbarui dari aksi pada akun dosen.',
                    tanggal: createPengajuanDateLabel(),
                    status: nextStatus,
                }];
            }

            return previous.map((item, index) => (
                index === 0
                    ? { ...item, status: nextStatus, tanggal: createPengajuanDateLabel() }
                    : item
            ));
        });
    };

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
                <Head title="Login Dosen - P3M Poltekpar Makassar" />
                <LoginDosenMobile
                    pkmData={pkmData}
                    submissionStatus={currentSubmissionStatus}
                    pkmStatusData={currentPkmStatusData}
                    submissionHistory={submissionHistoryData}
                    onUpdateSubmissionStatus={handleUpdateLatestPengajuanStatus}
                    onSubmitted={(submission: SubmissionData) => {
                        setPengajuanData((previous) => [submission, ...previous]);
                    }}
                />
            </Layout>
        );
    }

    return (
        <Layout
            mainClassName="site-main-content site-main-content--landing-balanced"
            mainStyle={{ flex: '0 0 auto' }}
        >
            <Head title="Login Dosen - P3M Poltekpar Makassar" />

            <div className="landing-page login-dosen-page">
                <div className={`landing-map-row ${mobileActiveTab !== 'peta' ? 'mobile-hidden' : ''}`}>
                    <section className="fintech-map-section landing-map-panel" id="peta-sebaran">
                        <div className="fintech-panel-header">
                            <h2 className="fintech-panel-title">
                                Peta Sebaran Pengabdian PKM <span className="text-blue">Poltekpar Makassar</span>
                            </h2>
                        </div>

                        <div className="landing-map-shell">
                            <div className="map-wrapper-boxed landing-map-canvas" style={{ overflow: 'hidden', position: 'relative' }}>
                                <MapSearchWidget
                                    pkmData={pkmData}
                                    onSelectPkm={(pkm) => {
                                        setSidebarPkm(pkm);
                                        setIsMenuListOpen(false);
                                    }}
                                    isHidden={!!sidebarPkm || isMenuListOpen}
                                />

                                <StatusPengajuanPanel
                                    isOpen={isMenuListOpen}
                                    onClose={() => setIsMenuListOpen(false)}
                                    pengajuanData={pengajuanData}
                                />

                                <MapContainer
                                    center={[-2.5, 118]}
                                    zoom={5}
                                    minZoom={4}
                                    maxBounds={[[-15, 90], [10, 145]]}
                                    className="map-container"
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <MapSizeInvalidator watchKey={`${mobileActiveTab}-${sidebarPkm?.id ?? 'none'}-${isMenuListOpen ? 'menu' : 'closed'}`} />
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
                                    <MapEvents setSidebarPkm={setSidebarPkm} setIsMenuListOpen={setIsMenuListOpen} />
                                </MapContainer>

                                <MapSummaryOverlay
                                    totalPkm={totalPkm}
                                    totalSelesai={totalSelesai}
                                    totalBerlangsung={totalBerlangsung}
                                    isHidden={!!sidebarPkm || isMenuListOpen}
                                />

                                <div
                                    className={`map-overlay ${sidebarPkm || isMenuListOpen ? 'active' : ''}`}
                                    onClick={() => {
                                        setSidebarPkm(null);
                                        setIsMenuListOpen(false);
                                    }}
                                ></div>

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
                                                            <i className="fa-solid fa-map-pin"></i> {sidebarPkm.desa}, Kec. {sidebarPkm.kecamatan}, {sidebarPkm.kabupaten}, {sidebarPkm.provinsi}
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

                <div
                    className={`${mobileActiveTab !== 'dashboard' ? 'mobile-hidden' : ''} landing-insight-layout--fullwidth`}
                    style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 12px 28px', boxSizing: 'border-box' }}
                >
                    <LandingCharts pkmData={pkmData} />
                </div>

                <section className="cta-banner login-dosen-cta" id="cta-pengajuan-dosen">
                    <div className="cta-banner__content">
                        <div className="cta-banner__icon-wrap">
                            <i className="fa-solid fa-paper-plane"></i>
                        </div>
                        <h2 className="cta-banner__title">
                            {hasSubmissionHistory ? 'Kelola pengajuan PKM Anda' : 'Mau melakukan pengajuan PKM?'}
                        </h2>
                        <p className="cta-banner__subtitle">
                            {hasSubmissionHistory
                                ? 'Buka halaman pengajuan untuk membuat pengajuan baru atau cek status untuk melihat pengajuan yang sudah pernah dikirim.'
                                : 'Karena belum ada pengajuan yang tersimpan, tombol pengajuan dan cek status sama-sama akan membuka halaman pengajuan.'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                            <a href={pengajuanHref} className="cta-banner__btn cta-banner__btn--auth">
                                <i className="fa-solid fa-file-circle-plus"></i>
                                <span>Buka Halaman Pengajuan</span>
                            </a>
                            <a
                                href={cekStatusHref}
                                className="cta-banner__btn"
                                style={{
                                    background: hasSubmissionHistory ? '#0f172a' : '#e2e8f0',
                                    color: hasSubmissionHistory ? '#ffffff' : '#334155',
                                }}
                            >
                                <i className="fa-solid fa-magnifying-glass"></i>
                                <span>Cek Status</span>
                            </a>
                        </div>
                    </div>
                </section>

                <BottomSheet
                    isOpen={mobileBottomSheet === 'detail'}
                    onClose={() => {
                        closeMobileBottomSheet();
                        setSidebarPkm(null);
                    }}
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

                <MobileTabBar activeTab={mobileActiveTab} onTabChange={handleMobileTabChange} />
            </div>
        </Layout>
    );
}
