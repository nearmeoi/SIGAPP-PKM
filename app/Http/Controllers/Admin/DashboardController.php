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
        $pengajuanDiterima = Pengajuan::where('status_pengajuan', 'diterima')->count();
        $pengajuanDitolak = Pengajuan::where('status_pengajuan', 'ditolak')->count();
        $totalPegawai = Pegawai::count();
        $totalAktivitas = Aktivitas::where('status_pelaksanaan', 'berjalan')->count();

        $recentPengajuan = Pengajuan::with(['user', 'jenisPkm'])
            ->where('status_pengajuan', 'diproses')
            ->latest('created_at')
            ->take(5)
            ->get();

        $pkmMapData = Pengajuan::with(['jenisPkm', 'aktivitas'])
            ->where('status_pengajuan', 'diterima')
            ->whereNotNull('latitude')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'jenis_nama' => $p->jenisPkm?->nama_jenis ?? 'Jenis Lainnya',
                'warna_icon' => $p->jenisPkm?->warna_icon ?? '#64748b',
                'tahun' => $p->created_at?->year ?? date('Y'),
                'status' => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
                'kecamatan' => $p->kecamatan ?? '',
                'desa' => $p->kelurahan_desa ?? '',
                'lat' => $p->latitude ?? 0,
                'lng' => $p->longitude ?? 0,
            ])
            ->values()
            ->toArray();

        // Pie Chart: Sebaran Berdasarkan Jenis PKM
        $pieChartData = Pengajuan::with('jenisPkm')
            ->whereNotNull('id_jenis_pkm')
            ->selectRaw('id_jenis_pkm, COUNT(*) as total')
            ->groupBy('id_jenis_pkm')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->jenisPkm?->nama_jenis ?? 'Lainnya',
                    'color' => $item->jenisPkm?->warna_icon ?? '#cbd5e1',
                    'count' => $item->total,
                ];
            })
            ->values()
            ->toArray();

        // Bar Chart: Tren Pertahun Berdasarkan Jenis PKM
        $allYears = Pengajuan::whereNotNull('created_at')
            ->selectRaw('YEAR(created_at) as year')
            ->pluck('year')->unique()->sort()->values()->toArray();
        
        if(empty($allYears)) $allYears = [date('Y')];
        
        $yearlyRaw = Pengajuan::with('jenisPkm')
            ->whereNotNull('id_jenis_pkm')
            ->selectRaw('YEAR(created_at) as year, id_jenis_pkm, COUNT(*) as total')
            ->groupBy('year', 'id_jenis_pkm')
            ->get();
            
        $uniqueJenis = $yearlyRaw->map(function ($item) {
            return [
                'id_jenis_pkm' => $item->id_jenis_pkm,
                'nama_jenis' => $item->jenisPkm?->nama_jenis ?? 'Lainnya',
                'warna_icon' => $item->jenisPkm?->warna_icon ?? '#cbd5e1'
            ];
        })->unique('id_jenis_pkm')->values();

        $barChartDatasets = $uniqueJenis->map(function ($jenis) use ($allYears, $yearlyRaw) {
            $dataCount = [];
            foreach ($allYears as $y) {
                $match = $yearlyRaw->firstWhere(function ($val) use ($y, $jenis) {
                    return $val->year == $y && $val->id_jenis_pkm == $jenis['id_jenis_pkm'];
                });
                $dataCount[] = $match ? $match->total : 0;
            }
            return [
                'label' => $jenis['nama_jenis'],
                'data' => $dataCount,
                'backgroundColor' => $jenis['warna_icon'],
                'borderRadius' => 6,
                'barPercentage' => 0.55,
                'categoryPercentage' => 0.7,
            ];
        })->values()->toArray();

        $barChartData = [
            'labels' => $allYears,
            'datasets' => $barChartDatasets,
        ];

        $recentLogs = Pengajuan::with('user')
            ->latest('updated_at')
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
            })
            ->values()
            ->toArray();

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
            'pkmMapData' => $pkmMapData,
            'pieChartData' => $pieChartData,
            'barChartData' => $barChartData,
            'recentLogs' => $recentLogs,
        ]);
    }
}
