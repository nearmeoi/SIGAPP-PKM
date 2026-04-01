<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ── 1 query untuk semua statistik pengajuan (sebelumnya 4 query terpisah) ──
        $statusCounts = Pengajuan::selectRaw("
            COUNT(*)                                    as total,
            SUM(status_pengajuan = 'diproses')          as diproses,
            SUM(status_pengajuan = 'diterima')          as diterima,
            SUM(status_pengajuan = 'ditolak')           as ditolak
        ")->first();

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
            ->get(['id_pengajuan', 'judul_kegiatan', 'id_jenis_pkm', 'created_at',
                'kecamatan', 'kelurahan_desa', 'latitude', 'longitude'])
            ->map(fn ($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'jenis_nama' => $p->jenisPkm?->nama_jenis ?? 'Jenis Lainnya',
                'warna_icon' => $p->jenisPkm?->warna_icon ?? '#64748b',
                'tahun' => $p->created_at?->year ?? date('Y'),
                'status' => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
                'kecamatan' => $p->kecamatan ?? '',
                'desa' => $p->kelurahan_desa ?? '',
                'lat' => (float) ($p->latitude ?? 0),
                'lng' => (float) ($p->longitude ?? 0),
            ])
            ->values()
            ->toArray();

        // ── Pie Chart: Sebaran Berdasarkan Jenis PKM ──
        $pieChartData = Pengajuan::with('jenisPkm')
            ->whereNotNull('id_jenis_pkm')
            ->selectRaw('id_jenis_pkm, COUNT(*) as total')
            ->groupBy('id_jenis_pkm')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->jenisPkm?->nama_jenis ?? 'Lainnya',
                'color' => $item->jenisPkm?->warna_icon ?? '#cbd5e1',
                'count' => $item->total,
            ])
            ->values()
            ->toArray();

        // ── Bar Chart: Tren Pertahun per Jenis PKM ──
        $yearlyRaw = Pengajuan::with('jenisPkm')
            ->whereNotNull('id_jenis_pkm')
            ->selectRaw('YEAR(created_at) as year, id_jenis_pkm, COUNT(*) as total')
            ->groupBy('year', 'id_jenis_pkm')
            ->get();

        $allYears = $yearlyRaw->pluck('year')->unique()->sort()->values()->toArray();
        if (empty($allYears)) {
            $allYears = [(int) date('Y')];
        }

        // Hash-map lookup O(1) menggantikan nested firstWhere() yang O(n²)
        $lookup = $yearlyRaw->keyBy(fn ($r) => "{$r->year}_{$r->id_jenis_pkm}");

        $uniqueJenis = $yearlyRaw
            ->map(fn ($item) => [
                'id_jenis_pkm' => $item->id_jenis_pkm,
                'nama_jenis' => $item->jenisPkm?->nama_jenis ?? 'Lainnya',
                'warna_icon' => $item->jenisPkm?->warna_icon ?? '#cbd5e1',
            ])
            ->unique('id_jenis_pkm')
            ->values();

        $barChartDatasets = $uniqueJenis->map(function ($jenis) use ($allYears, $lookup) {
            return [
                'label' => $jenis['nama_jenis'],
                'data' => array_map(
                    fn ($y) => (int) ($lookup->get("{$y}_{$jenis['id_jenis_pkm']}")?->total ?? 0),
                    $allYears
                ),
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

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalPengajuan' => (int) ($statusCounts->total ?? 0),
                'pengajuanDiproses' => (int) ($statusCounts->diproses ?? 0),
                'pengajuanDiterima' => (int) ($statusCounts->diterima ?? 0),
                'pengajuanDitolak' => (int) ($statusCounts->ditolak ?? 0),
                'totalPegawai' => $totalPegawai,
                'totalAktivitas' => $totalAktivitas,
            ],
            'recentPengajuan' => $recentPengajuan,
            'pkmMapData' => $pkmMapData,
            'pieChartData' => $pieChartData,
            'barChartData' => $barChartData,
        ]);
    }
}
