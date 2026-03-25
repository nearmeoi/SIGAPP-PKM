import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Layout from '@/Layouts/DefaultLayout';
import { Rocket, ArrowLeft, Construction } from 'lucide-react';

export default function ComingSoon() {
    return (
        <Layout>
            <Head title="Coming Soon - SIGAP P3M" />

            <div className="min-h-[80vh] flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mb-8 animate-bounce">
                        <Rocket size={40} />
                    </div>

                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-4">
                        Modul Sedang Disiapkan
                    </h1>

                    <p className="text-lg text-zinc-600 leading-relaxed mb-10">
                        Kami sedang memperbarui fitur Dashboard Pengguna dan Dosen untuk memberikan pengalaman yang lebih baik. Mohon tunggu informasi selanjutnya.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
                        >
                            <ArrowLeft size={18} />
                            Kembali ke Beranda
                        </Link>

                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-100 text-zinc-600 font-semibold border border-zinc-200">
                            <Construction size={18} />
                            Status: Maintenance
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-zinc-100 text-zinc-400 text-sm">
                        &copy; {new Date().getFullYear()} P3M Politeknik Pariwisata Makassar
                    </div>
                </div>
            </div>
        </Layout>
    );
}
