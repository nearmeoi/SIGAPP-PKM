import React from 'react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';

interface DefaultLayoutProps {
    children: React.ReactNode;
    mainClassName?: string;
    mainStyle?: React.CSSProperties;
}

export default function DefaultLayout({ children, mainClassName = 'site-main-content', mainStyle }: DefaultLayoutProps) {
    return (
        <div className="layout-wrapper min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className={`flex-1 ${mainClassName}`} style={mainStyle}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
