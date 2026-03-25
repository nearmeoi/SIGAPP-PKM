import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Users,
    FileText,
    Activity,
    CheckCircle,
    Eye,
    ArrowRight,
    LucideIcon
} from 'lucide-react';

const MetricCard = ({ title, val, icon: Icon, color }: { title: string, val: number, icon: LucideIcon, color: string }) => (
    <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-medium text-zinc-500">{title}</div>
            <Icon size={16} className={color} />
        </div>
        <div className="text-[28px] font-bold leading-none text-zinc-900 tracking-tight">{val}</div>
    </div>
);

const Dashboard: React.FC<any> = ({ stats, recentPengajuan, monthlyStats = Array(12).fill(0), recentLogs = [] }) => {

    const maxStat = Math.max(...monthlyStats, 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const statusCfg: Record<string, { label: string; text: string; bg: string; dot: string }> = {
        diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
        diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
        direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
        ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
    };

    const timeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AdminLayout title="">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[24px] font-bold text-zinc-900 tracking-tight">Overview</h1>
                <p className="text-zinc-500 text-[14px] mt-1">SIGAP P3M Dashboard.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <MetricCard title="Diproses" val={stats?.pengajuanDiproses || 0} icon={FileText} color="text-zinc-400" />
                <MetricCard title="Diterima / Selesai" val={stats?.pengajuanDiterima || 0} icon={CheckCircle} color="text-emerald-500" />
                <MetricCard title="Total Pegawai" val={stats?.totalPegawai || 0} icon={Users} color="text-zinc-400" />
                <MetricCard title="Aktivitas" val={stats?.totalAktivitas || 0} icon={Activity} color="text-zinc-400" />
            </div>

            {/* Pengajuan Menunggu Review */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm mb-8 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50">
                    <div>
                        <h2 className="text-[14px] font-semibold text-zinc-900">Pengajuan Terbaru</h2>
                        <p className="text-[12px] text-zinc-500 mt-0.5 mt-0.5">Pengajuan menunggu review admin</p>
                    </div>
                    <a href="/admin/pengajuan" className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
                        Lihat Semua <ArrowRight size={14} />
                    </a>
                </div>
                <div className="divide-y divide-zinc-100">
                    {(recentPengajuan || []).length === 0 ? (
                        <div className="py-12 text-center text-zinc-400 text-[14px]">Tidak ada pengajuan yang perlu di review.</div>
                    ) : (
                        (recentPengajuan || []).map((p: any) => {
                            const st = statusCfg[p.status_pengajuan] || statusCfg.diproses;
                            // Clean up "(Diproses)", "(Diterima)" etc from dummy data titles so it doesn't look double
                            const judulBersih = (p.judul_kegiatan || '').replace(/\s*\((diproses|diterima|direvisi|ditolak|selesai)\)/i, '');

                            return (
                                <div key={p.id_pengajuan} className="flex items-center px-6 py-4 hover:bg-zinc-50/50 transition-colors">

                                    {/* Kiri: Nama dan Judul */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="text-[14px] font-semibold text-zinc-900 truncate block">
                                            {p.user?.name}
                                            <span className="text-zinc-400 font-normal mx-2">—</span>
                                            <a href={`/admin/pengajuan/${p.id_pengajuan}`} className="hover:text-indigo-600 transition-colors" title={judulBersih}>
                                                {judulBersih}
                                            </a>
                                        </div>
                                    </div>

                                    {/* Tengah: Status (Lebar Tetap supaya centering sempurna) */}
                                    <div className="flex-shrink-0 flex justify-center w-[150px]">
                                        <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-md text-[12px] font-medium ${st.bg} ${st.text} whitespace-nowrap`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                            {st.label}
                                        </div>
                                    </div>

                                    {/* Kanan: Waktu */}
                                    <div className="flex-1 min-w-0 pl-4 flex justify-end">
                                        <div className="text-[12px] font-medium text-zinc-400 whitespace-nowrap text-right">
                                            {timeAgo(p.created_at)}
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bottom Row: Chart + Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Chart Panel */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm p-6 relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-[14px] font-semibold text-zinc-900">Statistik Pengajuan</h2>
                            <p className="text-[12px] text-zinc-500 mt-0.5">Tahun {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="relative w-full flex flex-col min-h-[180px]">
                        <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-zinc-400 font-mono pointer-events-none">
                            <div className="border-t border-zinc-100 w-full relative"><span className="absolute -top-2 bg-white pr-2">{maxStat}</span></div>
                            <div className="border-t border-zinc-100 w-full relative"><span className="absolute -top-2 bg-white pr-2">{Math.round(maxStat * 0.66)}</span></div>
                            <div className="border-t border-zinc-100 w-full relative"><span className="absolute -top-2 bg-white pr-2">{Math.round(maxStat * 0.33)}</span></div>
                            <div className="border-t border-zinc-200 w-full relative"><span className="absolute -top-2 bg-white pr-2">0</span></div>
                        </div>
                        <div className="relative z-10 flex h-[180px] items-end gap-2 pl-8 pt-2 pb-[1px]">
                            {monthlyStats.map((val: number, i: number) => {
                                const heightPct = Math.max((val / maxStat) * 100, 1);
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                                        {val > 0 && <div className="absolute -top-6 bg-zinc-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{val}</div>}
                                        <div className="w-full bg-zinc-900 rounded-t-sm opacity-20 group-hover:opacity-60 transition-all cursor-pointer" style={{ height: `${heightPct}%` }}></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-between pl-8 mt-3 text-[11px] font-medium text-zinc-500">
                        {months.map((m, idx) => <span key={idx} className="flex-1 text-center truncate">{m}</span>)}
                    </div>
                </div>

                {/* Log Aktivitas */}
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/50">
                        <h2 className="text-[14px] font-semibold text-zinc-900">Log Aktivitas</h2>
                        <p className="text-[12px] text-zinc-500 mt-0.5">Catatan tindakan sistem & admin</p>
                    </div>
                    <div className="px-6 py-5 space-y-5">
                        {recentLogs.length === 0 ? (
                            <div className="text-[13px] text-zinc-400 text-center py-4">Belum ada aktivitas.</div>
                        ) : (
                            recentLogs.map((log: any, i: number) => {
                                const sCfg = statusCfg[log.status] || { dot: 'bg-zinc-300', text: 'text-zinc-600' };
                                return (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${sCfg.dot}`} />
                                        <div>
                                            <div className={`text-[13px] font-semibold ${sCfg.text}`}>{log.title}</div>
                                            <div className="text-[12px] text-zinc-700 leading-snug mt-0.5">{log.desc}</div>
                                            <div className="text-[11px] font-medium text-zinc-400 mt-1">{timeAgo(log.time)}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout >
    );
};

export default Dashboard;
