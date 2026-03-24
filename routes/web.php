<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\PengajuanUserController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PengajuanController;
use App\Http\Controllers\Admin\PegawaiController;
use App\Http\Controllers\Admin\MasterDataController;
use App\Http\Controllers\Admin\ArsipController;

Route::inertia('/', 'LandingPage')->name('landing');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', [PengajuanUserController::class, 'dashboard'])->name('dashboard');
    Route::get('/pengajuan/create', [PengajuanUserController::class, 'create'])->name('pengajuan.create');
    Route::post('/pengajuan', [PengajuanUserController::class, 'store'])->name('pengajuan.store');
    Route::get('/pengajuan/{id}', [PengajuanUserController::class, 'show'])->name('pengajuan.show');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(
        function () {
            Route::get('/', fn() => redirect()->route('admin.dashboard'));

            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/pengajuan', [PengajuanController::class, 'index'])->name('pengajuan.index');
            Route::get('/pengajuan/{id}', [PengajuanController::class, 'show'])->name('pengajuan.show');
            Route::put('/pengajuan/{id}/status', [PengajuanController::class, 'updateStatus'])->name('pengajuan.update_status');
            Route::post('/pengajuan/{id}/aktivitas', [PengajuanController::class, 'updateAktivitas'])->name('pengajuan.update_aktivitas');
            Route::post('/pengajuan/{id}/tim', [PengajuanController::class, 'storeTim'])->name('pengajuan.store_tim');
            Route::delete('/pengajuan/{pengajuanId}/tim/{timId}', [PengajuanController::class, 'destroyTim'])->name('pengajuan.destroy_tim');

            Route::get('/pegawai', [PegawaiController::class, 'index'])->name('pegawai.index');
            Route::post('/pegawai', [PegawaiController::class, 'store'])->name('pegawai.store');
            Route::post('/pegawai/import', [PegawaiController::class, 'import'])->name('pegawai.import');
            Route::put('/pegawai/{id}', [PegawaiController::class, 'update'])->name('pegawai.update');
            Route::delete('/pegawai/{id}', [PegawaiController::class, 'destroy'])->name('pegawai.destroy');
            Route::get('/users', [\App\Http\Controllers\Admin\UserController::class, 'index'])->name('users.index');
            Route::post('/users', [\App\Http\Controllers\Admin\UserController::class, 'store'])->name('users.store');
            Route::put('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{id}', [\App\Http\Controllers\Admin\UserController::class, 'destroy'])->name('users.destroy');
            Route::get('/aktivitas', [\App\Http\Controllers\Admin\AktivitasController::class, 'index'])->name('aktivitas.index');
            Route::get('/aktivitas/{id}', [\App\Http\Controllers\Admin\AktivitasController::class, 'show'])->name('aktivitas.show');
            Route::get('/testimoni', [\App\Http\Controllers\Admin\TestimoniController::class, 'index'])->name('testimoni.index');
            Route::get('/master/jenis-pkm', [MasterDataController::class, 'indexJenis'])->name('master.jenis.index');
            Route::post('/master/jenis-pkm', [MasterDataController::class, 'storeJenis'])->name('master.jenis.store');
            Route::put('/master/jenis-pkm/{id}', [MasterDataController::class, 'updateJenis'])->name('master.jenis.update');
            Route::delete('/master/jenis-pkm/{id}', [MasterDataController::class, 'destroyJenis'])->name('master.jenis.destroy');
            Route::get('/arsip', [ArsipController::class, 'index'])->name('arsip.index');
            Route::post('/arsip', [ArsipController::class, 'store'])->name('arsip.store');
            Route::delete('/arsip/{id}', [ArsipController::class, 'destroy'])->name('arsip.destroy');
        }
    );
});
