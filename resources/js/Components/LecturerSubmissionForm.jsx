import React from 'react';
import { useForm } from '@inertiajs/react';

// Make sure to import the CSS in your main page or Layout
// import '../../../css/lecturer-form.css';

export default function LecturerSubmissionForm({ onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_dosen: '',
        judul_proyek: '',
        lokasi: '',
        personil_terlibat: [''], // Initialize with one empty input
        sumber_dana: '',
        total_RAB: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        proposal: null,
    });

    // --- Dynamic Array Logic for Personnel ---
    const handleAddPersonil = () => {
        setData('personil_terlibat', [...data.personil_terlibat, '']);
    };

    const handleRemovePersonil = (indexToRemove) => {
        const filtered = data.personil_terlibat.filter((_, index) => index !== indexToRemove);
        setData('personil_terlibat', filtered);
    };

    const handlePersonilChange = (index, value) => {
        const updated = [...data.personil_terlibat];
        updated[index] = value;
        setData('personil_terlibat', updated);
    };

    // --- Submission Logic ---
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('pkm.lecturer.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fintech-modal-overlay">
            <div className="fintech-modal-container lecturer-modal">
                <div className="fintech-modal-header">
                    <div>
                        <h2 className="fintech-modal-title">Pengajuan PKM Dosen</h2>
                        <p className="fintech-modal-subtitle">Lengkapi detail proyek pengabdian masyarakat Anda</p>
                    </div>
                    <button type="button" className="fintech-modal-close" onClick={onClose} aria-label="Tutup">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="fintech-modal-body">
                    {/* SECTION 1: Project Details */}
                    <div className="form-section">
                        <h3 className="form-section-title">
                            <i className="fa-solid fa-folder-open text-blue"></i> Detail Proyek
                        </h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Judul Proyek PKM</label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Masukkan judul pengabdian..."
                                    value={data.judul_proyek}
                                    onChange={(e) => setData('judul_proyek', e.target.value)}
                                    required
                                />
                                {errors.judul_proyek && <span className="form-error">{errors.judul_proyek}</span>}
                            </div>

                            <div className="form-group">
                                <label>Nama Dosen Pembimbing</label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Nama Lengkap & Gelar..."
                                    value={data.nama_dosen}
                                    onChange={(e) => setData('nama_dosen', e.target.value)}
                                    required
                                />
                                {errors.nama_dosen && <span className="form-error">{errors.nama_dosen}</span>}
                            </div>

                            <div className="form-group">
                                <label>Lokasi Pengabdian</label>
                                <input
                                    type="text"
                                    className="fintech-input"
                                    placeholder="Desa, Kecamatan, Kota..."
                                    value={data.lokasi}
                                    onChange={(e) => setData('lokasi', e.target.value)}
                                    required
                                />
                                {errors.lokasi && <span className="form-error">{errors.lokasi}</span>}
                            </div>
                        </div>
                    </div>

                    <hr className="form-divider" />

                    {/* SECTION 2: Team (Dynamic Array) */}
                    <div className="form-section">
                        <div className="form-section-header-flex">
                            <h3 className="form-section-title mb-0">
                                <i className="fa-solid fa-users text-blue"></i> Personil Terlibat
                            </h3>
                            <button
                                type="button"
                                className="btn-add-dynamic"
                                onClick={handleAddPersonil}
                            >
                                <i className="fa-solid fa-plus"></i> Tambah Anggota
                            </button>
                        </div>
                        <p className="form-section-desc">Masukkan nama mahasiswa atau staf pendukung yang turut serta.</p>

                        <div className="dynamic-array-container">
                            {data.personil_terlibat.map((personil, index) => (
                                <div key={index} className="dynamic-array-row">
                                    <div className="dynamic-input-wrapper">
                                        <span className="dynamic-numbering">{index + 1}</span>
                                        <input
                                            type="text"
                                            className="fintech-input"
                                            placeholder={`Nama Anggota Tim ${index + 1}`}
                                            value={personil}
                                            onChange={(e) => handlePersonilChange(index, e.target.value)}
                                            required
                                        />
                                    </div>
                                    {data.personil_terlibat.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remove-dynamic"
                                            onClick={() => handleRemovePersonil(index)}
                                            aria-label="Hapus Anggota"
                                        >
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                            {errors.personil_terlibat && <span className="form-error">{errors.personil_terlibat}</span>}
                        </div>
                    </div>

                    <hr className="form-divider" />

                    {/* SECTION 3: Financials & Timeline */}
                    <div className="form-section">
                        <h3 className="form-section-title">
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
                                {errors.sumber_dana && <span className="form-error">{errors.sumber_dana}</span>}
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
                                {errors.total_RAB && <span className="form-error">{errors.total_RAB}</span>}
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
                                {errors.tanggal_mulai && <span className="form-error">{errors.tanggal_mulai}</span>}
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
                                {errors.tanggal_selesai && <span className="form-error">{errors.tanggal_selesai}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Unggah Proposal (PDF)</label>
                                <div className="file-upload-wrapper">
                                    <input
                                        type="file"
                                        id="proposal"
                                        className="file-upload-input"
                                        accept=".pdf"
                                        onChange={(e) => setData('proposal', e.target.files[0])}
                                    />
                                    <label htmlFor="proposal" className="file-upload-trigger">
                                        <i className="fa-solid fa-cloud-arrow-up"></i>
                                        <span className="file-name">
                                            {data.proposal ? data.proposal.name : 'Pilih file PDF pengajuan...'}
                                        </span>
                                    </label>
                                </div>
                                {errors.proposal && <span className="form-error">{errors.proposal}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="fintech-modal-footer">
                        <button type="button" className="btn-modal-cancel" onClick={onClose}>
                            Batal
                        </button>
                        <button type="submit" className="btn-modal-submit" disabled={processing}>
                            {processing ? (
                                <>Memproses <i className="fa-solid fa-spinner fa-spin"></i></>
                            ) : (
                                <>Kirim Pengajuan <i className="fa-solid fa-paper-plane"></i></>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
