import React from 'react';
import '../../css/testimonial-sidebar.css';

const StarIcon = ({ filled = true, half = false }) => {
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

const TestimonialSidebarDisplay = ({ status }) => {
    // Only show testimonials for completed projects
    if (status !== 'selesai') return null;

    const testimonials = [
        {
            id: 1,
            name: "Bapak Budi",
            role: "Warga Setempat",
            rating: 4.5,
            text: "Program pendampingan ini sangat membantu UMKM di desa kami. Fasilitas dan ilmu dari dosen Poltekpar benar-benar membuka wawasan kami tentang manajemen usaha digital secara praktis.",
            date: "2 Bulan lalu"
        }
    ];

    const renderStars = (rating) => {
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
        </div>
    );
};

export default TestimonialSidebarDisplay;
