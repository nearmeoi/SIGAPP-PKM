<?php

use App\Http\Controllers\Admin\AktivitasController;
use App\Http\Controllers\Admin\ArsipController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\PegawaiController;
use App\Http\Controllers\Admin\PengajuanController;
use App\Http\Controllers\Admin\TestimoniController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\PengajuanUserController;
use App\Models\Aktivitas;
use App\Models\Arsip;
use App\Models\JenisPkm;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\Testimoni;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─────────────────────────────────────────────
// Landing Page (public)
// ─────────────────────────────────────────────
Route::get('/', function () {
    $pkmData = Pengajuan::with(['jenisPkm', 'aktivitas'])
        ->whereIn('status_pengajuan', ['diterima', 'selesai'])
        ->whereNotNull('latitude')
        ->get()
        ->map(fn ($p) => [
            'id'       => $p->id_pengajuan,
            'nama'     => $p->judul_kegiatan,
            'tahun'    => $p->created_at?->year ?? date('Y'),
            'status'   => $p->aktivitas?->status_pelaksanaan === 'selesai' ? 'selesai' : 'berlangsung',
            'deskripsi'=> $p->kebutuhan ?? '',
            'thumbnail'=> $p->aktivitas?->url_thumbnail ?? '',
            'provinsi' => $p->provinsi ?? '',
            'kabupaten'=> $p->kota_kabupaten ?? '',
            'kecamatan'=> $p->kecamatan ?? '',
            'desa'     => $p->kelurahan_desa ?? '',
            'lat'      => $p->latitude ?? 0,
            'lng'      => $p->longitude ?? 0,
        ]);

    $user          = null;
    $userPengajuan = collect();
    $listJenisPkm  = collect();

    if (Auth::check()) {
        $user          = Auth::user();
        $userPengajuan = Pengajuan::with(['jenisPkm'])->where('id_user', $user->id_user)->latest()->get();
        $listJenisPkm  = JenisPkm::all();
    }

    $allPengajuan = Pengajuan::selectRaw('YEAR(created_at) as year, status_pengajuan, COUNT(*) as total')
        ->whereNotNull('created_at')
        ->groupBy('year', 'status_pengajuan')
        ->get();

    $years      = $allPengajuan->pluck('year')->unique()->sort()->values()->toArray();
    $chartStats = [
        'years'           => $years,
        'selesai'         => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'selesai')->sum('total'))->toArray(),
        'berlangsung'     => collect($years)->map(fn ($y) => $allPengajuan->where('year', $y)->where('status_pengajuan', 'diterima')->sum('total'))->toArray(),
        'total_pengajuan' => Pengajuan::count(),
        'total_diterima'  => Pengajuan::where('status_pengajuan', 'diterima')->count(),
        'total_selesai'   => Pengajuan::where('status_pengajuan', 'selesai')->count(),
    ];

    $testimonials = Testimoni::latest()->limit(10)->get();

    return Inertia::render('LandingPage', [
        'pkmData'      => $pkmData,
        'user'         => $user,
        'userPengajuan'=> $userPengajuan,
        'listJenisPkm' => $listJenisPkm,
        'chartStats'   => $chartStats,
        'testimonials' => $testimonials,
    ]);
})->name('landing');

// Public testimonial submission
Route::post('/testimoni/public', function (Request $request) {
    $request->validate([
        'nama_pemberi' => 'required|string|max:255',
        'rating'       => 'required|integer|min:1|max:5',
        'pesan_ulasan' => 'nullable|string|max:2000',
    ]);

    Testimoni::create([
        'id_aktivitas' => Aktivitas::first()?->id_aktivitas ?? 1,
        'nama_pemberi' => $request->nama_pemberi,
        'rating'       => $request->rating,
        'pesan_ulasan' => $request->pesan_ulasan,
    ]);

    return redirect()->back()->with('success', 'Testimoni berhasil dikirim.');
})->name('testimoni.public');

