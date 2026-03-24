<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use App\Models\Pegawai;
use App\Models\Aktivitas;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $totalPengajuan = Pengajuan::count();
        $pengajuanDiproses = Pengajuan::where('status_pengajuan', 'diproses')->count();
        $pengajuanDiterima = Pengajuan::whereIn('status_pengajuan', ['diterima', 'selesai'])->count();
        $pengajuanDitolak = Pengajuan::where('status_pengajuan', 'ditolak')->count();
        $totalPegawai = Pegawai::count();
        $totalAktivitas = Aktivitas::where('status_pelaksanaan', 'berjalan')->count();

        $recentPengajuan = Pengajuan::with(['user', 'jenisPkm'])
            ->where('status_pengajuan', 'diproses')
            ->latest('created_at')
            ->take(5)
            ->get();

        $currentYear = date('Y');
        $monthlyCounts = Pengajuan::whereYear('created_at', $currentYear)
            ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();

        $monthlyStats = [];
        for ($i = 1; $i <= 12; $i++) {
            $monthlyStats[] = $monthlyCounts[$i] ?? 0;
        }

        $recentLogs = Pengajuan::with('user')
            ->whereColumn('updated_at', '>', 'created_at')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id_pengajuan,
                    'title' => "Pengajuan " . ucfirst($p->status_pengajuan),
                    'desc' => "Proposal '{$p->judul_kegiatan}' oleh {$p->user->name}.",
                    'time' => $p->updated_at->toISOString(),
                    'status' => $p->status_pengajuan
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalPengajuan' => $totalPengajuan,
                'pengajuanDiproses' => $pengajuanDiproses,
                'pengajuanDiterima' => $pengajuanDiterima,
                'pengajuanDitolak' => $pengajuanDitolak,
                'totalPegawai' => $totalPegawai,
                'totalAktivitas' => $totalAktivitas,
            ],
            'recentPengajuan' => $recentPengajuan,
            'monthlyStats' => $monthlyStats,
            'recentLogs' => $recentLogs,
        ]);
    }
}
