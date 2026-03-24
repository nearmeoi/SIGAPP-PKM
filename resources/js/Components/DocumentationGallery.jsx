import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import '../../css/documentation-gallery.css';

const DocumentationGallery = ({ status, images = [] }) => {
    // Image Modal State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Video Modal State
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Only render the gallery if the project is marked as "selesai"
    if (status !== 'selesai') {
        return null;
    }

    // Use placeholder images if no real images are provided
    const galleryImages = images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ];

    // Professional YouTube generic embed (Nature)
    const videoEmbedUrl = 'https://www.youtube.com/embed/S70B9v1g_1s?rel=0';

    const openImageModal = (index = 0) => {
        setCurrentIndex(index);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => setIsImageModalOpen(false);

    const openVideoModal = () => setIsVideoModalOpen(true);
    const closeVideoModal = () => setIsVideoModalOpen(false);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    const imageModalMarkup = isImageModalOpen ? (
        <div className="gallery-modal-overlay window-mode" onClick={closeImageModal} style={{ zIndex: 9999999 }}>
            <div className="gallery-modal-window" onClick={(e) => e.stopPropagation()}>
                <div className="gallery-modal-header">
                    <h3>Foto Kegiatan</h3>
                    <button className="gallery-modal-close-window" onClick={closeImageModal} title="Tutup">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="gallery-modal-body">
                    <button className="gallery-modal-nav prev-inside" onClick={prevImage} title="Sebelumnya">
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>

                    <div className="gallery-modal-img-container">
                        <img src={galleryImages[currentIndex]} alt={`Dokumentasi Layar Penuh ${currentIndex + 1}`} />
                    </div>

                    <button className="gallery-modal-nav next-inside" onClick={nextImage} title="Selanjutnya">
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>

                <div className="gallery-modal-footer">
                    <span className="gallery-modal-counter-window">
                        Foto {currentIndex + 1} dari {galleryImages.length}
                    </span>
                </div>
            </div>
        </div>
    ) : null;

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

            {/* --- SECTION: FOTO --- */}
            <div className="doc-sub-section">
                <div className="gallery-header">
                    <h4 className="gallery-title">Foto Kegiatan</h4>
                    <button className="gallery-see-more" onClick={() => openImageModal(0)}>Selengkapnya <i className="fa-solid fa-expand"></i></button>
                </div>

                <div className="gallery-grid-wrapper">
                    {galleryImages.slice(0, 4).map((src, index) => (
                        <div key={index} className="gallery-thumbnail" onClick={() => openImageModal(index)}>
                            <img src={src} alt={`Dokumentasi ${index + 1}`} loading="lazy" />
                            {index === 3 && galleryImages.length > 4 && (
                                <div className="gallery-more-overlay">+{galleryImages.length - 4}</div>
                            )}
                        </div>
                    ))}
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

            {/* Portals to body to escape CSS transforms */}
            {isImageModalOpen && typeof document !== 'undefined' && createPortal(imageModalMarkup, document.body)}
            {isVideoModalOpen && typeof document !== 'undefined' && createPortal(videoModalMarkup, document.body)}
        </div>
    );
};

export default DocumentationGallery;
