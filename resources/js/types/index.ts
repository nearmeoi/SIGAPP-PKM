export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    type?: string;
    avatar?: string;
    avatar_url?: string;
    profile_photo_url?: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Auth {
    user: User | null;
}

export interface PageProps {
    auth: Auth;
    [key: string]: unknown;
}

export interface PkmData {
    id: number;
    nama: string;
    tahun: number;
    status: 'berlangsung' | 'selesai';
    deskripsi: string;
    thumbnail?: string;
    laporan?: string;
    dokumentasi?: string;
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    desa: string;
    lat: string;
    lng: string;
    desa_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface NavItem {
    label: string;
    href: string;
    icon?: string;
}

export interface FeedbackDialogProps {
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
}
