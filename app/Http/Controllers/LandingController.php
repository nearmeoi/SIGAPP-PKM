<?php

namespace App\Http\Controllers;

use App\Models\Aktivitas;
use App\Models\Arsip;
use App\Models\JenisPkm;
use App\Models\Pengajuan;
use App\Models\Testimoni;
use App\Models\Kontak;
use App\Models\EvaluasiSistem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        // Peta PKM publik: hanya yang sudah diterima/selesai dan memiliki koordinat
        $pkmData = Pengajuan::with(['aktivitas.testimoni', 'aktivitas.arsip', 'timKegiatan.pegawai', 'jenisPkm'])
            ->whereNotNull('latitude')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id_pengajuan,
                'nama' => $p->judul_kegiatan,
                'tahun' => $p->created_at?->year ?? date('Y'),
                'jenis_pkm' => $p->jenisPkm?->nama_jenis ?? '',
                'warna_icon' => $p->jenisPkm?->warna_icon ?? '',
                'status' => $p->aktivitas
                    ? ($p->aktivitas->status_pelaksanaan === 'selesai' ? 'selesai'
                        : (in_array($p->aktivitas->status_pelaksanaan, ['berjalan', 'persiapan']) ? 'berlangsung' : 'belum_mulai'))
                    : (in_array($p->status_pengajuan, ['diterima', 'berlangsung']) ? 'belum_mulai' : 
                        ($p->status_pengajuan === 'belum_diajukan' ? 'belum_mulai' : 'ada_pengajuan')),
                'deskripsi' => $p->kebutuhan ?? '',
                'thumbnail' => $p->aktivitas?->url_thumbnail ?? '',
                'provinsi' => $p->provinsi ?? '',
                'kabupaten' => $p->kota_kabupaten ?? '',
                'kecamatan' => $p->kecamatan ?? '',
                'desa' => $p->kelurahan_desa ?? '',
                'lat' => (float) ($p->latitude ?? 0),
                'lng' => (float) ($p->longitude ?? 0),
                'total_anggaran' => $p->total_anggaran ?? 0,
                'tim_kegiatan' => $p->timKegiatan->map(fn($t) => [
                    'nama' => $t->pegawai ? $t->pegawai->nama_pegawai : $t->nama_mahasiswa,
                    'peran' => $t->peran_tim,
                ])->toArray(),
                'testimoni' => $p->aktivitas ? $p->aktivitas->testimoni->map(fn($testimoni) => [
                    'nama_pemberi' => $testimoni->nama_pemberi,
                    'rating' => $testimoni->rating,
                    'pesan_ulasan' => $testimoni->pesan_ulasan,
                ])->toArray() : [],
                'arsip_laporan' => $p->aktivitas?->arsip?->where('jenis_arsip', 'laporan_akhir')->first()?->url_dokumen ?? null,
                'dokumentasi' => $p->aktivitas?->arsip?->where('jenis_arsip', 'foto_kegiatan')->first()?->url_dokumen ?? null,
                'tambahan' => ($p->aktivitas?->arsip?->where('jenis_arsip', 'dokumen_lain') ?? collect())
                    ->map(fn($a) => [
                        'nama' => $a->nama_dokumen ?? 'Dokumen Lainnya',
                        'url' => $a->url_dokumen,
                    ])
                    ->values()
                    ->toArray(),
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
            'years' => $years,
            'selesai' => collect($years)->map(fn($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'selesai')->sum('total'))->toArray(),
            'berlangsung' => collect($years)->map(fn($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'diterima')->sum('total'))->toArray(),
            'total_pengajuan' => (int) ($statusCounts->total ?? 0),
            'total_diterima' => (int) ($statusCounts->total_diterima ?? 0),
            'total_selesai' => (int) ($statusCounts->total_selesai ?? 0),
        ];

        $testimonials = Testimoni::latest()->limit(10)->get();

        // Data user jika sudah login
        $user = null;
        $userPengajuan = collect();
        $listJenisPkm = collect();

        if (Auth::check()) {
            $user = Auth::user();
            $userPengajuan = Pengajuan::with(['jenisPkm'])
                ->where('id_user', $user->id_user)
                ->latest()
                ->get();
            $listJenisPkm = JenisPkm::all();
        }

        return Inertia::render('LandingPage', [
            'pkmData' => $pkmData,
            'user' => $user,
            'userPengajuan' => $userPengajuan,
            'listJenisPkm' => $listJenisPkm,
            'chartStats' => $chartStats,
            'testimonials' => $testimonials,
            'listKontak' => Kontak::orderBy('created_at', 'asc')->get()
        ]);
    }

    /**
     * Tampilkan form pengumpulan arsip publik.
     */
    public function showArsipKumpul($kode)
    {
        $pengajuan = Pengajuan::where('kode_unik', $kode)->firstOrFail();

        return Inertia::render('Public/PengumpulanArsip', [
            'kode' => $kode,
            'namaKegiatan' => $pengajuan->judul_kegiatan,
        ]);
    }

    /**
     * Simpan arsip publik.
     */
    public function storeArsipKumpul(Request $request, $kode)
    {
        $pengajuan = Pengajuan::where('kode_unik', $kode)->firstOrFail();
        $aktivitas = Aktivitas::where('id_pengajuan', $pengajuan->id_pengajuan)->first();

        if (!$aktivitas) {
            $aktivitas = Aktivitas::create([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'status_pelaksanaan' => 'berjalan',
            ]);
        }

        $request->validate([
            'laporan' => 'required|url|max:2048',
            'dokumentasi' => 'required|url|max:2048',
            'dokumen_lainnya' => 'nullable|array|max:5',
            'dokumen_lainnya.*.nama_dokumen' => 'nullable|string|max:255',
            'dokumen_lainnya.*.url_dokumen' => 'nullable|url|max:2048',
        ]);

        $commonData = [
            'id_pengajuan' => $pengajuan->id_pengajuan,
            'id_aktivitas' => $aktivitas?->id_aktivitas,
            'keterangan' => 'Dikumpulkan via form publik',
        ];

        Arsip::create(array_merge($commonData, [
            'nama_dokumen' => 'Laporan Akhir',
            'jenis_arsip' => 'laporan_akhir',
            'url_dokumen' => $request->laporan,
        ]));

        Arsip::create(array_merge($commonData, [
            'nama_dokumen' => 'Dokumentasi Kegiatan',
            'jenis_arsip' => 'foto_kegiatan',
            'url_dokumen' => $request->dokumentasi,
        ]));

        foreach (($request->dokumen_lainnya ?? []) as $doc) {
            if (!empty($doc['url_dokumen'])) {
                Arsip::create(array_merge($commonData, [
                    'nama_dokumen' => $doc['nama_dokumen'] ?? 'Dokumen Tambahan',
                    'jenis_arsip' => 'dokumen_lain',
                    'url_dokumen' => $doc['url_dokumen'],
                ]));
            }
        }

        return redirect()->back()->with('success', 'Arsip berhasil dikumpulkan.');
    }

    /**
     * Tampilkan form testimoni publik.
     */
    public function showTestimoni($kode)
    {
        $pengajuan = Pengajuan::where('kode_unik', $kode)->firstOrFail();

        return Inertia::render('Public/Testimoni', [
            'kode' => $kode,
            'namaKegiatan' => $pengajuan->judul_kegiatan,
        ]);
    }

    /**
     * Simpan testimoni publik.
     */
    public function storeTestimoni(Request $request, $kode)
    {
        $pengajuan = Pengajuan::where('kode_unik', $kode)->firstOrFail();
        $aktivitas = Aktivitas::where('id_pengajuan', $pengajuan->id_pengajuan)->first();

        if (!$aktivitas) {
            $aktivitas = Aktivitas::create([
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'status_pelaksanaan' => 'berjalan',
            ]);
        }

        $request->validate([
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
            'masukan' => 'nullable|string|max:2000',
        ]);

        Testimoni::create([
            'id_aktivitas' => $aktivitas?->id_aktivitas,
            'nama_pemberi' => $request->nama_pemberi,
            'rating' => $request->rating,
            'pesan_ulasan' => $request->pesan_ulasan,
            'masukan' => $request->masukan,
        ]);

        return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
    }

    /**
     * Store general public testimony (not tied to specific activity).
     */
    public function storePublicTestimoni(Request $request)
    {
        $request->validate([
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
            'masukan' => 'nullable|string|max:2000',
        ]);

        Testimoni::create([
            'id_aktivitas' => null,
            'nama_pemberi' => $request->nama_pemberi,
            'rating' => $request->rating,
            'pesan_ulasan' => $request->pesan_ulasan,
            'masukan' => $request->masukan,
        ]);

        return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
    }

    public function storeEvaluasiSistem(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'asal_instansi' => 'nullable|string|max:255',
            'no_telp' => 'required|string|max:50',
            'q1' => 'required|integer|min:1|max:5',
            'q2' => 'required|integer|min:1|max:5',
            'q3' => 'required|integer|min:1|max:5',
            'q4' => 'required|integer|min:1|max:5',
            'q5' => 'required|integer|min:1|max:5',
            'masukan' => 'nullable|string|max:1000'
        ]);

        EvaluasiSistem::create($request->all());

        return redirect()->back()->with('success', 'Terima kasih atas evaluasi Anda.');
    }
}
