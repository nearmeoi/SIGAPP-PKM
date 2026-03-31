import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface User {
    id_user: number;
    name: string;
    email: string;
    role: 'admin' | 'dosen' | 'masyarakat';
    email_verified_at?: string;
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> extends InertiaPageProps {
    auth: {
        user: User;
    };
    flash: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    [key: string]: unknown;
}
