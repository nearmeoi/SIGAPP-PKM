import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);

    // Initialize Inertia's useForm hook for state management and validation handling
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Handle form submission using form.post
    const submit = (e) => {
        e.preventDefault();

        post('/login', {
            // Reset the password field if the login attempt fails
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="login-page">
            <Head title="Masuk Sisfo - P3M Poltekpar Makassar" />

            <div className="login-container">
                <div className="login-card">
                    {/* Header Banner */}
                    <div className="login-header">
                        <img
                            src="https://p3m.poltekparmakassar.ac.id/storage/2025/10/cropped-Screenshot_2024-01-15_101923-removebg-preview.png"
                            alt="Logo Poltekpar"
                            className="login-logo"
                        />
                        <div className="login-brand-text">
                            <span className="brand-line">PUSAT PENELITIAN DAN</span>
                            <span className="brand-line">PENGABDIAN MASYARAKAT</span>
                            <span className="brand-line">POLITEKNIK PARIWISATA MAKASSAR</span>
                            <span className="brand-subline">Centre for Marine Tourism</span>
                        </div>
                    </div>

                    {/* Login Form Body */}
                    <div className="login-body">
                        <h1 className="login-title">Selamat Datang</h1>
                        <p className="login-subtitle">Silakan masuk menggunakan kredensial Anda</p>

                        <form onSubmit={submit}>
                            {/* Email Input */}
                            <div className="input-group">
                                <label htmlFor="email">Alamat Email</label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="nama@poltekparmakassar.ac.id"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'is-invalid' : ''}
                                        autoComplete="username"
                                        required
                                    />
                                    <i className="fa-regular fa-envelope input-icon"></i>
                                </div>
                                {errors.email && (
                                    <span className="invalid-feedback">{errors.email}</span>
                                )}
                            </div>

                            {/* Password Input */}
                            <div className="input-group">
                                <label htmlFor="password">Kata Sandi</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={errors.password ? 'is-invalid' : ''}
                                        autoComplete="current-password"
                                        required
                                    />
                                    <i className="fa-solid fa-lock input-icon"></i>
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        <i className={`fa - regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} `}></i>
                                    </button>
                                </div>
                                {errors.password && (
                                    <span className="invalid-feedback">{errors.password}</span>
                                )}
                            </div>

                            {/* Form Options (Remember Me & Forgot Pass) */}
                            <div className="form-options">
                                <label className="custom-checkbox" htmlFor="remember">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                    <span>Ingat saya</span>
                                </label>
                                <Link href="#" className="forgot-link">
                                    Lupa sandi?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="btn-login" disabled={processing}>
                                {processing ? (
                                    <>
                                        Memproses <i className="fa-solid fa-spinner fa-spin"></i>
                                    </>
                                ) : (
                                    <>
                                        Masuk ke Sistem <i className="fa-solid fa-arrow-right"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-divider"></div>

                        {/* Registration Prompt Link */}
                        <div className="register-prompt">
                            Belum memiliki akun?
                            {/* The register route is a placeholder as requested */}
                            <Link href="/register" className="register-link">
                                Daftar sekarang
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Back to Home Link */}
                <Link href="/" className="back-to-home">
                    <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
