import React, { useState } from 'react';
import '../../css/testimonial-sidebar.css';
import TestimonialForm from './TestimonialForm';

interface StarIconProps {
    filled?: boolean;
    half?: boolean;
}

const StarIcon: React.FC<StarIconProps> = ({ filled = true, half = false }) => {
    if (half) {
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="star-icon">
                <defs>
                    <linearGradient id="half-star-gradient">
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#e2e8f0" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#half-star-gradient)" />
            </svg>
        );
    }

    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="star-icon">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={filled ? "#f59e0b" : "#e2e8f0"} />
        </svg>
    );
};

interface Testimonial {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
    date: string;
}

interface TestimonialSidebarDisplayProps {
    status: string;
}

const TestimonialSidebarDisplay: React.FC<TestimonialSidebarDisplayProps> = ({ status }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Only show testimonials for completed projects
    if (status !== 'selesai') return null;

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "Bapak Budi",
            role: "Warga Setempat",
            rating: 4.5,
            text: "Program pendampingan ini sangat membantu UMKM di desa kami. Fasilitas dan ilmu dari dosen Poltekpar benar-benar membuka wawasan kami tentang manajemen usaha digital secara praktis.",
            date: "2 Bulan lalu"
        }
    ];

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<StarIcon key={i} filled={true} />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<StarIcon key={i} half={true} />);
            } else {
                stars.push(<StarIcon key={i} filled={false} />);
            }
        }
        return stars;
    };

    return (
        <div className="testimonial-sidebar-container">
            <div className="doc-section-main-title">
                <i className="fa-solid fa-comments" style={{ color: '#046bd2' }}></i> Ulasan & Testimoni Masyarakat
            </div>

            <div className="testimonial-list">
                {testimonials.map(item => (
                    <div key={item.id} className="testimonial-card">
                        <div className="testimonial-card-header">
                            <div className="testimonial-avatar">
                                {item.name.charAt(0)}
                            </div>
                            <div className="testimonial-meta">
                                <span className="testimonial-name">{item.name}</span>
                                <span className="testimonial-role">{item.role}</span>
                            </div>
                            <div className="testimonial-rating-box">
                                <span className="rating-number">{item.rating}</span>
                            </div>
                        </div>

                        <div className="testimonial-stars-row">
                            {renderStars(item.rating)}
                            <span className="testimonial-date">{item.date}</span>
                        </div>

                        <p className="testimonial-text">
                            "{item.text}"
                        </p>
                    </div>
                ))}
            </div>

            {/* CTA: Invite to Write Testimonial */}
            <div style={{
                marginTop: '16px',
                padding: '16px 20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #bae6fd',
                textAlign: 'center'
            }}>
                <p style={{
                    fontSize: '13px',
                    color: '#0369a1',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                    fontWeight: '500'
                }}>
                    <i className="fa-solid fa-bullhorn" style={{ marginRight: '6px' }}></i>
                    Pernah terlibat dalam kegiatan ini? Bagikan pengalaman Anda!
                </p>
                <button
                    onClick={() => setIsFormOpen(true)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(3,105,161,0.25)'
                    }}
                    onMouseEnter={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = 'translateY(-1px)';
                        target.style.boxShadow = '0 4px 14px rgba(3,105,161,0.35)';
                    }}
                    onMouseLeave={(e) => {
                        const target = e.currentTarget;
                        target.style.transform = 'translateY(0)';
                        target.style.boxShadow = '0 2px 8px rgba(3,105,161,0.25)';
                    }}
                >
                    <i className="fa-solid fa-pen-to-square" style={{ fontSize: '14px' }}></i>
                    Tulis Testimoni
                </button>
            </div>

            {isFormOpen && (
                <TestimonialForm onClose={() => setIsFormOpen(false)} />
            )}
        </div>
    );
};

export default TestimonialSidebarDisplay;
