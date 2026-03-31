import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

export default function Layout({ children, mainClassName = 'site-main-content', mainStyle }) {
    return (
        <div className="layout-wrapper">
            <Navbar />
            <main className={mainClassName} style={mainStyle}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
