import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Image as ImageIcon } from 'lucide-react';
import DefaultLayout from '@/Layouts/DefaultLayout';

interface Dev {
    id_developer: number;
    nama: string;
    peran: string | null;
    asal_instansi: string | null;
    foto: string | null;
    urutan: number;
}

interface Doc {
    id_dokumentasi: number;
    judul: string;
    deskripsi: string | null;
    foto: string;
    urutan: number;
}

export default function DeveloperAppreciation({ developers, docs }: { developers: Dev[], docs: Doc[] }) {
    return (
        <DefaultLayout>
            <Head title="Developer Crew & Credits" />
            
            <div className="bg-slate-900 min-h-screen text-slate-100 pb-24 relative overflow-hidden">
                {/* Visual Effects */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/30 to-transparent pointer-events-none"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group font-medium">
                        <span className="p-2 border border-slate-700 rounded-full group-hover:bg-slate-800 transition-colors">
                            <ArrowLeft size={16} />
                        </span>
                        Kembali ke Home
                    </Link>

                    <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-sm text-sm font-bold text-slate-300 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Apresiasi Tim Pengembang
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-6 tracking-tight">
                            The Minds Behind SIGAPPA
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Proyek inovasi ini tidak akan terwujud tanpa dedikasi, keahlian, dan kerja keras dari tim pengembangan kami.
                        </p>
                    </div>

                    <div className="mb-24">
                        <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <User className="text-white" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold">Developer & Kru</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {developers.map((dev, index) => (
                                <div key={dev.id_developer} className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center text-center group hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-[${index * 100}ms]`}>
                                    <div className="w-32 h-32 rounded-full mb-6 relative p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 group-hover:rotate-6 transition-transform duration-500">
                                        <div className="w-full h-full rounded-full bg-slate-900 absolute inset-0 m-auto" style={{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }}></div>
                                        {dev.foto ? (
                                            <img src={dev.foto} alt={dev.nama} className="w-full h-full object-cover rounded-full relative z-10 block grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center relative z-10 text-slate-500">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{dev.nama}</h3>
                                    <p className="text-sm font-semibold text-indigo-400 mb-3">{dev.peran}</p>
                                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-400 border border-slate-700 group-hover:bg-slate-700 transition-colors">{dev.asal_instansi || 'Tim Internal'}</span>
                                </div>
                            ))}
                            {developers.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-500 border border-slate-800 rounded-3xl">Belum ada data kru yang ditambahkan.</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                                <ImageIcon className="text-white" size={20} />
                            </div>
                            <h2 className="text-2xl font-bold">Dokumentasi Proyek</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {docs.map((doc, index) => (
                                <div key={doc.id_dokumentasi} className={`group relative rounded-3xl overflow-hidden bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 transition-colors animate-in fade-in zoom-in-95 duration-700 delay-[${index * 150}ms]`}>
                                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img src={doc.foto} alt={doc.judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                    </div>
                                    <div className="p-6 relative z-20 -mt-8 bg-gradient-to-t from-slate-900 via-slate-900/95 to-slate-900/40 pt-10 h-full">
                                        <h3 className="text-lg font-bold text-white mb-2">{doc.judul}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{doc.deskripsi}</p>
                                    </div>
                                </div>
                            ))}
                            {docs.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-500 border border-slate-800 rounded-3xl">Belum ada dokumentasi proyek yang ditambahkan.</div>
                            )}
                        </div>
                    </div>
                    
                </div>
            </div>
        </DefaultLayout>
    );
}
