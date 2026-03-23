import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Layout({ children }) {
    return (
        <div className="layout-wrapper">
            <Header />
            <main className="site-main-content">
                {children}
            </main>
            <Footer />
        </div>
    );
}
