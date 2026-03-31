import React, { useState } from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Activity, Clock, CheckCircle, Search, Calendar, MapPin } from 'lucide-react';

interface AktivitasItem {
    id_aktivitas: number;
    status_pelaksanaan: string;
    created_at?: string;
        pengajuan?: {
            judul_kegiatan: string;
            tgl_mulai?: string;
            tgl_selesai?: string;
            provinsi?: string;
            kota_kabupaten?: string;
            user?: { name: string };
            jenis_pkm?: { nama_jenis: string };
        };
}

interface PaginatedData {
    data: AktivitasItem[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    listAktivitas: PaginatedData;
}

const AktivitasPage: React.FC<Props> = ({ listAktivitas }) => {
    const allData: AktivitasItem[] = listAktivitas.data || [];
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const data = allData.filter(act => {
        const title = act.pengajuan?.judul_kegiatan || '';
        const titleMatch = title.toLowerCase().includes(search.toLowerCase());
        const statusMatch = !filterStatus || act.status_pelaksanaan === filterStatus;
        return titleMatch && statusMatch;
    });

    const countBerjalan = allData.filter(a => a.status_pelaksanaan !== 'selesai').length;
    const countSelesai = allData.filter(a => a.status_pelaksanaan === 'selesai').length;

    return (
        <AdminLayout title="">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Aktivitas</h1>
                    <p className="text-zinc-500 text-[14px] mt-1">Pantau seluruh status pelaksanaan kegiatan PKM.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[13px] font-medium text-zinc-500 mb-1">Total Kegiatan</div>
                        <div className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{listAktivitas.total}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-zinc-400"><Activity size={18} /></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[13px] font-medium text-zinc-500 mb-1">Sedang Berjalan</div>
                        <div className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{countBerjalan}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-zinc-400"><Clock size={18} /></div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="text-[13px] font-medium text-zinc-500 mb-1">Telah Selesai</div>
                        <div className="text-[28px] font-bold text-zinc-900 tracking-tight leading-none">{countSelesai}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-zinc-100 bg-zinc-50 flex items-center justify-center text-emerald-500"><CheckCircle size={18} /></div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text" placeholder="Cari Judul Kegiatan..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-1.5 rounded-md text-[13px] outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400 transition-all font-medium"
                        />
                    </div>
                    <select
                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-200 cursor-pointer transition-all">
                        <option value="">Semua Status</option>
                        <option value="berjalan">Berjalan</option>
                        <option value="selesai">Selesai</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 w-12 border-r border-zinc-100 bg-zinc-50">No</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Nama Kegiatan</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Jenis & Lokasi</th>
                                <th className="py-3 px-6 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 text-right w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-zinc-400 font-medium text-[13px]">Belum ada aktivitas.</td>
                                </tr>
                            ) : data.map((act) => (
                                <tr key={act.id_aktivitas} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/admin/aktivitas/${act.id_aktivitas}`}>
                                    <td className="py-4 px-6 text-zinc-500 text-[13px] font-mono border-r border-zinc-100 bg-zinc-50/30">
                                        {act.id_aktivitas.toString().padStart(2, '0')}
                                    </td>
                                    <td className="py-4 px-6">
                                        <a href={`/admin/aktivitas/${act.id_aktivitas}`} className="font-semibold text-zinc-900 text-[14px] group-hover:text-indigo-600 transition-colors block">
                                            {act.pengajuan?.judul_kegiatan || '-'}
                                        </a>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-[12px] mt-1.5">
                                            <Calendar size={13} className="text-zinc-400" />
                                            {act.pengajuan?.tgl_mulai ? new Date(act.pengajuan.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'TBD'}
                                            {' – '}
                                            {act.pengajuan?.tgl_selesai ? new Date(act.pengajuan.tgl_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-zinc-700 text-[13px] mb-1">
                                            {act.pengajuan?.jenis_pkm?.nama_jenis || 'General / Lainnya'}
                                        </div>
                                        <div className="flex items-center gap-1 text-zinc-500 text-[12px]">
                                            <MapPin size={12} className="text-zinc-400" />
                                            {act.pengajuan?.kota_kabupaten ? `${act.pengajuan.kota_kabupaten}, ${act.pengajuan.provinsi}` : 'Lokasi TBD'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${act.status_pelaksanaan === 'selesai'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                            }`}>
                                            {act.status_pelaksanaan === 'selesai' ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>}
                                            {act.status_pelaksanaan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">{data.length} aktivitas sesuai filter</span>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AktivitasPage;