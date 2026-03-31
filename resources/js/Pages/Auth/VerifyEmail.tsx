import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import '../../../css/login.css';
import '../../../css/verify-email.css';

interface Props {
    status?: string;
}

export default function VerifyEmail({ status }: Props) {
    const { post, processing } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verification-notification');
    };

    return (
        <div className="login-page">
            <Head title="Verifikasi Email - SIGAP PKM" />

            <div className="login-container">
                <div className="login-card" style={{ maxWidth: '480px' }}>
                    <div className="login-header">
                        <img src="/logo-poltekpar.png" alt="Logo Poltekpar" className="login-logo" />
                        <div className="login-brand-text">
                            <span className="brand-line">SISTEM INFORMASI</span>
                            <span className="brand-line">PENGABDIAN KEPADA MASYARAKAT</span>
                            <span className="brand-line">POLITEKNIK PARIWISATA MAKASSAR</span>
                        </div>
                    </div>

                    <div className="login-body verify-email-body">
                        <div className="verify-icon-wrapper">
                            <div className="verify-icon-circle">
                                <i className="fa-regular fa-envelope-open verify-icon"></i>
                            </div>
                        </div>

                        <h1 className="login-title" style={{ textAlign: 'center' }}>Verifikasi Email Anda</h1>
                        <p className="login-subtitle verify-subtitle">
                            Terima kasih telah mendaftar! Sebelum memulai, mohon verifikasi alamat email Anda.
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="verify-success-alert">
                                <i className="fa-solid fa-circle-check"></i>
                                <span>Tautan verifikasi baru telah dikirim ke alamat email Anda.</span>
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <button type="submit" className="btn-login verify-btn-resend" disabled={processing}>
                                {processing ? (
                                    <>Mengirim <i className="fa-solid fa-spinner fa-spin"></i></>
                                ) : (
                                    <>Kirim Ulang Email Verifikasi <i className="fa-solid fa-paper-plane"></i></>
                                )}
                            </button>
                        </form>

                        <div className="login-divider"></div>

                        <div className="verify-logout-section">
                            <Link href="/logout" method="post" as="button" className="verify-btn-logout">
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                Keluar &amp; Daftar Ulang
                            </Link>
                        </div>
                    </div>
                </div>

                <Link href="/" className="back-to-home">
                    <i className="fa-solid fa-arrow-left"></i> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}