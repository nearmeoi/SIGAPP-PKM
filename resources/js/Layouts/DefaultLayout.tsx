import React, { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import Toast from '@/Components/Toast';
import { PageProps } from '@/types/index';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { props } = usePage<PageProps>();
    const flash = props.flash || {};

    const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }>({
        show: false, type: 'success', title: '', message: '',
    });

    useEffect(() => {
        if (flash.success) {
            setToast({ show: true, type: 'success', title: 'Berhasil', message: flash.success });
        } else if (flash.error) {
            setToast({ show: true, type: 'error', title: 'Gagal', message: flash.error });
        }
    }, [flash.success, flash.error]);

    const closeToast = useCallback(() => setToast(prev => ({ ...prev, show: false })), []);

    return (
        <div className="layout-wrapper">
            <Header />
            <main className="site-main-content">
                {children}
            </main>
            <Footer />
            <Toast
                show={toast.show}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={closeToast}
            />
        </div>
    );
}