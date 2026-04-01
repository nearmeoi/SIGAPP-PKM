<?php

namespace App\Http\Controllers;

use App\Models\JenisPkm;
use App\Models\Pengajuan;
use App\Models\Testimoni;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        // Peta PKM publik: hanya yang sudah diterima/selesai dan memiliki koordinat
        $pkmData = Pengajuan::with(['aktivitas'])
            ->whereIn('status_pengajuan', ['diterima', 'selesai'])
            ->whereNotNull('latitude')
            ->get(['id_pengajuan', 'judul_kegiatan', 'created_at', 'kebutuhan',
                   'provinsi', 'kota_kabupaten', 'kecamatan', 'kelurahan_desa',
                   'latitude', 'longitude'])
            ->map(fn ($p) => [
                'id'        => $p->id_pengajuan,
                'nama'      => $p->judul_kegiatan,
                'tahun'     => $p->created_at?->year ?? date('Y'),
                'status'    => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
                'deskripsi' => $p->kebutuhan ?? '',
                'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
                'provinsi'  => $p->provinsi ?? '',
                'kabupaten' => $p->kota_kabupaten ?? '',
                'kecamatan' => $p->kecamatan ?? '',
                'desa'      => $p->kelurahan_desa ?? '',
                'lat'       => (float) ($p->latitude ?? 0),
                'lng'       => (float) ($p->longitude ?? 0),
            ]);

        // Chart stats: 1 query untuk semua agregat tahun-status
        $allPengajuan = Pengajuan::selectRaw('YEAR(created_at) as year, status_pengajuan, COUNT(*) as total')
            ->whereNotNull('created_at')
            ->groupBy('year', 'status_pengajuan')
            ->get();

        $years = $allPengajuan->pluck('year')->unique()->sort()->values()->toArray();

        // Ringkasan statistik: 1 query untuk total per-status
        $statusCounts = Pengajuan::selectRaw("
            COUNT(*) as total,
            SUM(status_pengajuan = 'diterima') as total_diterima,
            SUM(status_pengajuan = 'selesai')  as total_selesai
        ")->first();

        $chartStats = [
            'years'           => $years,
            'selesai'         => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'selesai')->sum('total'))->toArray(),
            'berlangsung'     => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'diterima')->sum('total'))->toArray(),
            'total_pengajuan' => (int) ($statusCounts->total ?? 0),
            'total_diterima'  => (int) ($statusCounts->total_diterima ?? 0),
            'total_selesai'   => (int) ($statusCounts->total_selesai ?? 0),
        ];

        $testimonials = Testimoni::latest()->limit(10)->get();

        // Data user jika sudah login
        $user          = null;
        $userPengajuan = collect();
        $listJenisPkm  = collect();

        if (Auth::check()) {
            $user          = Auth::user();
            $userPengajuan = Pengajuan::with(['jenisPkm'])
                ->where('id_user', $user->id_user)
                ->latest()
                ->get();
            $listJenisPkm = JenisPkm::all();
        }

        return Inertia::render('LandingPage', [
            'pkmData'       => $pkmData,
            'user'          => $user,
            'userPengajuan' => $userPengajuan,
            'listJenisPkm'  => $listJenisPkm,
            'chartStats'    => $chartStats,
            'testimonials'  => $testimonials,
        ]);
    }
}
