<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage');
});

Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
})->name('register');

Route::get('/submit-dokumentasi-laporan', function () {
    return Inertia::render('Auth/SubmitDokumentasiLaporan');
})->name('submit.dokumentasi.laporan');

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
                    'avatar_url' => $user->avatar_url ?? null,
                    'profile_photo_url' => $user->profile_photo_url ?? null,
                ]
                : [
                    'id' => 'preview-dosen',
                    'name' => 'Akun Dosen SIGAP',
                    'email' => 'dosen@poltekparmakassar.ac.id',
                    'role' => 'dosen',
                    'avatar' => null,
                    'avatar_url' => null,
                    'profile_photo_url' => null,
                ],
        ],
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
                    'avatar_url' => $user->avatar_url ?? null,
                    'profile_photo_url' => $user->profile_photo_url ?? null,
                ]
                : [
                    'id' => 'preview-masyarakat',
                    'name' => 'Akun Masyarakat SIGAP',
                    'email' => 'masyarakat@poltekparmakassar.ac.id',
                    'role' => 'masyarakat',
                    'avatar' => null,
                    'avatar_url' => null,
                    'profile_photo_url' => null,
                ],
        ],
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
                    'avatar_url' => $user->avatar_url ?? null,
                    'profile_photo_url' => $user->profile_photo_url ?? null,
                ]
                : [
                    'id' => $role === 'dosen' ? 'preview-dosen' : 'preview-masyarakat',
                    'name' => $role === 'dosen' ? 'Akun Dosen SIGAP' : 'Akun Masyarakat SIGAP',
                    'email' => $role === 'dosen'
                        ? 'dosen@poltekparmakassar.ac.id'
                        : 'masyarakat@poltekparmakassar.ac.id',
                    'role' => $role,
                    'avatar' => null,
                    'avatar_url' => null,
                    'profile_photo_url' => null,
                ],
        ],
        'role' => $role,
        'initialView' => in_array($view, ['form', 'status'], true) ? $view : 'form',
    ]);
})->name('pengajuan.index');

Route::post('/logout', function (Request $request) {
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('login');
})->name('logout');
