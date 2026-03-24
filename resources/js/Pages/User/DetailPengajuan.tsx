import React from 'react';
import { Link } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';
import {
    ArrowLeft, FileText, ExternalLink, FolderOpen,
    CheckCircle, X, Clock, RefreshCw, MapPin, Calendar,
    DollarSign, Building, Users
} from 'lucide-react';

interface TimKegiatan { id_tim: number; nama_mahasiswa?: string; peran_tim?: string; pegawai?: { nama_pegawai: string }; }
interface Aktivitas { id_aktivitas: number; status_pelaksanaan: string; catatan_pelaksanaan?: string; }
interface Arsip { id_arsip: number; nama_dokumen: string; jenis_arsip: string; url_dokumen?: string; url_arsip?: string; }

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    kebutuhan?: string;
    instansi_mitra?: string;
    sumber_dana?: string;
    total_anggaran: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    status_pengajuan: string;
    catatan_admin?: string;
    created_at?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    jenis_pkm?: { nama_jenis: string };
    lokasi_pkm?: { provinsi: string; kota_kabupaten: string; kecamatan?: string };
    tim_kegiatan?: TimKegiatan[];
    aktivitas?: Aktivitas[];
    arsip?: Arsip[];
}

interface Props {
    pengajuan: Pengajuan;
}

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    diproses: { label: 'Sedang Diproses', cls: 'bg-blue-100 text-blue-700', icon: <Clock size={14} /> },
    direvisi: { label: 'Perlu Direvisi', cls: 'bg-amber-100 text-amber-700', icon: <RefreshCw size={14} /> },
    diterima: { label: 'Diterima', cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={14} /> },
    ditolak: { label: 'Ditolak', cls: 'bg-red-100 text-red-700', icon: <X size={14} /> },
    selesai: { label: 'Selesai', cls: 'bg-indigo-100 text-indigo-700', icon: <CheckCircle size={14} /> },
};