// Geocode proxy
Route::get('/api/geocode', function (Request $request) {
    $query = $request->input('q', '');
    if (strlen($query) < 2) {
        return response()->json([]);
    }

    $params = http_build_query([
        'q'             => $query.', Indonesia',
        'format'        => 'json',
        'limit'         => '8',
        'countrycodes'  => 'id',
        'addressdetails'=> '1',
    ]);

    $url     = "https://nominatim.openstreetmap.org/search?{$params}";
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: SIGAP-PKM/1.0\r\nAccept-Language: id\r\n",
            'timeout'=> 10,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return response()->json([]);
    }

    return response($response)->header('Content-Type', 'application/json');
})->name('api.geocode');

// ─────────────────────────────────────────────
// Guest routes
// ─────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');

    Route::get('/verify-email', function () {
        return Inertia::render('Auth/VerifyEmail');
    })->name('verification.notice');

    Route::get('/login/dosen', function (Request $request) {
        $user = $request->user();
        return Inertia::render('Auth/LoginDosen', [
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ?? 'dosen',
                        'avatar' => $user->avatar ?? null,
                    ]
                    : [
                        'id' => 'preview-dosen',
                        'name' => 'Akun Dosen SIGAP',
                        'email' => 'dosen@poltekparmakassar.ac.id',
                        'role' => 'dosen',
                        'avatar' => null,
                    ],
            ],
            'pkmData' => []
        ]);
    })->name('login.dosen');

    Route::get('/login/masyarakat', function (Request $request) {
        $user = $request->user();
        return Inertia::render('Auth/LoginMasyarakat', [
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ?? 'masyarakat',
                        'avatar' => $user->avatar ?? null,
                    ]
                    : [
                        'id' => 'preview-masyarakat',
                        'name' => 'Akun Masyarakat SIGAP',
                        'email' => 'masyarakat@poltekparmakassar.ac.id',
                        'role' => 'masyarakat',
                        'avatar' => null,
                    ],
            ],
            'pkmData' => []
        ]);
    })->name('login.masyarakat');

    Route::get('/pengajuan', function (Request $request) {
        $user = $request->user();
        $defaultRole = $user ? ($user->role ?? 'masyarakat') : 'masyarakat';
        $requestedRole = strtolower((string) $request->query('role', $defaultRole));
        $role = $requestedRole === 'dosen' ? 'dosen' : 'masyarakat';
        $view = strtolower((string) $request->query('view', 'form'));

        return Inertia::render('Auth/Pengajuan', [
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ?? $role,
                        'avatar' => $user->avatar ?? null,
                    ]
                    : [
                        'id' => $role === 'dosen' ? 'preview-dosen' : 'preview-masyarakat',
                        'name' => $role === 'dosen' ? 'Akun Dosen SIGAP' : 'Akun Masyarakat SIGAP',
                        'email' => $role === 'dosen'
                            ? 'dosen@poltekparmakassar.ac.id'
                            : 'masyarakat@poltekparmakassar.ac.id',
                        'role' => $role,
                        'avatar' => null,
                    ],
            ],
            'role' => $role,
            'initialView' => in_array($view, ['form', 'status'], true) ? $view : 'form',
        ]);
    })->name('pengajuan.index');
});

