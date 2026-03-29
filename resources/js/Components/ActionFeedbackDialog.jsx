import React from 'react';
import '../../css/form-components.css';

export default function ActionFeedbackDialog({
    show,
    type = 'success',
    title,
    message,
    onClose,
    actionLabel = 'Tutup',
}) {
    if (!show) {
        return null;
    }

    const iconClass = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';

    return (
        <div className="fintech-feedback-overlay" role="dialog" aria-modal="true" aria-live="polite">
            <div className="fintech-feedback-backdrop" onClick={onClose}></div>
            <div className={`fintech-feedback-dialog ${type}`}>
                <div className={`fintech-feedback-icon ${type}`}>
                    <i className={iconClass}></i>
                </div>
                <div className="fintech-feedback-copy">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
                <button type="button" className="fintech-feedback-button" onClick={onClose}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}
