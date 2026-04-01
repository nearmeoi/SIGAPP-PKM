import L from 'leaflet';

export interface PkmTypeMeta {
    key: string;
    label: string;
    color: string;
}

export interface PkmStatusMeta {
    key: string;
    label: string;
    markerIcon: string;
}

export const PKM_TYPE_META: Record<string, PkmTypeMeta> = {
    pendampingan_desa: {
        key: 'pendampingan_desa',
        label: 'PKM Pendampingan Desa',
        color: '#15325F', // poltekpar-primary
    },
    bimbingan_teknis: {
        key: 'bimbingan_teknis',
        label: 'PKM Bimbingan Teknis',
        color: '#DCAF67', // poltekpar-gold
    },
    mahasiswa_prodi: {
        key: 'mahasiswa_prodi',
        label: 'PKM Mahasiswa / Prodi',
        color: '#0D1F3C', // poltekpar-navy
    },
};

export const PKM_STATUS_META: Record<string, PkmStatusMeta> = {
    selesai: {
        key: 'selesai',
        label: 'PKM Selesai',
        markerIcon: 'fa-check-double',
    },
    berlangsung: {
        key: 'berlangsung',
        label: 'PKM Berlangsung',
        markerIcon: 'fa-hourglass-half',
    },
    ada_pengajuan: {
        key: 'ada_pengajuan',
        label: 'Ada Pengajuan',
        markerIcon: 'fa-file-circle-plus',
    },
    belum_mulai: {
        key: 'belum_mulai',
        label: 'Belum Mulai',
        markerIcon: 'fa-clock',
    },
};

const normalizeTypeKey = (value: any): string => {
    const normalized = String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');

    if (normalized.includes('pendampingan') || normalized.includes('desa')) {
        return 'pendampingan_desa';
    }

    if (normalized.includes('bimbingan') || normalized.includes('teknis')) {
        return 'bimbingan_teknis';
    }

    if (normalized.includes('mahasiswa') || normalized.includes('prodi')) {
        return 'mahasiswa_prodi';
    }

    return 'mahasiswa_prodi';
};

export const getPkmTypeMeta = (pkm: any): PkmTypeMeta => {
    // If warna_icon is provided from DB, use it
    if (pkm?.warna_icon && typeof pkm.warna_icon === 'string' && pkm.warna_icon.startsWith('#')) {
        const rawType = pkm?.jenis_pkm ?? pkm?.jenisPkm ?? pkm?.jenis ?? pkm?.type ?? pkm?.category;
        const baseMeta = PKM_TYPE_META[normalizeTypeKey(rawType)] ?? PKM_TYPE_META.mahasiswa_prodi;
        return { ...baseMeta, color: pkm.warna_icon };
    }
    const rawType = pkm?.jenis_pkm ?? pkm?.jenisPkm ?? pkm?.jenis ?? pkm?.type ?? pkm?.category;
    return PKM_TYPE_META[normalizeTypeKey(rawType)] ?? PKM_TYPE_META.mahasiswa_prodi;
};

export const getPkmStatusMeta = (status: any): PkmStatusMeta => {
    const statusKey = String(status ?? 'berlangsung').toLowerCase();
    return PKM_STATUS_META[statusKey] ?? PKM_STATUS_META.berlangsung;
};

export const createPkmMarkerIcon = (pkm: any) => {
    const typeMeta = getPkmTypeMeta(pkm);
    const statusMeta = getPkmStatusMeta(pkm?.status);

    return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div class="pkm-map-marker-wrap" style="--pkm-marker-color: ${typeMeta.color}">
                <div class="pkm-map-marker">
                    <span class="pkm-map-marker__inner">
                        <i class="fa-solid ${statusMeta.markerIcon}"></i>
                    </span>
                </div>
                <div class="pkm-map-marker__pulse"></div>
            </div>
        `,
        iconSize: [30, 40],
        iconAnchor: [15, 34],
        popupAnchor: [0, -32],
    });
};

export const PKM_LEGEND_TYPES = Object.values(PKM_TYPE_META);
export const PKM_LEGEND_STATUSES = Object.values(PKM_STATUS_META);