// ─────────────────────────────────────────────
// Authenticated routes
// ─────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // User: submit pengajuan
    Route::post('/pengajuan', [PengajuanUserController::class, 'store'])->name('pengajuan.store');

    // Global search API
    Route::get('/api/search', function (Request $request) {
        $q     = trim($request->input('q', ''));
        $limit = 5;

        $fmtPengajuan = fn ($p) => ['id' => $p->id_pengajuan, 'title' => $p->judul_kegiatan,  'subtitle' => ucfirst($p->status_pengajuan),     'url' => '/admin/pengajuan/'.$p->id_pengajuan];
        $fmtUser      = fn ($u) => ['id' => $u->id_user,      'title' => $u->name,             'subtitle' => $u->email.' ('.$u->role.')',        'url' => '/admin/users'];
        $fmtPegawai   = fn ($p) => ['id' => $p->id_pegawai,   'title' => $p->nama_pegawai,     'subtitle' => 'NIP: '.($p->nip ?? '-'),           'url' => '/admin/pegawai'];
        $fmtAktivitas = fn ($a) => ['id' => $a->id_aktivitas, 'title' => $a->pengajuan?->judul_kegiatan ?? 'Aktivitas #'.$a->id_aktivitas, 'subtitle' => ucfirst($a->status_pelaksanaan), 'url' => '/admin/aktivitas/'.$a->id_aktivitas];
        $fmtTestimoni = fn ($t) => ['id' => $t->id_testimoni, 'title' => $t->nama_pemberi,     'subtitle' => 'Rating: '.$t->rating.'/5',        'url' => '/admin/testimoni'];
        $fmtArsip     = fn ($a) => ['id' => $a->id_arsip,     'title' => $a->nama_dokumen,     'subtitle' => $a->jenis_arsip,                   'url' => '/admin/arsip'];

        if (strlen($q) < 2) {
            return response()->json([
                'pengajuan' => Pengajuan::latest()->limit($limit)->get(['id_pengajuan', 'judul_kegiatan', 'status_pengajuan'])->map($fmtPengajuan),
                'users'     => User::latest()->limit($limit)->get(['id_user', 'name', 'email', 'role'])->map($fmtUser),
                'pegawai'   => Pegawai::latest()->limit($limit)->get(['id_pegawai', 'nama_pegawai', 'nip'])->map($fmtPegawai),
                'aktivitas' => Aktivitas::with('pengajuan')->latest()->limit($limit)->get(['id_aktivitas', 'id_pengajuan', 'status_pelaksanaan'])->map($fmtAktivitas),
                'testimoni' => Testimoni::latest()->limit($limit)->get(['id_testimoni', 'nama_pemberi', 'rating'])->map($fmtTestimoni),
                'arsip'     => Arsip::latest()->limit($limit)->get(['id_arsip', 'nama_dokumen', 'jenis_arsip'])->map($fmtArsip),
            ]);
        }

        $like = "%{$q}%";

        return response()->json([
            'pengajuan' => Pengajuan::where('judul_kegiatan', 'like', $like)->limit($limit)->get(['id_pengajuan', 'judul_kegiatan', 'status_pengajuan'])->map($fmtPengajuan),
            'users'     => User::where('name', 'like', $like)->orWhere('email', 'like', $like)->limit($limit)->get(['id_user', 'name', 'email', 'role'])->map($fmtUser),
            'pegawai'   => Pegawai::where('nama_pegawai', 'like', $like)->orWhere('nip', 'like', $like)->limit($limit)->get(['id_pegawai', 'nama_pegawai', 'nip'])->map($fmtPegawai),
            'aktivitas' => Aktivitas::with('pengajuan')->where('status_pelaksanaan', 'like', $like)->limit($limit)->get(['id_aktivitas', 'id_pengajuan', 'status_pelaksanaan'])->map($fmtAktivitas),
            'testimoni' => Testimoni::where('nama_pemberi', 'like', $like)->orWhere('pesan_ulasan', 'like', $like)->limit($limit)->get(['id_testimoni', 'nama_pemberi', 'rating'])->map($fmtTestimoni),
            'arsip'     => Arsip::where('nama_dokumen', 'like', $like)->limit($limit)->get(['id_arsip', 'nama_dokumen', 'jenis_arsip'])->map($fmtArsip),
        ]);
    })->name('api.search');

    // ─────────────────────────────────────────
    // Admin routes
    // ─────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'));
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Pengajuan CRUD
        Route::get('/pengajuan/export', [PengajuanController::class, 'export'])->name('pengajuan.export');
        Route::get('/pengajuan', [PengajuanController::class, 'index'])->name('pengajuan.index');
        Route::post('/pengajuan/{id}/tim', [PengajuanController::class, 'storeTim'])->name('pengajuan.store_tim');
        Route::get('/pengajuan/{id}', [PengajuanController::class, 'show'])->name('pengajuan.show');
        Route::put('/pengajuan/{id}', [PengajuanController::class, 'update'])->name('pengajuan.update');
        Route::delete('/pengajuan/{id}', [PengajuanController::class, 'destroy'])->name('pengajuan.destroy');
        Route::put('/pengajuan/{id}/status', [PengajuanController::class, 'updateStatus'])->name('pengajuan.update_status');
        Route::put('/pengajuan/{id}/lokasi', [PengajuanController::class, 'updateLokasi'])->name('pengajuan.update_lokasi');
        Route::delete('/pengajuan/{pengajuanId}/tim/{timId}', [PengajuanController::class, 'destroyTim'])->name('pengajuan.destroy_tim');

        // Pegawai CRUD
        Route::get('/pegawai', [PegawaiController::class, 'index'])->name('pegawai.index');
        Route::post('/pegawai/import', [PegawaiController::class, 'import'])->name('pegawai.import');
        Route::post('/pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
        Route::put('/pegawai/{id}', [PegawaiController::class, 'update'])->name('pegawai.update');
        Route::delete('/pegawai/{id}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');

        // Users CRUD
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');

        // Aktivitas CRUD
        Route::get('/aktivitas', [AktivitasController::class, 'index'])->name('aktivitas.index');
        Route::get('/aktivitas/{id}', [AktivitasController::class, 'show'])->name('aktivitas.show');
        Route::put('/aktivitas/{id}', [AktivitasController::class, 'update'])->name('aktivitas.update');
        Route::delete('/aktivitas/{id}', [AktivitasController::class, 'destroy'])->name('aktivitas.destroy');

        // Testimoni CRUD
        Route::get('/testimoni', [TestimoniController::class, 'index'])->name('testimoni.index');
        Route::post('/testimoni', [TestimoniController::class, 'store'])->name('testimoni.store');
        Route::put('/testimoni/{id}', [TestimoniController::class, 'update'])->name('testimoni.update');
        Route::delete('/testimoni/{id}', [TestimoniController::class, 'destroy'])->name('testimoni.destroy');

        // Master Data (Jenis PKM)
        Route::get('/master/jenis-pkm', [MasterDataController::class, 'indexJenis'])->name('master.jenis.index');
        Route::post('/master/jenis-pkm', [MasterDataController::class, 'storeJenis'])->name('master.jenis.store');
        Route::put('/master/jenis-pkm/{id}', [MasterDataController::class, 'updateJenis'])->name('master.jenis.update');
        Route::delete('/master/jenis-pkm/{id}', [MasterDataController::class, 'destroyJenis'])->name('master.jenis.destroy');

        // Arsip CRUD
        Route::get('/arsip', [ArsipController::class, 'index'])->name('arsip.index');
        Route::post('/arsip', [ArsipController::class, 'store'])->name('arsip.store');
        Route::put('/arsip/{id}', [ArsipController::class, 'update'])->name('arsip.update');
        Route::delete('/arsip/{id}', [ArsipController::class, 'destroy'])->name('arsip.destroy');

        // Notifications API
        Route::get('/api/notifications', function () {
            return response()->json([
                'pengajuan_baru'    => Pengajuan::where('status_pengajuan', 'diproses')->count(),
                'perlu_direvisi'    => Pengajuan::where('status_pengajuan', 'direvisi')->count(),
                'diterima'          => Pengajuan::where('status_pengajuan', 'diterima')->count(),
                'kegiatan_berjalan' => Aktivitas::where('status_pelaksanaan', 'berjalan')->count(),
            ]);
        })->name('api.notifications');

        // Profile
        Route::get('/profile', function () {
            return Inertia::render('Admin/Profile', ['user' => Auth::user()]);
        })->name('profile');
    });
});
