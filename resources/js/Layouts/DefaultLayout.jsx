import React from 'react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function Layout({ children, mainClassName = 'site-main-content', mainStyle }) {
    return (
        <div className="layout-wrapper">
            <Header />
            <main className={mainClassName} style={mainStyle}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