const DetailPengajuan: React.FC<Props> = ({ pengajuan }) => {
    const st = statusConfig[pengajuan.status_pengajuan] || statusConfig.diproses;

    return (
        <UserLayout title="">
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/user/dashboard" className="p-2 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight leading-tight">{pengajuan.judul_kegiatan}</h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                        Diajukan pada{' '}
                        {pengajuan.created_at && new Date(pengajuan.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-extrabold uppercase tracking-wider ${st.cls}`}>
                    {st.icon} {st.label}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Info Grid */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight mb-5">Informasi Pengajuan</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoRow icon={<FileText size={16} />} label="Jenis PKM" value={pengajuan.jenis_pkm?.nama_jenis || '-'} />
                            <InfoRow icon={<Building size={16} />} label="Instansi Mitra" value={pengajuan.instansi_mitra || '-'} />
                            <InfoRow icon={<MapPin size={16} />} label="Lokasi" value={pengajuan.lokasi_pkm ? `${pengajuan.lokasi_pkm.kota_kabupaten}, ${pengajuan.lokasi_pkm.provinsi}` : '-'} />
                            <InfoRow icon={<DollarSign size={16} />} label="Total Anggaran" value={`Rp ${Number(pengajuan.total_anggaran).toLocaleString('id-ID')}`} />
                            <InfoRow icon={<Calendar size={16} />} label="Periode" value={`${pengajuan.tgl_mulai || '?'} s/d ${pengajuan.tgl_selesai || '?'}`} />
                            <InfoRow icon={<DollarSign size={16} />} label="Sumber Dana" value={pengajuan.sumber_dana || '-'} />
                        </div>
                        {pengajuan.kebutuhan && (
                            <div className="mt-6 pt-5 border-t border-slate-100">
                                <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Kebutuhan</div>
                                <p className="text-slate-800 text-[14px] leading-relaxed font-medium">{pengajuan.kebutuhan}</p>
                            </div>
                        )}
                    </div>

                    {/* Dokumen Lampiran */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                        <div className="px-8 py-5 flex items-center gap-3 border-b border-slate-100">
                            <FolderOpen size={20} className="text-slate-500" />
                            <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Dokumen Lampiran</h2>
                        </div>
                        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Proposal', url: pengajuan.proposal },
                                { label: 'Surat Permohonan', url: pengajuan.surat_permohonan },
                                { label: 'RAB', url: pengajuan.rab },
                            ].map((doc) => (
                                <a key={doc.label} href={doc.url || '#'} target="_blank" rel="noopener noreferrer"
                                    className={`flex items-center gap-3 px-5 py-4 rounded-xl text-[14px] font-bold transition-all ${doc.url
                                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md'
                                        : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                                        }`}>
                                    <FileText size={18} />
                                    {doc.label}
                                    {doc.url && <ExternalLink size={14} className="ml-auto" />}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Tim PKM */}
                    {pengajuan.tim_kegiatan && pengajuan.tim_kegiatan.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                            <div className="px-8 py-5 flex items-center gap-3 border-b border-slate-100">
                                <Users size={20} className="text-slate-500" />
                                <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Tim PKM</h2>
                                <span className="text-[13px] font-extrabold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">{pengajuan.tim_kegiatan.length}</span>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/80">
                                        <th className="py-4 px-8 text-slate-500 text-[12px] font-extrabold uppercase tracking-wider">Dosen/Staf</th>
                                        <th className="py-4 px-8 text-slate-500 text-[12px] font-extrabold uppercase tracking-wider">Mahasiswa</th>
                                        <th className="py-4 px-8 text-slate-500 text-[12px] font-extrabold uppercase tracking-wider">Peran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {pengajuan.tim_kegiatan.map((tim) => (
                                        <tr key={tim.id_tim} className="hover:bg-slate-50/70">
                                            <td className="py-4 px-8 font-bold text-slate-800 text-[14px]">{tim.pegawai?.nama_pegawai || '-'}</td>
                                            <td className="py-4 px-8 font-bold text-slate-700 text-[14px]">{tim.nama_mahasiswa || '-'}</td>
                                            <td className="py-4 px-8 font-bold text-slate-600 text-[14px]">{tim.peran_tim || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Arsip */}
                    {pengajuan.arsip && pengajuan.arsip.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                            <div className="px-8 py-5 flex items-center gap-3 border-b border-slate-100">
                                <FolderOpen size={20} className="text-slate-500" />
                                <h2 className="text-[18px] font-extrabold text-slate-900 tracking-tight">Arsip Pendukung</h2>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {pengajuan.arsip.map((a) => (
                                    <div key={a.id_arsip} className="flex items-center justify-between px-8 py-4 hover:bg-slate-50/70">
                                        <div className="flex items-center gap-4">
                                            <FileText size={20} className="text-slate-400" />
                                            <div>
                                                <div className="text-[14px] font-extrabold text-slate-800">{a.nama_dokumen}</div>
                                                <div className="text-[12px] font-bold text-slate-500 mt-0.5">{a.jenis_arsip}</div>
                                            </div>
                                        </div>
                                        <a href={a.url_dokumen || a.url_arsip || '#'} target="_blank" rel="noopener noreferrer"
                                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 transition-colors">
                                            Buka <ExternalLink size={14} />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Status & Notes */}
                <div className="space-y-5">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight mb-4">Status Pengajuan</h3>
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl font-extrabold text-[14px] ${st.cls}`}>
                            {st.icon} {st.label}
                        </div>
                    </div>

                    {/* Catatan Admin (if any) */}
                    {pengajuan.catatan_admin && (
                        <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200/60 shadow-sm">
                            <div className="font-extrabold text-amber-800 text-[14px] mb-2">📋 Catatan dari Admin</div>
                            <p className="text-amber-900 text-[14px] leading-relaxed font-medium">{pengajuan.catatan_admin}</p>
                        </div>
                    )}

                    {/* Aktivitas */}
                    {pengajuan.aktivitas && pengajuan.aktivitas.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight mb-4">Status Pelaksanaan</h3>
                            <div className="space-y-3">
                                {pengajuan.aktivitas.map((a) => (
                                    <div key={a.id_aktivitas} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${a.status_pelaksanaan === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {a.status_pelaksanaan}
                                        </span>
                                        {a.catatan_pelaksanaan && (
                                            <p className="text-slate-700 font-medium text-[13px] leading-relaxed mt-2">{a.catatan_pelaksanaan}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Back Button */}
                    <Link href="/user/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-[14px] hover:bg-slate-50 hover:border-slate-300 transition-all">
                        <ArrowLeft size={16} /> Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </UserLayout>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-slate-400 mt-1">{icon}</div>
        <div>
            <div className="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider">{label}</div>
            <div className="text-slate-900 text-[14px] font-bold mt-1">{value}</div>
        </div>
    </div>
);

export default DetailPengajuan;
