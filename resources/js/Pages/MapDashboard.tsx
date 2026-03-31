import React, { useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Layout from '@/Layouts/DefaultLayout';
import ActionFeedbackDialog from '@/Components/ActionFeedbackDialog';
import { FeedbackDialogProps } from '@/types';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const getStatusBadge = (status: string): string => status === 'berlangsung' ? 'status-open' : 'status-closed';
const getStatusIcon = (status: string): string => status === 'berlangsung' ? 'fa-spinner fa-spin' : 'fa-check-double';
const getStatusText = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

interface PkmData {
    id: number;
    nama: string;
    tahun: number;
    status: 'berlangsung' | 'selesai';
    deskripsi: string;
    thumbnail?: string;
    laporan?: string;
    dokumentasi?: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: string;
    lng: string;
}

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

export default function MapDashboard(): JSX.Element {
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
            lat: '-5.135',
            lng: '119.495',
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
            lat: '-5.13',
            lng: '119.485',
        },
    ]);

    const [sidebarPkm, setSidebarPkm] = useState<PkmData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [isModalHiddenTemporarily, setIsModalHiddenTemporarily] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState<FeedbackDialogProps>({ show: false, type: 'success', title: '', message: '' });
    const [formData, setFormData] = useState<FormData>({
        id: null,
        nama: '',
        tahun: 2026,
        status: 'berlangsung',
        deskripsi: '',
        thumbnail: '',
        laporan: '',
        dokumentasi: '',
        provinsi: '',
        kabupaten: '',
        kecamatan: '',
        desa: '',
        lat: '',
        lng: '',
    });
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
            id: null,
            nama: '',
            tahun: 2026,
            status: 'berlangsung',
            deskripsi: '',
            thumbnail: '',
            laporan: '',
            dokumentasi: '',
            provinsi: '',
            kabupaten: '',
            kecamatan: '',
            desa: '',
            lat: '',
            lng: '',
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
        if (!file) {
            return;
        }

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

    return (
        <Layout>
            <div className={`map-picking-mode-container ${isPickingLocation ? 'map-picking-mode' : ''}`}>
                <section className="page-header-container">
                    <div className="page-header-content">
                        <h1>PETA SEBARAN P3M</h1>
                        <div className="breadcrumbs" aria-label="Breadcrumb">
                            <span
                                className="home"
                                onClick={() => {
                                    window.location.href = 'https://p3m.poltekparmakassar.ac.id/';
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                Home
                            </span>
                            <span>&raquo;</span>
                            <span className="current">Peta Sebaran P3M</span>
                        </div>
                    </div>
                </section>

                <section className="map-section-boxed">
                    <div className="map-wrapper-boxed">
                        <MapContainer center={[-5.132, 119.49]} zoom={15} className="map-container">
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

                        <div className={`map-overlay ${sidebarPkm ? 'active' : ''}`} onClick={() => setSidebarPkm(null)}></div>

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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </section>
            </div>

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
                            {hasStartedDataEntry && dataEntryIssues.length > 0 && (
                                <div className="form-validation-alert" style={{ width: '100%', marginTop: 0, marginBottom: '12px' }}>
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                    <div>
                                        <strong>Data belum bisa disimpan</strong>
                                        <p>{dataEntryIssues[0]}</p>
                                    </div>
                                </div>
                            )}
                            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                                Batal
                            </button>
                            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={dataEntryIssues.length > 0}>
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
        </Layout>
    );
}
