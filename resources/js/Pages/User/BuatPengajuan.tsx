import React, { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Send } from 'lucide-react';

interface JenisPkm {
    id_jenis_pkm: number;
    nama_jenis: string;
}

interface LokasiPkm {
    id_lokasi_pkm: number;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan?: string;
}

interface Props {
    listJenisPkm: JenisPkm[];
    listLokasiPkm: LokasiPkm[];
}

const BuatPengajuan: React.FC<Props> = ({ listJenisPkm, listLokasiPkm }) => {
    const [form, setForm] = useState({
        id_jenis_pkm: '',
        id_lokasi_pkm: '',
        judul_kegiatan: '',
        kebutuhan: '',
        instansi_mitra: '',
        sumber_dana: '',
        total_anggaran: '',
        tgl_mulai: '',
        tgl_selesai: '',
        proposal: null as File | null,
        surat_permohonan: null as File | null,
        rab: null as File | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.target.type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            setForm({ ...form, [e.target.name]: fileInput.files ? fileInput.files[0] : null });
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/user/pengajuan', form, {
            onError: (err) => setErrors(err),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
                <Link href="/user/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="font-extrabold tracking-tight text-[22px] text-slate-900">Buat Pengajuan PKM</div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                    <div className="mb-8">
                        <h2 className="text-[24px] font-extrabold tracking-tight text-slate-900">Form Pengajuan Kegiatan PKM</h2>
                        <p className="text-slate-600 text-[14px] font-medium mt-2">
                            Isi formulir dengan lengkap. Pengajuan akan berstatus <span className="font-bold text-indigo-600">"Sedang Diproses"</span> setelah dikirim.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Judul */}
                        <Field label="Judul Kegiatan" required error={errors.judul_kegiatan}>
                            <input
                                name="judul_kegiatan"
                                value={form.judul_kegiatan}
                                onChange={handleChange}
                                required
                                placeholder="Contoh: Pelatihan Pengolahan Sampah Organik di Desa Wisata"
                                className={inputCls(!!errors.judul_kegiatan)}
                            />
                        </Field>

                        {/* Jenis & Lokasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Jenis PKM" required error={errors.id_jenis_pkm}>
                                <select
                                    name="id_jenis_pkm"
                                    value={form.id_jenis_pkm}
                                    onChange={handleChange}
                                    required
                                    className={inputCls(!!errors.id_jenis_pkm)}
                                >
                                    <option value="">-- Pilih Jenis --</option>
                                    {listJenisPkm.map((j) => (
                                        <option key={j.id_jenis_pkm} value={j.id_jenis_pkm}>
                                            {j.nama_jenis}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Lokasi Kegiatan" required error={errors.id_lokasi_pkm}>
                                <select
                                    name="id_lokasi_pkm"
                                    value={form.id_lokasi_pkm}
                                    onChange={handleChange}
                                    required
                                    className={inputCls(!!errors.id_lokasi_pkm)}
                                >
                                    <option value="">-- Pilih Lokasi --</option>
                                    {listLokasiPkm.map((l) => (
                                        <option key={l.id_lokasi_pkm} value={l.id_lokasi_pkm}>
                                            {l.kota_kabupaten}, {l.provinsi}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* Instansi Mitra & Sumber Dana */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Instansi Mitra" error={errors.instansi_mitra}>
                                <input
                                    name="instansi_mitra"
                                    value={form.instansi_mitra}
                                    onChange={handleChange}
                                    placeholder="Contoh: Desa Kambo, Kab. Palopo"
                                    className={inputCls(!!errors.instansi_mitra)}
                                />
                            </Field>
                            <Field label="Sumber Dana" error={errors.sumber_dana}>
                                <input
                                    name="sumber_dana"
                                    value={form.sumber_dana}
                                    onChange={handleChange}
                                    placeholder="Contoh: DIPA Poltekpar Makassar"
                                    className={inputCls(!!errors.sumber_dana)}
                                />
                            </Field>
                        </div>

                        {/* Total Anggaran */}
                        <Field label="Total Anggaran (Rp)" error={errors.total_anggaran}>
                            <input
                                name="total_anggaran"
                                type="number"
                                value={form.total_anggaran}
                                onChange={handleChange}
                                placeholder="Contoh: 5000000"
                                min="0"
                                className={inputCls(!!errors.total_anggaran)}
                            />
                        </Field>

                        {/* Periode */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="Tanggal Mulai" error={errors.tgl_mulai}>
                                <input
                                    name="tgl_mulai"
                                    type="date"
                                    value={form.tgl_mulai}
                                    onChange={handleChange}
                                    className={inputCls(!!errors.tgl_mulai)}
                                />
                            </Field>
                            <Field label="Tanggal Selesai" error={errors.tgl_selesai}>
                                <input
                                    name="tgl_selesai"
                                    type="date"
                                    value={form.tgl_selesai}
                                    onChange={handleChange}
                                    min={form.tgl_mulai}
                                    className={inputCls(!!errors.tgl_selesai)}
                                />
                            </Field>
                        </div>

                        {/* Kebutuhan / Deskripsi */}
                        <Field label="Deskripsi Kebutuhan" error={errors.kebutuhan}>
                            <textarea
                                name="kebutuhan"
                                value={form.kebutuhan}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Jelaskan latar belakang, tujuan, dan kebutuhan kegiatan ini..."
                                className={`${inputCls(!!errors.kebutuhan)} resize-none`}
                            />
                        </Field>

                        {/* Dokumen Lampiran (Uploads) */}
                        <div className="pt-6 mt-6 border-t border-slate-200">
                            <h3 className="text-[18px] font-extrabold text-slate-900 mb-4 tracking-tight">Dokumen Lampiran</h3>
                            <div className="space-y-5">
                                <Field label="Proposal PKM (PDF, Max 10MB)" required error={errors.proposal}>
                                    <input
                                        type="file"
                                        name="proposal"
                                        accept=".pdf"
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white text-slate-700 text-[14px] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[13px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors file:cursor-pointer border border-slate-200 rounded-xl"
                                    />
                                </Field>
                                <Field label="Surat Permohonan (PDF, Max 5MB)" required error={errors.surat_permohonan}>
                                    <input
                                        type="file"
                                        name="surat_permohonan"
                                        accept=".pdf"
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white text-slate-700 text-[14px] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[13px] file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors file:cursor-pointer border border-slate-200 rounded-xl"
                                    />
                                </Field>
                                <Field label="RAB (PDF/Excel, Max 5MB)" error={errors.rab}>
                                    <input
                                        type="file"
                                        name="rab"
                                        accept=".pdf,.xlsx,.xls"
                                        onChange={handleChange}
                                        className="w-full bg-white text-slate-700 text-[14px] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[13px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 transition-colors file:cursor-pointer border border-slate-200 rounded-xl"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 flex items-center gap-5">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-extrabold text-[14px] rounded-xl shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:bg-indigo-700 transition-all"
                            >
                                <Send size={18} /> Kirim Pengajuan
                            </button>
                            <Link href="/user/dashboard" className="text-slate-500 font-extrabold text-[14px] hover:text-slate-800 transition-colors">
                                Membatalkan
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? 'border-red-400 focus:ring-red-500 bg-red-50/50' : 'border-slate-300 focus:ring-indigo-500'} px-5 py-3 text-[14px] font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none transition-all bg-white shadow-sm hover:border-slate-400`;

const Field: React.FC<{
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}> = ({ label, required, error, children }) => (
    <div className="space-y-2">
        <label className="text-[14px] font-extrabold text-slate-800 tracking-tight">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-red-600 text-[13px] font-bold mt-1.5">{error}</p>}
    </div>
);

export default BuatPengajuan;
