import React from 'react';
import { Link } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';
import {
    FileText, Clock, CheckCircle, X, RefreshCw, Plus, ChevronRight
} from 'lucide-react';

interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    status_pengajuan: string;
    created_at: string;
    jenis_pkm?: { nama_jenis: string };
    lokasi_pkm?: { kota_kabupaten: string; provinsi: string };
}

interface PaginatedData {
    data: Pengajuan[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    listPengajuan: PaginatedData;
}

const statusConfig: Record<string, { label: string; classes: string; icon: React.ReactNode }> = {
    diproses: { label: 'Diproses', classes: 'bg-blue-50 text-blue-700', icon: <Clock size={12} /> },
    direvisi: { label: 'Perlu Revisi', classes: 'bg-amber-50 text-amber-700', icon: <RefreshCw size={12} /> },
    diterima: { label: 'Diterima', classes: 'bg-emerald-50 text-emerald-700', icon: <CheckCircle size={12} /> },
    ditolak: { label: 'Ditolak', classes: 'bg-red-50 text-red-700', icon: <X size={12} /> },
    selesai: { label: 'Selesai', classes: 'bg-indigo-50 text-indigo-700', icon: <CheckCircle size={12} /> },
};

const Dashboard: React.FC<Props> = ({ listPengajuan }) => {
    const total = listPengajuan.total;
    const diterima = listPengajuan.data.filter((p) => p.status_pengajuan === 'diterima').length;
    const diproses = listPengajuan.data.filter((p) => p.status_pengajuan === 'diproses').length;

    return (
        <UserLayout title="">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">Dashboard Saya</h1>
                    <p className="text-slate-600 text-[14px] mt-1 font-medium">Kelola usulan pengabdian masyarakat Anda</p>
                </div>
                <Link href="/pengajuan/create"
                    className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-[14px] rounded-lg shadow-sm transition-colors hover:bg-slate-800"
                    style={{ backgroundColor: '#1b2a4a' }}>
                    <Plus size={18} /> Buat Pengajuan Baru
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
                <StatCard label="Total Pengajuan" value={total} iconClass="bg-blue-50 text-blue-600" Icon={FileText} />
                <StatCard label="Sedang Diproses" value={diproses} iconClass="bg-amber-50 text-amber-600" Icon={Clock} />
                <StatCard label="Diterima" value={diterima} iconClass="bg-emerald-50 text-emerald-600" Icon={CheckCircle} />
            </div>

            {/* Pengajuan List */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                <div className="px-6 py-5 flex items-center justify-between">
                    <h2 className="font-extrabold text-slate-900 text-[17px]">Riwayat Pengajuan</h2>
                </div>

                {listPengajuan.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Belum ada pengajuan.</p>
                        <Link href="/pengajuan/create" className="text-blue-600 font-bold text-[14px] mt-2 inline-block hover:underline">
                            Buat pengajuan pertama Anda &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="py-3 px-6 text-slate-600 text-[12px] font-bold uppercase tracking-wider">Judul Kegiatan</th>
                                    <th className="py-3 px-6 text-slate-600 text-[12px] font-bold uppercase tracking-wider">Jenis / Lokasi</th>
                                    <th className="py-3 px-6 text-slate-600 text-[12px] font-bold uppercase tracking-wider">Tanggal</th>
                                    <th className="py-3 px-6 text-slate-600 text-[12px] font-bold uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-6 text-slate-600 text-[12px] font-bold uppercase tracking-wider text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {listPengajuan.data.map((item) => {
                                    const st = statusConfig[item.status_pengajuan] || statusConfig.diproses;
                                    return (
                                        <tr key={item.id_pengajuan} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900 text-[14px]">{item.judul_kegiatan}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-slate-700 text-[14px] font-medium">{item.jenis_pkm?.nama_jenis || '-'}</div>
                                                <div className="text-slate-500 text-[12px] mt-0.5">{item.lokasi_pkm?.kota_kabupaten || '-'}</div>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600 text-[14px] font-medium">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider ${st.classes}`}>
                                                    {st.icon} {st.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <Link
                                                    href={`/pengajuan/${item.id_pengajuan}`}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </UserLayout>
    );
};

const StatCard: React.FC<{ label: string; value: number; iconClass: string; Icon: React.ElementType }> = ({ label, value, iconClass, Icon }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 border border-slate-100">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}>
            <Icon size={22} />
        </div>
        <div>
            <div className="text-slate-600 text-[13px] font-bold">{label}</div>
            <div className="text-slate-900 text-[28px] font-black">{value}</div>
        </div>
    </div>
);

export default Dashboard;
