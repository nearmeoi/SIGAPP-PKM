import L from 'leaflet';

export const PKM_TYPE_META = {
    pendampingan_desa: {
        key: 'pendampingan_desa',
        label: 'PKM Pendampingan Desa',
        color: '#16a34a',
    },
    bimbingan_teknis: {
        key: 'bimbingan_teknis',
        label: 'PKM Bimbingan Teknis',
        color: '#f59e0b',
    },
    mahasiswa_prodi: {
        key: 'mahasiswa_prodi',
        label: 'PKM Mahasiswa / Prodi',
        color: '#dc2626',
    },
};

export const PKM_STATUS_META = {
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
};

const normalizeTypeKey = (value) => {
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

export const getPkmTypeMeta = (pkm) => {
    const rawType = pkm?.jenis_pkm ?? pkm?.jenisPkm ?? pkm?.jenis ?? pkm?.type ?? pkm?.category;
    return PKM_TYPE_META[normalizeTypeKey(rawType)] ?? PKM_TYPE_META.mahasiswa_prodi;
};

export const getPkmStatusMeta = (status) => {
    const statusKey = String(status ?? 'berlangsung').toLowerCase();
    return PKM_STATUS_META[statusKey] ?? PKM_STATUS_META.berlangsung;
};

export const createPkmMarkerIcon = (pkm) => {
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
