import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

interface Props {
    namaKegiatan?: string;
    kode: string;
}

export default function Testimoni({ namaKegiatan = 'NAMA KEGIATAN PKM', kode }: Props) {
    const { auth } = usePage<any>().props;
    const { data, setData, post, processing } = useForm({
        nama_pemberi: '',
        rating: 0,
        pesan_kesan: '',
        saran: ''
    });

    const [hover, setHover] = useState(0);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating === 0) {
            alert('Mohon berikan rating (bintang) terlebih dahulu.');
            return;
        }
        // Nanti ganti dengan metode submit sebenarnya
        alert(`Berhasil Submit Testimoni untuk kode: ${kode}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title="Testimoni" />

            <Navbar />

            <main className="flex-grow flex items-start justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">

                    {/* Header Setup like Cek Status */}
                    <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-md">
                            <i className="fa-solid fa-star text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Testimoni Kegiatan</h3>
                            <p className="text-sm text-slate-500 mt-0.5">Berikan ulasan dan masukan Anda untuk program kami</p>
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

                            {/* Form Testimoni */}
                            <section>
                                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-comment-dots text-sigap-blue"></i>
                                    Isi Testimoni
                                </h3>
                                <div className="space-y-6">

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Nama Pemberi Testimoni <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nama_pemberi}
                                            onChange={e => setData('nama_pemberi', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100"
                                            placeholder="Contoh: Budi Santoso / Warga Desa..."
                                            required
                                        />
                                    </div>

                                    {/* Star Rating Centered */}
                                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                                        <div className="flex gap-2 w-full mx-auto justify-between">
                                            {[...Array(5)].map((_, index) => {
                                                const starValue = index + 1;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={starValue}
                                                        className={`text-5xl transition-all hover:scale-110 active:scale-95 ${starValue <= (hover || data.rating) ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}
                                                        onClick={() => setData('rating', starValue)}
                                                        onMouseEnter={() => setHover(starValue)}
                                                        onMouseLeave={() => setHover(0)}
                                                    >
                                                        <i className="fa-solid fa-star"></i>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Pesan dan Kesan <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.pesan_kesan}
                                            onChange={e => setData('pesan_kesan', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 min-h-[100px]"
                                            placeholder="Tuliskan pengalaman Anda..."
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Saran (Opsional)
                                        </label>
                                        <textarea
                                            value={data.saran}
                                            onChange={e => setData('saran', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 min-h-[100px]"
                                            placeholder="Tuliskan saran untuk perbaikan ke depannya..."
                                        />
                                    </div>

                                </div>
                            </section>

                            <button type="submit" disabled={processing} className="w-full py-3.5 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4">
                                <i className="fa-solid fa-paper-plane"></i>Kirim Testimoni
                            </button>

                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
