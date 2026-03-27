import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from './Toast';

export default function DosenSubmissionCard() {
    const { data, setData, post, processing: inertiaProcessing, errors, setError, clearErrors, reset } = useForm({
        nama_dosen: '',
        judul_proyek: '',
        lokasi: '',
        dosen_terlibat: [''],
        staff_terlibat: [''],
        mahasiswa_terlibat: [''],
        sumber_dana: '',
        total_RAB: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        proposal: null,
    });

    const handleAddPersonil = (type) => {
        setData(type, [...data[type], '']);
    };

    const handleRemovePersonil = (type, indexToRemove) => {
        const filtered = data[type].filter((_, index) => index !== indexToRemove);
        setData(type, filtered);
    };

    const handlePersonilChange = (type, index, value) => {
        const updated = [...data[type]];
        updated[index] = value;
        setData(type, updated);
    };

    const [mockProcessing, setMockProcessing] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        let hasErrors = false;
        if (!data.judul_proyek) { setError('judul_proyek', 'Judul proyek wajib diisi'); hasErrors = true; }
        if (!data.nama_dosen) { setError('nama_dosen', 'Ketua kelompok wajib diisi'); hasErrors = true; }
        if (!data.lokasi) { setError('lokasi', 'Lokasi pengabdian wajib diisi'); hasErrors = true; }

        if (hasErrors) {
            setToast({ show: true, type: 'error', title: 'Validasi Gagal', message: 'Harap periksa kembali isian yang wajib diisi.' });
            return;
        }
        setMockProcessing(true);
        setTimeout(() => {
            setMockProcessing(false);
            setToast({ show: true, type: 'success', title: 'Berhasil', message: 'Pengajuan PKM Anda berhasil dikirim.' });
            setTimeout(() => {
                reset();
            }, 3000);
        }, 1500);
    };

    const isProcessing = inertiaProcessing || mockProcessing;

    return (
        <div className="chart-card public-access-card" style={{ marginTop: '28px', overflow: 'visible' }}>
            <div className="chart-card-header public-access-card-header" style={{ paddingBottom: '16px' }}>
                <div className="chart-card-icon public-access-card-icon">
                    <i className="fa-solid fa-file-signature"></i>
                </div>
                <div>
                    <h3 className="chart-card-title">Akses Pengajuan PKM</h3>
                    <p className="chart-card-subtitle">Formulir pengajuan proyek pengabdian masyarakat</p>
                </div>
            </div>

            <div className="public-access-card-body" style={{ padding: '0 24px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                            <i className="fa-solid fa-folder-open text-blue"></i> Detail Proyek
                        </h3>
                        <div className="form-grid">
                            <div className={`form-group full-width ${errors.judul_proyek ? 'has-error' : ''}`}>
                                <label>Judul Proyek PKM <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Masukkan judul pengabdian..."
                                    value={data.judul_proyek}
                                    onChange={(e) => setData('judul_proyek', e.target.value)}
                                />
                                {errors.judul_proyek && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.judul_proyek}</span>}
                            </div>

                            <div className={`form-group ${errors.nama_dosen ? 'has-error' : ''}`}>
                                <label>Ketua Kelompok <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Nama Lengkap & Gelar..."
                                    value={data.nama_dosen}
                                    onChange={(e) => setData('nama_dosen', e.target.value)}
                                    required
                                />
                                {errors.nama_dosen && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.nama_dosen}</span>}
                            </div>

                            <div className={`form-group ${errors.lokasi ? 'has-error' : ''}`}>
                                <label>Lokasi Pengabdian <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Desa, Kecamatan, Kota..."
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                />
                                {errors.lokasi && <span className="form-error-message"><i className="fa-solid fa-circle-exclamation"></i> {errors.lokasi}</span>}
                            </div>
                        </div>
                    </div>

                    <hr className="form-divider" style={{ margin: '4px 0' }} />

                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <div className="form-section-header-flex" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 className="form-section-title mb-0" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, fontSize: '15px' }}>
                                <i className="fa-solid fa-users text-blue"></i> Tim Pelaksana
                            </h3>
                        </div>

                        <div className="team-sub-section" style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                            <div className="form-section-header-flex" style={{ marginBottom: '16px', borderBottom: 'none' }}>
                                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '12px' }}>
                                        <i className="fa-solid fa-user-tie"></i>
                                    </span>
                                    Dosen Terlibat
                                </h4>
                                <button
                                    type="button"
                                    className="btn-add-dynamic"
                                    onClick={() => handleAddPersonil('dosen_terlibat')}
                                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px' }}
                                >
                                    <i className="fa-solid fa-plus"></i> Tambah
                                </button>
                            </div>
                            <div className="dynamic-array-container">
                                {data.dosen_terlibat.map((personil, index) => (
                                    <div key={index} className="dynamic-array-row" style={{ marginBottom: '12px' }}>
                                        <div className="dynamic-input-wrapper">
                                            <span className="dynamic-numbering">{index + 1}</span>
                                            <input
                                                type="text"
                                                className="fintech-input"
                                                placeholder={`Nama Dosen ${index + 1}`}
                                                value={personil}
                                                onChange={(e) => handlePersonilChange('dosen_terlibat', index, e.target.value)}
                                            />
                                        </div>
                                        {data.dosen_terlibat.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-remove-dynamic"
                                                onClick={() => handleRemovePersonil('dosen_terlibat', index)}
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="team-sub-section" style={{ padding: '16px', backgroundColor: '#fbf5ff', borderRadius: '12px', border: '1px solid #f3e8ff', marginBottom: '16px' }}>
                            <div className="form-section-header-flex" style={{ marginBottom: '16px', borderBottom: 'none' }}>
                                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#4c1d95', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#f3e8ff', color: '#6d28d9', borderRadius: '8px', fontSize: '12px' }}>
                                        <i className="fa-solid fa-id-badge"></i>
                                    </span>
                                    Staf Terlibat
                                </h4>
                                <button
                                    type="button"
                                    className="btn-add-dynamic"
                                    onClick={() => handleAddPersonil('staff_terlibat')}
                                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', color: '#6d28d9', backgroundColor: '#ede9fe' }}
                                >
                                    <i className="fa-solid fa-plus"></i> Tambah
                                </button>
                            </div>
                            <div className="dynamic-array-container">
                                {data.staff_terlibat.map((personil, index) => (
                                    <div key={index} className="dynamic-array-row" style={{ marginBottom: '12px' }}>
                                        <div className="dynamic-input-wrapper">
                                            <span className="dynamic-numbering" style={{ backgroundColor: '#f3e8ff', color: '#6d28d9' }}>{index + 1}</span>
                                            <input
                                                type="text"
                                                className="fintech-input"
                                                placeholder={`Nama Staf ${index + 1}`}
                                                value={personil}
                                                onChange={(e) => handlePersonilChange('staff_terlibat', index, e.target.value)}
                                            />
                                        </div>
                                        {data.staff_terlibat.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-remove-dynamic"
                                                onClick={() => handleRemovePersonil('staff_terlibat', index)}
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="team-sub-section" style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                            <div className="form-section-header-flex" style={{ marginBottom: '16px', borderBottom: 'none' }}>
                                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#14532d', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontSize: '12px' }}>
                                        <i className="fa-solid fa-graduation-cap"></i>
                                    </span>
                                    Mahasiswa Terlibat
                                </h4>
                                <button
                                    type="button"
                                    className="btn-add-dynamic"
                                    onClick={() => handleAddPersonil('mahasiswa_terlibat')}
                                    style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '8px', color: '#16a34a', backgroundColor: '#dcfce7' }}
                                >
                                    <i className="fa-solid fa-plus"></i> Tambah
                                </button>
                            </div>
                            <div className="dynamic-array-container">
                                {data.mahasiswa_terlibat.map((personil, index) => (
                                    <div key={index} className="dynamic-array-row" style={{ marginBottom: '12px' }}>
                                        <div className="dynamic-input-wrapper">
                                            <span className="dynamic-numbering" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>{index + 1}</span>
                                            <input
                                                type="text"
                                                className="fintech-input"
                                                placeholder={`Nama Mahasiswa ${index + 1}`}
                                                value={personil}
                                                onChange={(e) => handlePersonilChange('mahasiswa_terlibat', index, e.target.value)}
                                            />
                                        </div>
                                        {data.mahasiswa_terlibat.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn-remove-dynamic"
                                                onClick={() => handleRemovePersonil('mahasiswa_terlibat', index)}
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="form-divider" style={{ margin: '4px 0' }} />

                    <div className="form-section" style={{ padding: '0', background: 'transparent' }}>
                        <h3 className="form-section-title" style={{ fontSize: '15px' }}>
                            <i className="fa-solid fa-wallet text-blue"></i> Pendanaan & Jadwal
                        </h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Sumber Dana</label>
                                <select
                                    className="fintech-input"
                                    value={data.sumber_dana}
                                    onChange={(e) => setData('sumber_dana', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Pilih Sumber Dana</option>
                                    <option value="DIPA Poltekpar">DIPA Poltekpar</option>
                                    <option value="Mandiri">Mandiri / Pribadi</option>
                                    <option value="Sponsor Luar">Sponsor Eksternal</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Total Anggaran (RAB)</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">Rp</span>
                                    <input
                                        type="number"
                                        className="fintech-input"
                                        placeholder="0"
                                        value={data.total_RAB}
                                        onChange={(e) => setData('total_RAB', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Tanggal Mulai</label>
                                <input
                                    type="date"
                                    className="fintech-input input-date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Tanggal Selesai</label>
                                <input
                                    type="date"
                                    className="fintech-input input-date"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Unggah Proposal (PDF)</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="proposal_inline"
                                        className="file-upload-input"
                                        accept=".pdf"
                                        onChange={(e) => setData('proposal', e.target.files[0])}
                                    />
                                    <label htmlFor="proposal_inline" className="file-upload-trigger">
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                        <span className="file-name">
                                            {data.proposal ? data.proposal.name : 'Pilih file PDF pengajuan...'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button type="submit" className={`btn-modal-submit ${isProcessing ? 'btn-loading' : ''}`} style={{ width: '100%', borderRadius: '12px' }} disabled={isProcessing}>
                            Kirim Pengajuan <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>

            <Toast
                show={toast.show}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
}
