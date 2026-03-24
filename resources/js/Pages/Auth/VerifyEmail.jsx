import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

// Reuse the login CSS for visual consistency + verify-specific styles
import '../../../css/login.css';
import '../../../css/verify-email.css';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="login-page">
            <Head title="Verifikasi Email - P3M Poltekpar Makassar" />

            <div className="login-container">
                <div className="login-card" style={{ maxWidth: '480px' }}>
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

                    {/* Verify Email Body */}
                    <div className="login-body verify-email-body">
                        {/* Envelope Illustration */}
                        <div className="verify-icon-wrapper">
                            <div className="verify-icon-circle">
                                <i className="fa-regular fa-envelope-open verify-icon"></i>
                            </div>
                            <div className="verify-icon-dot dot-1"></div>
                            <div className="verify-icon-dot dot-2"></div>
                            <div className="verify-icon-dot dot-3"></div>
                        </div>

                        <h1 className="login-title" style={{ textAlign: 'center' }}>
                            Verifikasi Email Anda
                        </h1>
                        <p className="login-subtitle verify-subtitle">
                            Terima kasih telah mendaftar! Sebelum memulai, mohon verifikasi
                            alamat email Anda dengan mengklik tautan yang baru saja kami
                            kirimkan. Jika Anda tidak menerima email tersebut, kami dengan
                            senang hati akan mengirimkan yang baru.
                        </p>

                        {/* Success Alert — shown when resend link is sent */}
                        {status === 'verification-link-sent' && (
                            <div className="verify-success-alert">
                                <i className="fa-solid fa-circle-check"></i>
                                <span>
                                    Tautan verifikasi baru telah dikirim ke alamat email
                                    yang Anda gunakan saat mendaftar.
                                </span>
                            </div>
                        )}

                        {/* Resend Verification Email */}
                        <form onSubmit={submit}>
                            <button
                                type="submit"
                                className="btn-login verify-btn-resend"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        Mengirim <i className="fa-solid fa-spinner fa-spin"></i>
                                    </>
                                ) : (
                                    <>
                                        Kirim Ulang Email Verifikasi <i className="fa-solid fa-paper-plane"></i>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="login-divider"></div>

                        {/* Logout Link */}
                        <div className="verify-logout-section">
                            <p className="verify-logout-text">
                                Salah memasukkan email?
                            </p>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="verify-btn-logout"
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                Keluar &amp; Daftar Ulang
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
