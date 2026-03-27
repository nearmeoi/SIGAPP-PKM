<?php

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

Route::get('/login/dosen', function () {
    return Inertia::render('Auth/LoginDosen');
})->name('login.dosen');

Route::get('/login/masyarakat', function () {
    return Inertia::render('Auth/LoginMasyarakat');
})->name('login.masyarakat');
