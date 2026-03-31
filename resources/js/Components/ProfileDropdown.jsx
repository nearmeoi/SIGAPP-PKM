import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';

const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
};

const getRoleBadge = (user) => {
    if (!user) return null;

    const role = String(user.role || user.type || 'masyarakat').toLowerCase();
    const isDosen = role.includes('dosen');

    return {
        label: isDosen ? 'Akun Dosen' : 'Akun Masyarakat',
        className: isDosen ? 'profile-dropdown-panel__badge--dosen' : 'profile-dropdown-panel__badge--masyarakat',
    };
};

function useClickOutside(targetRef, enabled, onClose) {
    useEffect(() => {
        if (!enabled) return undefined;

        const handlePointerDown = (event) => {
            if (targetRef.current && !targetRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [enabled, onClose, targetRef]);
}

export default function ProfileDropdown({ auth }) {
    const user = auth?.user ?? null;
    const [isOpen, setIsOpen] = useState(false);
    const shellRef = useRef(null);

    const badge = useMemo(() => getRoleBadge(user), [user]);
    const avatarSrc = user?.avatar || user?.avatar_url || user?.profile_photo_url || null;
    const logoutHref = typeof route === 'function' ? route('logout') : '/logout';

    const closeDropdown = useCallback(() => {
        setIsOpen(false);
    }, []);

    const toggleDropdown = useCallback(() => {
        setIsOpen((previous) => !previous);
    }, []);

    useClickOutside(shellRef, isOpen, closeDropdown);

    if (!user) {
        return (
            <Link href="/login" className="profile-dropdown-login">
                <i className="fa-solid fa-right-to-bracket"></i>
                <span>Login</span>
            </Link>
        );
    }

    return (
        <div className="profile-dropdown-shell" ref={shellRef}>
            <button
                type="button"
                className={`profile-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
                onClick={toggleDropdown}
                aria-label="Buka menu profil"
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                <span className="profile-dropdown-trigger__ring"></span>
                {avatarSrc ? (
                    <img src={avatarSrc} alt={user.name || 'Profil pengguna'} className="profile-dropdown-trigger__image" />
                ) : (
                    <span className="profile-dropdown-trigger__initials">{getInitials(user.name)}</span>
                )}
            </button>

            {isOpen && (
                <div className="profile-dropdown-panel" role="menu" aria-label="Menu profil pengguna">
                    <div className="profile-dropdown-panel__header">
                        <p className="profile-dropdown-panel__name">{user.name || 'Pengguna'}</p>
                        {badge && (
                            <span className={`profile-dropdown-panel__badge ${badge.className}`}>
                                {badge.label}
                            </span>
                        )}
                    </div>

                    <div className="profile-dropdown-panel__menu">
                        <Link href="/profile/edit" className="profile-dropdown-panel__item" role="menuitem" onClick={closeDropdown}>
                            <i className="fa-solid fa-user-pen"></i>
                            <span>Edit Profil</span>
                        </Link>
                        <Link href="/settings" className="profile-dropdown-panel__item" role="menuitem" onClick={closeDropdown}>
                            <i className="fa-solid fa-gear"></i>
                            <span>Pengaturan</span>
                        </Link>
                    </div>

                    <div className="profile-dropdown-panel__footer">
                        <Link
                            href={logoutHref}
                            method="post"
                            as="button"
                            className="profile-dropdown-panel__logout"
                            role="menuitem"
                        >
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>Log Out</span>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
