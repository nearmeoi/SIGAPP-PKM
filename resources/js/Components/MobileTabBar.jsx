import React from 'react';

const MobileTabBar = ({ activeTab = 'peta', onTabChange }) => {
    const tabs = [
        { id: 'beranda', label: 'Beranda', icon: 'fa-solid fa-house', href: 'https://p3m.poltekparmakassar.ac.id/' },
        { id: 'peta', label: 'Peta', icon: 'fa-solid fa-map-location-dot' },
        { id: 'kegiatan', label: 'Kegiatan', icon: 'fa-solid fa-clipboard-list' },
        { id: 'akun', label: 'Akun', icon: 'fa-solid fa-user', href: '/login' },
    ];

    return (
        <nav className="mobile-tab-bar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`mobile-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                        if (tab.href) {
                            window.location.href = tab.href;
                        } else {
                            onTabChange?.(tab.id);
                        }
                    }}
                >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default MobileTabBar;
