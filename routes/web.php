<?php

use App\Http\Controllers\Admin\AktivitasController;
use App\Http\Controllers\Admin\ArsipController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\PegawaiController;
use App\Http\Controllers\Admin\PengajuanController;
use App\Http\Controllers\Admin\SearchController;
use App\Http\Controllers\Admin\TemplateDokumenController;
use App\Http\Controllers\Admin\TestimoniController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\User\PengajuanUserController;
use App\Models\Aktivitas;
use App\Models\Pengajuan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─────────────────────────────────────────────
// Landing Page & Public routes
// ─────────────────────────────────────────────
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Panduan page
Route::get('/panduan', function () {
    return Inertia::render('Panduan');
})->name('panduan');

// Testimoni publik (Umum)
Route::post('/testimoni/public', [LandingController::class, 'storePublicTestimoni'])->middleware('throttle:10,1')->name('testimoni.public.store');

// Geocode proxy — Rate limited 30 req/menit per IP
Route::get('/api/geocode', function (Request $request) {
    $query = $request->input('q', '');
    if (strlen($query) < 2) {
        return response()->json([]);
    }

    $params = http_build_query([
        'q' => $query.', Indonesia',
        'format' => 'json',
        'limit' => '8',
        'countrycodes' => 'id',
        'addressdetails' => '1',
    ]);

    $url = "https://nominatim.openstreetmap.org/search?{$params}";
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: SIGAP-PKM/1.0\r\nAccept-Language: id\r\n",
            'timeout' => 10,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return response()->json([]);
    }

    return response($response)->header('Content-Type', 'application/json');
})->middleware('throttle:30,1')->name('api.geocode');

// Reverse geocode — lat/lng → address
Route::get('/api/reverse-geocode', function (Request $request) {
    $lat = $request->input('lat');
    $lon = $request->input('lon');
    if (! $lat || ! $lon) {
        return response()->json([]);
    }

    $params = http_build_query([
        'lat' => $lat,
        'lon' => $lon,
        'format' => 'json',
        'addressdetails' => '1',
    ]);

    $url = "https://nominatim.openstreetmap.org/reverse?{$params}";
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "User-Agent: SIGAP-PKM/1.0\r\nAccept-Language: id\r\n",
            'timeout' => 10,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return response()->json([]);
    }

    return response($response)->header('Content-Type', 'application/json');
})->middleware('throttle:30,1')->name('api.reverse-geocode');

// ─────────────────────────────────────────────
// Pengumpulan Arsip Publik
// ─────────────────────────────────────────────
Route::get('/kumpul-arsip', function () {
    return Inertia::render('Public/PengumpulanArsip', [
        'namaKegiatan' => 'Pengumpulan Arsip PKM',
        'kode' => '',
    ]);
})->name('arsip.kumpul.index');

Route::get('/kumpul-arsip/{kode}', [LandingController::class, 'showArsipKumpul'])->name('arsip.kumpul.public');
Route::post('/kumpul-arsip/{kode}', [LandingController::class, 'storeArsipKumpul'])->middleware('throttle:10,1')->name('arsip.kumpul.public.store');

// ─────────────────────────────────────────────
// Pengisian Testimoni Publik
// ─────────────────────────────────────────────
Route::get('/testimoni', function () {
    return Inertia::render('Public/Testimoni', [
        'namaKegiatan' => 'Testimoni PKM',
        'kode' => '',
    ]);
})->name('testimoni.index');

Route::get('/testimoni/{kode}', [LandingController::class, 'showTestimoni'])->name('testimoni.public');
Route::post('/testimoni/{kode}', [LandingController::class, 'storeTestimoni'])->middleware('throttle:10,1')->name('testimoni.public.store_activity');

// ─────────────────────────────────────────────
// Guest & Auth Management routes
// ─────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/check-nip', [AuthController::class, 'checkNip'])->name('check-nip');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');

    // Specialized login pages
    Route::get('/login/dosen', [AuthController::class, 'showLoginDosen'])->name('login.dosen');
    Route::get('/login/masyarakat', [AuthController::class, 'showLoginMasyarakat'])->name('login.masyarakat');

    Route::get('/verify-email', function () {
        return Inertia::render('Auth/VerifyEmail');
    })->name('verification.notice');
});

// Public Template Downloader (Accessible for guests and authenticated users)
Route::get('/template/{jenis}', [TemplateDokumenController::class, 'downloadTemplate'])->name('template.download');

// User Pages (Pengajuan & Status)
Route::get('/pengajuan', [PengajuanUserController::class, 'index'])->name('pengajuan.form');
Route::get('/cek-status', [PengajuanUserController::class, 'index'])->name('pengajuan.status');

// ─────────────────────────────────────────────
// Authenticated routes
// ─────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // User Pages (Pengajuan & Status)
    Route::get('/pengajuan', [PengajuanUserController::class, 'index'])->name('pengajuan.form');
    Route::get('/cek-status', [PengajuanUserController::class, 'index'])->name('pengajuan.status');

    // User: submit pengajuan
    Route::post('/pengajuan', [PengajuanUserController::class, 'store'])->name('pengajuan.store');

    // ─────────────────────────────────────────
    // Admin routes
    // ─────────────────────────────────────────
    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'));
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Global search API (admin only)
        Route::get('/api/search', SearchController::class)->name('api.search');

        // Pengajuan CRUD
        Route::get('/pengajuan/export', [PengajuanController::class, 'export'])->name('pengajuan.export');
        Route::get('/pengajuan', [PengajuanController::class, 'index'])->name('pengajuan.index');
        Route::post('/pengajuan/{id}/tim', [PengajuanController::class, 'storeTim'])->name('pengajuan.store_tim');
        Route::put('/pengajuan/{id}/tim', [PengajuanController::class, 'syncTim'])->name('pengajuan.sync_tim');
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

        // Template Dokumen
        Route::get('/templates', [TemplateDokumenController::class, 'index'])->name('templates.index');
        Route::post('/templates', [TemplateDokumenController::class, 'store'])->name('templates.store');
        Route::delete('/templates/{jenis}', [TemplateDokumenController::class, 'destroy'])->name('templates.destroy');

        // Arsip CRUD
        Route::get('/arsip', [ArsipController::class, 'index'])->name('arsip.index');
        Route::post('/arsip', [ArsipController::class, 'store'])->name('arsip.store');
        Route::put('/arsip/{id}', [ArsipController::class, 'update'])->name('arsip.update');
        Route::delete('/arsip/{id}', [ArsipController::class, 'destroy'])->name('arsip.destroy');

        // Notifications API
        Route::get('/api/notifications', function () {
            $counts = Pengajuan::selectRaw("
                SUM(status_pengajuan = 'diproses')  as pengajuan_baru,
                SUM(status_pengajuan = 'direvisi')  as perlu_direvisi,
                SUM(status_pengajuan = 'diterima')  as diterima
            ")->first();

            $kegiatanBerjalan = Aktivitas::where('status_pelaksanaan', 'berjalan')->count();

            return response()->json([
                'pengajuan_baru' => (int) ($counts->pengajuan_baru ?? 0),
                'perlu_direvisi' => (int) ($counts->perlu_direvisi ?? 0),
                'pengajuan_diterima' => (int) ($counts->diterima ?? 0),
                'kegiatan_berjalan' => $kegiatanBerjalan,
            ]);
        })->name('api.notifications');

        // Profile
        Route::get('/profile', function () {
            return Inertia::render('Admin/Profile', ['user' => Auth::user()]);
        })->name('profile');
    });
});
