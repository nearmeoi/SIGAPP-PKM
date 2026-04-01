import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

interface Props {
    namaKegiatan?: string;
    kode: string;
}

export default function PengumpulanArsip({ namaKegiatan = 'NAMA KEGIATAN PKM', kode }: Props) {
    const { auth } = usePage<any>().props;
    const { data, setData, post, processing } = useForm({
        laporan: '',
        dokumentasi: '',
        dokumen_lainnya: ['']
    });

    const handleAddLink = () => {
        setData('dokumen_lainnya', [...data.dokumen_lainnya, '']);
    };

    const handleLinkChange = (index: number, value: string) => {
        const updated = [...data.dokumen_lainnya];
        updated[index] = value;
        setData('dokumen_lainnya', updated);
    };
    
    const handleRemoveLink = (index: number) => {
        setData('dokumen_lainnya', data.dokumen_lainnya.filter((_, i) => i !== index));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Nanti ganti dengan metode submit sebenarnya
        alert(`Berhasil Submit Data untuk kode: ${kode}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title="Pengumpulan Arsip" />
            
            <Navbar />
            
            <main className="flex-grow flex items-start justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    
                    {/* Header Setup like Cek Status */}
                    <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md">
                            <i className="fa-solid fa-folder-open text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Pengumpulan Arsip</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Unggah laporan dan dokumentasi kegiatan</p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 space-y-6">
                        <form onSubmit={submit} className="space-y-8">
                            
                            {/* Identitas Section style */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-bookmark text-sigap-blue"></i>
                                    Informasi Kegiatan
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Nama Kegiatan</label>
                                    <div className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm font-semibold text-slate-900">
                                        {namaKegiatan}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Dokumen Arsip */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-link text-sigap-blue"></i>
                                    Tautan Dokumen Arsip
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Link Laporan (Google Drive/Lainnya) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={data.laporan}
                                            onChange={e => setData('laporan', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100"
                                            placeholder="https://drive.google.com/..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Link Dokumentasi (Google Drive/Lainnya) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={data.dokumentasi}
                                            onChange={e => setData('dokumentasi', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100"
                                            placeholder="https://drive.google.com/..."
                                            required
                                        />
                                    </div>
                                    
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-semibold text-slate-700">Tautan Tambahan (Opsional)</label>
                                        {data.dokumen_lainnya.map((link, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input 
                                                    type="url" 
                                                    value={link} 
                                                    onChange={e => handleLinkChange(idx, e.target.value)} 
                                                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" 
                                                    placeholder="Tautan tambahan lainnya..." 
                                                />
                                                {data.dokumen_lainnya.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveLink(idx)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddLink} className="text-xs font-bold text-sigap-blue flex items-center gap-1.5 hover:underline mt-2">
                                            <i className="fa-solid fa-plus-circle"></i>
                                            Tambah Tautan Lagi
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <button type="submit" disabled={processing} className="w-full py-3.5 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-paper-plane"></i>Kirim Arsip
                            </button>

                        </form>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
