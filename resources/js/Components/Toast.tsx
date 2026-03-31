import React, { useEffect } from 'react';
import '../../css/form-components.css'; // Ensure the CSS is imported

interface ToastProps {
    show: boolean;
    type?: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ show, type = 'success', title, message, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    // Don't unmount immediately to allow slide-out animation, but we'll conditionally render class
    // actually, simpler to render with a `show` class

    const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';

    return (
        <div className={`fintech-toast ${type} ${show ? 'show' : ''}`}>
            <div className={`toast-icon ${type}`}>
                <i className={iconClass}></i>
            </div>
            <div className="toast-content">
                <h4 className="toast-title">{title}</h4>
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close" onClick={onClose} aria-label="Tutup">
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
}
