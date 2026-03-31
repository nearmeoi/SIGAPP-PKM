import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../../css/documentation-gallery.css';

interface DocumentationGalleryProps {
    status: string;
    driveLink?: string;
}

const DocumentationGallery: React.FC<DocumentationGalleryProps> = ({ status, driveLink = '' }) => {
    // Video Modal State
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Only render the gallery if the project is marked as "selesai"
    if (status !== 'selesai') {
        return null;
    }

    // Professional YouTube generic embed (Nature)
    const videoEmbedUrl = 'https://www.youtube.com/embed/S70B9v1g_1s?rel=0';

    // Use provided driveLink or a placeholder
    const documentationDriveLink = driveLink || 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ';

    const openVideoModal = () => setIsVideoModalOpen(true);
    const closeVideoModal = () => setIsVideoModalOpen(false);

    const videoModalMarkup = isVideoModalOpen ? (
        <div className="gallery-modal-overlay window-mode" onClick={closeVideoModal} style={{ zIndex: 9999999 }}>
            <div className="gallery-modal-window video-modal" onClick={(e) => e.stopPropagation()}>
                <div className="gallery-modal-header">
                    <h3>Video Kegiatan</h3>
                    <button className="gallery-modal-close-window" onClick={closeVideoModal} title="Tutup">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="gallery-modal-body video-body">
                    <iframe
                        className="fullscreen-video-iframe"
                        src={videoEmbedUrl + '&autoplay=1'}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen>
                    </iframe>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="documentation-gallery-container">
            {/* Top Level Section Title */}
            <div className="doc-section-main-title">
                <i className="fa-solid fa-folder-open" style={{ color: '#046bd2' }}></i> Dokumentasi Lampiran
            </div>

            {/* --- SECTION: FOTO (Now a Drive Link) --- */}
            <div className="doc-sub-section">
                <div className="gallery-header">
                    <h4 className="gallery-title">Foto Kegiatan</h4>
                </div>

                <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{
                        fontSize: '13px',
                        color: '#475569',
                        margin: '0 0 10px 0',
                        lineHeight: '1.6'
                    }}>
                        Silahkan klik link di bawah ini untuk mengakses dokumentasi foto:
                    </p>
                    <a
                        href={documentationDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            color: '#1d4ed8',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.style.backgroundColor = '#eff6ff';
                            target.style.borderColor = '#93c5fd';
                            target.style.boxShadow = '0 2px 8px rgba(29,78,216,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.style.backgroundColor = '#ffffff';
                            target.style.borderColor = '#e2e8f0';
                            target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                        }}
                    >
                        <i className="fa-brands fa-google-drive" style={{ fontSize: '16px', color: '#4285f4' }}></i>
                        Buka Google Drive
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '11px', opacity: 0.6 }}></i>
                    </a>
                </div>
            </div>

            {/* --- SECTION: VIDEO --- */}
            <div className="doc-sub-section" style={{ marginTop: '24px' }}>
                <div className="gallery-header">
                    <h4 className="gallery-title">Video Kegiatan</h4>
                    <button className="gallery-see-more" onClick={openVideoModal}>Layar Penuh <i className="fa-solid fa-expand"></i></button>
                </div>

                <div className="gallery-video-wrapper">
                    <div className="responsive-iframe-container">
                        <iframe
                            src={videoEmbedUrl}
                            title="Video Dokumentasi Kegiatan"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            </div>

            {/* Portal to body to escape CSS transforms */}
            {isVideoModalOpen && typeof document !== 'undefined' && createPortal(videoModalMarkup, document.body)}
        </div>
    );
};

export default DocumentationGallery;
