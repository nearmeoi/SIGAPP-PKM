import React, { useRef, useEffect, useState } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [dragging, setDragging] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
        setDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragging) return;
        const diff = e.touches[0].clientY - startY;
        if (diff > 0) {
            setCurrentY(diff);
            if (sheetRef.current) {
                sheetRef.current.style.transform = `translateY(${diff}px)`;
            }
        }
    };

    const handleTouchEnd = () => {
        setDragging(false);
        if (currentY > 120) {
            onClose?.();
        }
        setCurrentY(0);
        if (sheetRef.current) {
            sheetRef.current.style.transform = '';
        }
    };

    useEffect(() => {
        if (!isOpen && sheetRef.current) {
            sheetRef.current.style.transform = '';
        }
    }, [isOpen]);

    return (
        <>
            <div
                className={`bottom-sheet-backdrop ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />
            <div
                ref={sheetRef}
                className={`bottom-sheet ${isOpen ? 'open' : ''}`}
            >
                <div
                    className="bottom-sheet-handle-area"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="bottom-sheet-handle" />
                </div>
                {title && (
                    <div className="bottom-sheet-header">
                        <h3>{title}</h3>
                        <button className="bottom-sheet-close" onClick={onClose}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                )}
                <div className="bottom-sheet-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default BottomSheet;
