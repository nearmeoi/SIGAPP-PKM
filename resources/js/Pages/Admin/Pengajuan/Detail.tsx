import React, { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { AlertCircle, ArrowLeft, CheckCircle, ExternalLink, File, Folder, MapPin, Plus, RotateCcw, Save, SquarePen, Trash2, User, Users, Wallet, X } from 'lucide-react';

interface Pegawai { id_pegawai: number; nama_pegawai: string; nip?: string; }
interface TimKegiatan { id_tim: number; nama_mahasiswa?: string; peran_tim?: string; pegawai?: { nama_pegawai: string }; }
interface Aktivitas { id_aktivitas: number; status_pelaksanaan: string; catatan_pelaksanaan?: string; }
interface Arsip { id_arsip: number; nama_dokumen: string; jenis_arsip: string; url_dokumen?: string; }
interface RabItem { nama_item?: string; jumlah?: number; harga?: number; total?: number; }
interface Pengajuan {
    id_pengajuan: number;
    judul_kegiatan: string;
    nama_pengusul?: string;
    email_pengusul?: string;
    tipe_pengusul?: string;
    kebutuhan?: string;
    instansi_mitra?: string;
    no_telepon?: string;
    sumber_dana?: string;
    total_anggaran: number;
    dana_perguruan_tinggi?: number;
    dana_pemerintah?: number;
    dana_lembaga_dalam?: number;
    dana_lembaga_luar?: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    status_pengajuan: string;
    catatan_admin?: string;
    created_at?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    rab_items?: RabItem[];
    user?: { name: string; email: string; role?: string };
    jenis_pkm?: { id_jenis_pkm: number; nama_jenis: string };
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    kelurahan_desa?: string;
    alamat_lengkap?: string;
    latitude?: number;
    longitude?: number;
    tim_kegiatan?: TimKegiatan[];
    aktivitas?: Aktivitas;
    arsip?: Arsip[];
}
interface Props {
    pengajuan: Pengajuan;
    listPegawai: Pegawai[];
    listJenisPkm: { id_jenis_pkm: number; nama_jenis: string }[];
}

interface DraftState {
    nama_pengusul: string;
    email_pengusul: string;
    instansi_mitra: string;
    no_telepon: string;
    judul_kegiatan: string;
    kebutuhan: string;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    kelurahan_desa: string;
    alamat_lengkap: string;
    total_anggaran: string;
    sumber_dana: string;
    dana_perguruan_tinggi: string;
    dana_pemerintah: string;
    dana_lembaga_dalam: string;
    dana_lembaga_luar: string;
    surat_permohonan: string;
    proposal: string;
    rab: string;
    dosen_terlibat: string[];
    staff_terlibat: string[];
    mahasiswa_terlibat: string[];
    rab_items: RabItem[];
}

interface DialogState {
    open: boolean;
    title: string;
    message: string;
    action: () => void;
    variant: 'danger' | 'warning' | 'info';
    confirmLabel: string;
    cancelLabel: string;
}

const statusConfig: Record<string, { label: string; text: string; bg: string; dot: string }> = {
    diproses: { label: 'Diproses', text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    diterima: { label: 'Diterima', text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-400' },
    direvisi: { label: 'Revisi', text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-400' },
    ditolak: { label: 'Ditolak', text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' },
    selesai: { label: 'Selesai', text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-400' },
};

const fmtDate = (v?: string) => v ? new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const fmtMoney = (v?: number | null) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;
const getType = (p: Pengajuan): 'dosen' | 'masyarakat' => String(p.tipe_pengusul || p.user?.role || '').toLowerCase() === 'dosen' ? 'dosen' : 'masyarakat';
const getKetua = (tim?: TimKegiatan[]) => tim?.find((m) => String(m.peran_tim || '').toLowerCase().includes('ketua'));
const getName = (m?: TimKegiatan) => m?.pegawai?.nama_pegawai || m?.nama_mahasiswa || '';
const getSubmitterName = (p: Pengajuan) => p.nama_pengusul || getName(getKetua(p.tim_kegiatan)) || p.user?.name || '-';
const getSubmitterEmail = (p: Pengajuan) => p.email_pengusul || p.user?.email || '-';
const linksOf = (v?: string) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const normalizeRabItems = (items?: RabItem[]) => (items || [])
    .map((item) => {
        const jumlah = Number(item.jumlah || 0);
        const harga = Number(item.harga || 0);

        return {
            nama_item: String(item.nama_item || ''),
            jumlah,
            harga,
            total: jumlah * harga,
        };
    })
    .filter((item) => item.nama_item.trim() !== '' || item.jumlah > 0 || item.harga > 0);
const emptyRabItem = (): RabItem => ({ nama_item: '', jumlah: 1, harga: 0, total: 0 });
const roleItems = (tim: TimKegiatan[] | undefined, role: string, ketuaId?: number) => (tim || [])
    .filter((m) => m.id_tim !== ketuaId && String(m.peran_tim || '').toLowerCase() === role)
    .map(getName)
    .filter(Boolean);
const buildDraft = (pengajuan: Pengajuan, ketuaId?: number): DraftState => ({
    nama_pengusul: pengajuan.nama_pengusul || getSubmitterName(pengajuan),
    email_pengusul: pengajuan.email_pengusul || getSubmitterEmail(pengajuan),
    instansi_mitra: pengajuan.instansi_mitra || '',
    no_telepon: pengajuan.no_telepon || '',
    judul_kegiatan: pengajuan.judul_kegiatan || '',
    kebutuhan: pengajuan.kebutuhan || '',
    provinsi: pengajuan.provinsi || '',
    kota_kabupaten: pengajuan.kota_kabupaten || '',
    kecamatan: pengajuan.kecamatan || '',
    kelurahan_desa: pengajuan.kelurahan_desa || '',
    alamat_lengkap: pengajuan.alamat_lengkap || '',
    total_anggaran: String(pengajuan.total_anggaran || 0),
    sumber_dana: pengajuan.sumber_dana || '',
    dana_perguruan_tinggi: String(pengajuan.dana_perguruan_tinggi || 0),
    dana_pemerintah: String(pengajuan.dana_pemerintah || 0),
    dana_lembaga_dalam: String(pengajuan.dana_lembaga_dalam || 0),
    dana_lembaga_luar: String(pengajuan.dana_lembaga_luar || 0),
    surat_permohonan: pengajuan.surat_permohonan || '',
    proposal: pengajuan.proposal || '',
    rab: pengajuan.rab || '',
    dosen_terlibat: roleItems(pengajuan.tim_kegiatan, 'dosen', ketuaId).length ? roleItems(pengajuan.tim_kegiatan, 'dosen', ketuaId) : [''],
    staff_terlibat: roleItems(pengajuan.tim_kegiatan, 'staff', ketuaId).length ? roleItems(pengajuan.tim_kegiatan, 'staff', ketuaId) : [''],
    mahasiswa_terlibat: roleItems(pengajuan.tim_kegiatan, 'mahasiswa', ketuaId).length ? roleItems(pengajuan.tim_kegiatan, 'mahasiswa', ketuaId) : [''],
    rab_items: normalizeRabItems(pengajuan.rab_items).length ? normalizeRabItems(pengajuan.rab_items) : [emptyRabItem()],
});

const Card = ({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) => (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            <div className="flex items-center gap-2">
                {action}
                {icon}
            </div>
        </div>
        <div className="p-6">{children}</div>
    </section>
);
const Field = ({ label, value, wide = false }: { label: string; value?: React.ReactNode; wide?: boolean }) => (
    <div className={`${wide ? 'md:col-span-2' : ''} space-y-1.5`}>
        <div className="text-xs font-semibold text-slate-700">{label}</div>
        <div className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">{value || '-'}</div>
    </div>
);
const Doc = ({ label, url }: { label: string; url?: string | null }) => (
    <div className="space-y-1.5">
        <div className="text-xs font-semibold text-slate-700">{label}</div>
        {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-indigo-600">
                <span>Buka Dokumen</span><ExternalLink size={14} />
            </a>
        ) : (
            <div className="min-h-[44px] rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">Belum ada dokumen.</div>
        )}
    </div>
);
const Team = ({ title, items }: { title: string; items: string[] }) => (
    <div className="space-y-1.5">
        <div className="text-[13px] font-bold text-slate-600">{title}</div>
        {items.length ? <div className="space-y-2">{items.map((x, i) => <div key={`${title}-${i}-${x}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800">{x}</div>)}</div>
            : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">Tidak ada data.</div>}
    </div>
);

const EditableTeam = ({
    title,
    items,
    placeholder,
    onChange,
    onAdd,
    onRemove,
}: {
    title: string;
    items: string[];
    placeholder: string;
    onChange: (index: number, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
}) => (
    <div className="space-y-3">
        <div className="text-[13px] font-bold text-slate-600">{title}</div>
        {(items.length ? items : ['']).map((item, index) => (
            <div key={`${title}-${index}`} className="flex items-center gap-2">
                <input
                    type="text"
                    value={item}
                    onChange={(e) => onChange(index, e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[44px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-poltekpar-primary"
                />
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        ))}
        <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
            <Plus size={14} />
            Tambah
        </button>
    </div>
);

const RabTable = ({ items }: { items: RabItem[] }) => (
    items.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Nama Item</th>
                        <th className="px-4 py-3">Jumlah</th>
                        <th className="px-4 py-3">Harga</th>
                        <th className="px-4 py-3">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item, index) => (
                        <tr key={`${item.nama_item}-${index}`}>
                            <td className="px-4 py-3 text-slate-800">{item.nama_item || '-'}</td>
                            <td className="px-4 py-3 text-slate-700">{Number(item.jumlah || 0)}</td>
                            <td className="px-4 py-3 text-slate-700">{fmtMoney(item.harga)}</td>
                            <td className="px-4 py-3 font-semibold text-poltekpar-primary">{fmtMoney(item.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">Belum ada rincian item RAB yang tersimpan.</div>
    )
);

const EditableRabTable = ({
    items,
    onChange,
    onAdd,
    onRemove,
}: {
    items: RabItem[];
    onChange: (index: number, field: keyof RabItem, value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
}) => (
    <div className="space-y-3">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Nama Item</th>
                        <th className="px-4 py-3">Jumlah</th>
                        <th className="px-4 py-3">Harga</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item, index) => {
                        const total = Number(item.jumlah || 0) * Number(item.harga || 0);

                        return (
                            <tr key={`rab-${index}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="text"
                                        value={String(item.nama_item || '')}
                                        onChange={(e) => onChange(index, 'nama_item', e.target.value)}
                                        placeholder="Nama item..."
                                        className="min-h-[40px] w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-poltekpar-primary"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={Number(item.jumlah || 0)}
                                        onChange={(e) => onChange(index, 'jumlah', e.target.value)}
                                        className="min-h-[40px] w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-poltekpar-primary"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="number"
                                        min="0"
                                        value={Number(item.harga || 0)}
                                        onChange={(e) => onChange(index, 'harga', e.target.value)}
                                        className="min-h-[40px] w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-poltekpar-primary"
                                    />
                                </td>
                                <td className="px-4 py-3 font-semibold text-poltekpar-primary">{fmtMoney(total)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(index)}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
            <Plus size={14} />
            Tambah Item
        </button>
    </div>
);

const EditField = ({
    label,
    value,
    onChange,
    wide = false,
    type = 'text',
    textarea = false,
}: {
    label: string;
    value?: string | number | null;
    onChange: (value: string) => void;
    wide?: boolean;
    type?: string;
    textarea?: boolean;
}) => (
    <div className={`${wide ? 'md:col-span-2' : ''} space-y-1.5`}>
        <div className="text-xs font-semibold text-slate-700">{label}</div>
        {textarea ? (
            <textarea
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-poltekpar-primary"
            />
        ) : (
            <input
                type={type}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-poltekpar-primary"
            />
        )}
    </div>
);

export default function Detail({ pengajuan }: Props) {
    const [catatan, setCatatan] = useState(pengajuan.catatan_admin || '');
    const [selectedAction, setSelectedAction] = useState('');
    const [catatanError, setCatatanError] = useState('');
    const ketua = useMemo(() => getKetua(pengajuan.tim_kegiatan), [pengajuan.tim_kegiatan]);
    const [confirmDialog, setConfirmDialog] = useState<DialogState>({ open: false, title: '', message: '', action: () => undefined, variant: 'warning', confirmLabel: 'Ya, Lanjutkan', cancelLabel: 'Batal' });
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [draft, setDraft] = useState<DraftState>(() => buildDraft(pengajuan, ketua?.id_tim));
    const st = statusConfig[pengajuan.status_pengajuan] || statusConfig.diproses;
    const isDosen = getType(pengajuan) === 'dosen';
    const submitterName = getSubmitterName(pengajuan);
    const submitterEmail = getSubmitterEmail(pengajuan);
    const extraLinks = linksOf(pengajuan.rab);
    const roleNames = (role: string) => roleItems(pengajuan.tim_kegiatan, role, ketua?.id_tim);
    const rabItems = useMemo(() => normalizeRabItems(pengajuan.rab_items), [pengajuan.rab_items]);
    const draftRabItems = useMemo(() => normalizeRabItems(draft.rab_items), [draft.rab_items]);
    const draftTotalRab = useMemo(() => draftRabItems.reduce((sum, item) => sum + Number(item.total || 0), 0), [draftRabItems]);
    const missing = [
        !submitterName || submitterName === '-' ? 'Nama Pengusul' : '',
        !submitterEmail || submitterEmail === '-' ? 'Email Pengusul' : '',
        !pengajuan.instansi_mitra ? 'Instansi' : '',
        !pengajuan.no_telepon ? 'No. WhatsApp' : '',
        !pengajuan.kebutuhan ? (isDosen ? 'Deskripsi Kegiatan' : 'Kebutuhan PKM') : '',
        !pengajuan.provinsi ? 'Provinsi' : '',
        !pengajuan.kota_kabupaten ? 'Kota / Kabupaten' : '',
        !pengajuan.surat_permohonan ? 'Surat Permohonan' : '',
        isDosen && !pengajuan.judul_kegiatan ? 'Judul Kegiatan PKM' : '',
        isDosen && rabItems.length === 0 ? 'Rincian RAB' : '',
        isDosen && !pengajuan.sumber_dana && !pengajuan.dana_perguruan_tinggi && !pengajuan.dana_pemerintah && !pengajuan.dana_lembaga_dalam && !pengajuan.dana_lembaga_luar ? 'Sumber Dana' : '',
    ].filter(Boolean);

    const saveDecision = () => {
        if (!selectedAction) return;
        if (missing.length > 0) {
            setConfirmDialog({
                open: true,
                title: 'Verifikasi Belum Bisa Dilanjutkan',
                message: `Pengajuan ini masih belum lengkap pada bagian: ${missing.join(', ')}. Lengkapi dulu data tersebut atau hubungi pengaju sebelum memproses status.`,
                action: () => undefined,
                variant: 'warning',
                confirmLabel: 'Mengerti',
                cancelLabel: 'Tutup',
            });
            return;
        }
        if (selectedAction === 'direvisi' && !catatan.trim()) {
            setCatatanError('Catatan revisi wajib diisi.');
            return;
        }
        setCatatanError('');
        setConfirmDialog({
            open: true,
            title: 'Simpan Keputusan?',
            message: `Status akan diubah menjadi "${selectedAction}".`,
            action: () => router.put(`/admin/pengajuan/${pengajuan.id_pengajuan}/status`, {
                status_pengajuan: selectedAction,
                catatan_admin: selectedAction === 'direvisi' ? catatan : null,
            }),
            variant: 'warning',
            confirmLabel: 'Ya, Simpan',
            cancelLabel: 'Batal',
        });
    };

    const setDraftField = (field: keyof typeof draft, value: string) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    const setTeamFieldValue = (field: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', index: number, value: string) => {
        setDraft((prev) => {
            const items = [...prev[field]];
            items[index] = value;

            return { ...prev, [field]: items };
        });
    };

    const addTeamField = (field: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat') => {
        setDraft((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeTeamField = (field: 'dosen_terlibat' | 'staff_terlibat' | 'mahasiswa_terlibat', index: number) => {
        setDraft((prev) => {
            const items = prev[field].filter((_, currentIndex) => currentIndex !== index);

            return { ...prev, [field]: items.length ? items : [''] };
        });
    };

    const setRabItemField = (index: number, field: keyof RabItem, value: string) => {
        setDraft((prev) => {
            const items = [...prev.rab_items];
            const current = { ...items[index] };

            if (field === 'nama_item') {
                current.nama_item = value;
            } else {
                current[field] = Number(value || 0);
            }

            current.total = Number(current.jumlah || 0) * Number(current.harga || 0);
            items[index] = current;

            return { ...prev, rab_items: items };
        });
    };

    const addRabItem = () => {
        setDraft((prev) => ({ ...prev, rab_items: [...prev.rab_items, emptyRabItem()] }));
    };

    const removeRabItem = (index: number) => {
        setDraft((prev) => {
            const items = prev.rab_items.filter((_, currentIndex) => currentIndex !== index);

            return { ...prev, rab_items: items.length ? items : [emptyRabItem()] };
        });
    };

    const startEdit = (section: string) => setEditingSection(section);
    const cancelEdit = () => {
        setDraft(buildDraft(pengajuan, ketua?.id_tim));
        setEditingSection(null);
    };

    const saveSection = (section: string, payload: Record<string, unknown>, url?: string) => {
        router.put(url || `/admin/pengajuan/${pengajuan.id_pengajuan}`, payload, {
            preserveScroll: true,
            onSuccess: () => setEditingSection((current) => (current === section ? null : current)),
        });
    };

    const sectionActions = (section: string, payload: Record<string, unknown>, url?: string) =>
        editingSection === section ? (
            <>
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                >
                    Batal
                </button>
                <button
                    type="button"
                    onClick={() => saveSection(section, payload, url)}
                    className="inline-flex items-center gap-1 rounded-lg bg-poltekpar-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-poltekpar-navy"
                >
                    <Save size={12} />
                    Simpan
                </button>
            </>
        ) : (
            <button
                type="button"
                onClick={() => startEdit(section)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
                <SquarePen size={12} />
                Edit
            </button>
        );

    return (
        <AdminLayout title="">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/pengajuan" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-colors hover:bg-zinc-50 hover:text-zinc-900"><ArrowLeft size={16} /></Link>
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold text-slate-900">{pengajuan.judul_kegiatan || 'Detail Pengajuan'}</h1>
                    <p className="mt-1 text-[13px] text-slate-500">Format tampilan mengikuti form {isDosen ? 'pengajuan dosen' : 'pengajuan masyarakat'} dan hanya menampilkan data yang sudah diisi.</p>
                    <p className="mt-1 text-[13px] text-slate-500">Diajukan oleh <span className="font-medium text-slate-700">{submitterName}</span>{pengajuan.created_at && ` pada ${fmtDate(pengajuan.created_at)}`}<span className="mx-2 text-slate-300">•</span><span className="font-mono">#{pengajuan.id_pengajuan.toString().padStart(2, '0')}</span></p>
                </div>
                <div className={`flex flex-shrink-0 items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-[13px] font-semibold uppercase tracking-wider shadow-sm ${st.bg} ${st.text}`}><span className={`h-2 w-2 rounded-full ${st.dot}`}></span>{st.label}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {missing.length > 0 && <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" /><div><div className="text-[13px] font-bold text-amber-800">Data Belum Lengkap</div><p className="mt-0.5 text-[12px] text-amber-700">Field berikut masih kosong: <span className="font-semibold">{missing.join(', ')}</span></p></div></div>}

                    {isDosen ? (
                        <>
                            <Card
                                title="Informasi Ketua Pengusul"
                                action={sectionActions('submitter', {
                                    nama_pengusul: draft.nama_pengusul,
                                    email_pengusul: draft.email_pengusul,
                                    instansi_mitra: draft.instansi_mitra,
                                    no_telepon: draft.no_telepon,
                                })}
                                icon={<User size={16} className="text-slate-400" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {editingSection === 'submitter' ? (
                                        <>
                                            <EditField label="Nama Lengkap" value={draft.nama_pengusul} onChange={(v) => setDraftField('nama_pengusul', v)} />
                                            <EditField label="Instansi" value={draft.instansi_mitra} onChange={(v) => setDraftField('instansi_mitra', v)} />
                                            <EditField label="Email" value={draft.email_pengusul} type="email" onChange={(v) => setDraftField('email_pengusul', v)} />
                                            <EditField label="No. WhatsApp" value={draft.no_telepon} onChange={(v) => setDraftField('no_telepon', v)} />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Nama Lengkap" value={submitterName} />
                                            <Field label="Instansi" value={pengajuan.instansi_mitra || 'Politeknik Pariwisata Makassar'} />
                                            <Field label="Email" value={submitterEmail} />
                                            <Field label="No. WhatsApp" value={pengajuan.no_telepon} />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Detail Kegiatan"
                                action={sectionActions('detail', {
                                    judul_kegiatan: draft.judul_kegiatan,
                                    kebutuhan: draft.kebutuhan,
                                })}
                                icon={<File size={16} className="text-slate-400" />}
                            >
                                <div className="space-y-4">
                                    {editingSection === 'detail' ? (
                                        <>
                                            <EditField label="Judul Kegiatan PKM" value={draft.judul_kegiatan} onChange={(v) => setDraftField('judul_kegiatan', v)} wide textarea />
                                            <EditField label="Kebutuhan / Deskripsi Singkat" value={draft.kebutuhan} onChange={(v) => setDraftField('kebutuhan', v)} wide textarea />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Judul Kegiatan PKM" value={pengajuan.judul_kegiatan} wide />
                                            <Field label="Kebutuhan / Deskripsi Singkat" value={pengajuan.kebutuhan} wide />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Lokasi Kegiatan"
                                action={sectionActions('location', {
                                    provinsi: draft.provinsi,
                                    kota_kabupaten: draft.kota_kabupaten,
                                    kecamatan: draft.kecamatan,
                                    kelurahan_desa: draft.kelurahan_desa,
                                    alamat_lengkap: draft.alamat_lengkap,
                                })}
                                icon={<MapPin size={16} className="text-slate-400" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {editingSection === 'location' ? (
                                        <>
                                            <EditField label="Provinsi" value={draft.provinsi} onChange={(v) => setDraftField('provinsi', v)} />
                                            <EditField label="Kota/Kabupaten" value={draft.kota_kabupaten} onChange={(v) => setDraftField('kota_kabupaten', v)} />
                                            <EditField label="Kecamatan" value={draft.kecamatan} onChange={(v) => setDraftField('kecamatan', v)} />
                                            <EditField label="Kelurahan/Desa" value={draft.kelurahan_desa} onChange={(v) => setDraftField('kelurahan_desa', v)} />
                                            <EditField label="Alamat Lengkap" value={draft.alamat_lengkap} onChange={(v) => setDraftField('alamat_lengkap', v)} wide textarea />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Provinsi" value={pengajuan.provinsi} />
                                            <Field label="Kota/Kabupaten" value={pengajuan.kota_kabupaten} />
                                            <Field label="Kecamatan" value={pengajuan.kecamatan} />
                                            <Field label="Kelurahan/Desa" value={pengajuan.kelurahan_desa} />
                                            <Field label="Alamat Lengkap" value={pengajuan.alamat_lengkap} wide />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Tim Pelaksana"
                                action={sectionActions('team', {
                                    dosen_terlibat: draft.dosen_terlibat.map((item) => item.trim()).filter(Boolean),
                                    staff_terlibat: draft.staff_terlibat.map((item) => item.trim()).filter(Boolean),
                                    mahasiswa_terlibat: draft.mahasiswa_terlibat.map((item) => item.trim()).filter(Boolean),
                                }, `/admin/pengajuan/${pengajuan.id_pengajuan}/tim`)}
                                icon={<Users size={16} className="text-slate-400" />}
                            >
                                {editingSection === 'team' ? (
                                    <div className="space-y-5">
                                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                            Ketua pengusul mengikuti data pada bagian <span className="font-semibold">Informasi Ketua Pengusul</span>. Admin dapat melengkapi anggota tim lainnya dari sini.
                                        </div>
                                        <EditableTeam
                                            title="Dosen Terlibat"
                                            items={draft.dosen_terlibat}
                                            placeholder="Nama dosen..."
                                            onChange={(index, value) => setTeamFieldValue('dosen_terlibat', index, value)}
                                            onAdd={() => addTeamField('dosen_terlibat')}
                                            onRemove={(index) => removeTeamField('dosen_terlibat', index)}
                                        />
                                        <EditableTeam
                                            title="Staf Terlibat"
                                            items={draft.staff_terlibat}
                                            placeholder="Nama staf..."
                                            onChange={(index, value) => setTeamFieldValue('staff_terlibat', index, value)}
                                            onAdd={() => addTeamField('staff_terlibat')}
                                            onRemove={(index) => removeTeamField('staff_terlibat', index)}
                                        />
                                        <EditableTeam
                                            title="Mahasiswa Terlibat"
                                            items={draft.mahasiswa_terlibat}
                                            placeholder="Nama mahasiswa..."
                                            onChange={(index, value) => setTeamFieldValue('mahasiswa_terlibat', index, value)}
                                            onAdd={() => addTeamField('mahasiswa_terlibat')}
                                            onRemove={(index) => removeTeamField('mahasiswa_terlibat', index)}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Team title="Ketua Pengusul" items={submitterName && submitterName !== '-' ? [submitterName] : []} />
                                        <Team title="Dosen Terlibat" items={roleNames('dosen')} />
                                        <Team title="Staf Terlibat" items={roleNames('staff')} />
                                        <Team title="Mahasiswa Terlibat" items={roleNames('mahasiswa')} />
                                    </div>
                                )}
                            </Card>
                            <Card
                                title="Rencana Anggaran Biaya (RAB)"
                                action={sectionActions('budget', {
                                    rab_items: draftRabItems,
                                    total_anggaran: draftTotalRab,
                                })}
                                icon={<Wallet size={16} className="text-slate-400" />}
                            >
                                <div className="space-y-4">
                                    {editingSection === 'budget' ? (
                                        <EditableRabTable
                                            items={draft.rab_items}
                                            onChange={setRabItemField}
                                            onAdd={addRabItem}
                                            onRemove={removeRabItem}
                                        />
                                    ) : (
                                        <RabTable items={rabItems} />
                                    )}
                                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-blue-700">Total RAB</div>
                                        <div className="mt-1 text-2xl font-black text-poltekpar-primary">{fmtMoney(editingSection === 'budget' ? draftTotalRab : pengajuan.total_anggaran)}</div>
                                    </div>
                                </div>
                            </Card>
                            <Card
                                title="Sumber Dana"
                                action={sectionActions('funding', {
                                    sumber_dana: draft.sumber_dana,
                                    dana_perguruan_tinggi: Number(draft.dana_perguruan_tinggi || 0),
                                    dana_pemerintah: Number(draft.dana_pemerintah || 0),
                                    dana_lembaga_dalam: Number(draft.dana_lembaga_dalam || 0),
                                    dana_lembaga_luar: Number(draft.dana_lembaga_luar || 0),
                                })}
                                icon={<Wallet size={16} className="text-slate-400" />}
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {editingSection === 'funding' ? (
                                        <>
                                            <EditField label="Sumber Dana Umum" value={draft.sumber_dana} onChange={(v) => setDraftField('sumber_dana', v)} wide />
                                            <EditField label="Perguruan Tinggi" value={draft.dana_perguruan_tinggi} type="number" onChange={(v) => setDraftField('dana_perguruan_tinggi', v)} />
                                            <EditField label="Pemerintah" value={draft.dana_pemerintah} type="number" onChange={(v) => setDraftField('dana_pemerintah', v)} />
                                            <EditField label="Lembaga Dalam Negeri" value={draft.dana_lembaga_dalam} type="number" onChange={(v) => setDraftField('dana_lembaga_dalam', v)} />
                                            <EditField label="Lembaga Luar Negeri" value={draft.dana_lembaga_luar} type="number" onChange={(v) => setDraftField('dana_lembaga_luar', v)} />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Sumber Dana Umum" value={pengajuan.sumber_dana} wide />
                                            <Field label="Perguruan Tinggi" value={fmtMoney(pengajuan.dana_perguruan_tinggi)} />
                                            <Field label="Pemerintah" value={fmtMoney(pengajuan.dana_pemerintah)} />
                                            <Field label="Lembaga Dalam Negeri" value={fmtMoney(pengajuan.dana_lembaga_dalam)} />
                                            <Field label="Lembaga Luar Negeri" value={fmtMoney(pengajuan.dana_lembaga_luar)} />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Dokumen & Tautan"
                                action={sectionActions('docs', {
                                    surat_permohonan: draft.surat_permohonan,
                                    proposal: draft.proposal,
                                    rab: draft.rab,
                                })}
                                icon={<Folder size={16} className="text-slate-400" />}
                            >
                                <div className="space-y-4">
                                    {editingSection === 'docs' ? (
                                        <>
                                            <EditField label="URL Surat Permohonan" value={draft.surat_permohonan} onChange={(v) => setDraftField('surat_permohonan', v)} />
                                            <EditField label="URL Proposal" value={draft.proposal} onChange={(v) => setDraftField('proposal', v)} />
                                            <EditField label="Link Tambahan (pisahkan dengan koma)" value={draft.rab} onChange={(v) => setDraftField('rab', v)} textarea />
                                        </>
                                    ) : (
                                        <>
                                            <Doc label="Surat Permohonan" url={pengajuan.surat_permohonan} />
                                            <Doc label="Proposal (Opsional)" url={pengajuan.proposal} />
                                            <div className="space-y-1.5"><div className="text-xs font-semibold text-slate-700">Link Tambahan (Drive, Bukti lain...)</div>{extraLinks.length ? <div className="space-y-2">{extraLinks.map((link, i) => <a key={`${link}-${i}`} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-indigo-600"><span className="truncate">Link {i + 1}</span><ExternalLink size={14} /></a>)}</div> : <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">Tidak ada link tambahan.</div>}</div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card
                                title="Identitas Pengusul"
                                action={sectionActions('submitter', {
                                    nama_pengusul: draft.nama_pengusul,
                                    email_pengusul: draft.email_pengusul,
                                    instansi_mitra: draft.instansi_mitra,
                                    no_telepon: draft.no_telepon,
                                })}
                                icon={<User size={16} className="text-slate-400" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {editingSection === 'submitter' ? (
                                        <>
                                            <EditField label="Nama Lengkap / Perwakilan" value={draft.nama_pengusul} onChange={(v) => setDraftField('nama_pengusul', v)} />
                                            <EditField label="Nama Instansi / Organisasi" value={draft.instansi_mitra} onChange={(v) => setDraftField('instansi_mitra', v)} />
                                            <EditField label="Email" value={draft.email_pengusul} type="email" onChange={(v) => setDraftField('email_pengusul', v)} />
                                            <EditField label="WhatsApp" value={draft.no_telepon} onChange={(v) => setDraftField('no_telepon', v)} />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Nama Lengkap / Perwakilan" value={submitterName} />
                                            <Field label="Nama Instansi / Organisasi" value={pengajuan.instansi_mitra} />
                                            <Field label="Email" value={submitterEmail} />
                                            <Field label="WhatsApp" value={pengajuan.no_telepon} />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Kebutuhan PKM"
                                action={sectionActions('detail', { kebutuhan: draft.kebutuhan })}
                                icon={<File size={16} className="text-slate-400" />}
                            >
                                {editingSection === 'detail'
                                    ? <EditField label="Deskripsi Kebutuhan / Permintaan" value={draft.kebutuhan} onChange={(v) => setDraftField('kebutuhan', v)} wide textarea />
                                    : <Field label="Deskripsi Kebutuhan / Permintaan" value={pengajuan.kebutuhan} wide />}
                            </Card>
                            <Card
                                title="Lokasi PKM"
                                action={sectionActions('location', {
                                    provinsi: draft.provinsi,
                                    kota_kabupaten: draft.kota_kabupaten,
                                    kecamatan: draft.kecamatan,
                                    kelurahan_desa: draft.kelurahan_desa,
                                    alamat_lengkap: draft.alamat_lengkap,
                                })}
                                icon={<MapPin size={16} className="text-slate-400" />}
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {editingSection === 'location' ? (
                                        <>
                                            <EditField label="Provinsi" value={draft.provinsi} onChange={(v) => setDraftField('provinsi', v)} />
                                            <EditField label="Kota / Kabupaten" value={draft.kota_kabupaten} onChange={(v) => setDraftField('kota_kabupaten', v)} />
                                            <EditField label="Kecamatan" value={draft.kecamatan} onChange={(v) => setDraftField('kecamatan', v)} />
                                            <EditField label="Kelurahan / Desa" value={draft.kelurahan_desa} onChange={(v) => setDraftField('kelurahan_desa', v)} />
                                            <EditField label="Alamat Lengkap" value={draft.alamat_lengkap} onChange={(v) => setDraftField('alamat_lengkap', v)} wide textarea />
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Provinsi" value={pengajuan.provinsi} />
                                            <Field label="Kota / Kabupaten" value={pengajuan.kota_kabupaten} />
                                            <Field label="Kecamatan" value={pengajuan.kecamatan} />
                                            <Field label="Kelurahan / Desa" value={pengajuan.kelurahan_desa} />
                                            <Field label="Alamat Lengkap" value={pengajuan.alamat_lengkap} wide />
                                        </>
                                    )}
                                </div>
                            </Card>
                            <Card
                                title="Tautan Dokumen"
                                action={sectionActions('docs', {
                                    surat_permohonan: draft.surat_permohonan,
                                    proposal: draft.proposal,
                                    rab: draft.rab,
                                })}
                                icon={<Folder size={16} className="text-slate-400" />}
                            >
                                <div className="space-y-4">
                                    {editingSection === 'docs' ? (
                                        <>
                                            <EditField label="URL Surat Permohonan" value={draft.surat_permohonan} onChange={(v) => setDraftField('surat_permohonan', v)} />
                                            <EditField label="URL Proposal" value={draft.proposal} onChange={(v) => setDraftField('proposal', v)} />
                                            <EditField label="Link Tambahan (pisahkan dengan koma)" value={draft.rab} onChange={(v) => setDraftField('rab', v)} textarea />
                                        </>
                                    ) : (
                                        <>
                                            <Doc label="Surat Permohonan" url={pengajuan.surat_permohonan} />
                                            <Doc label="Proposal (Opsional)" url={pengajuan.proposal} />
                                            <div className="space-y-1.5"><div className="text-xs font-semibold text-slate-700">Link Tambahan</div>{extraLinks.length ? <div className="space-y-2">{extraLinks.map((link, i) => <a key={`${link}-${i}`} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-indigo-600"><span className="truncate">Link {i + 1}</span><ExternalLink size={14} /></a>)}</div> : <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">Tidak ada link tambahan.</div>}</div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </>
                    )}
                </div>

                <div className="space-y-6">
                    <Card title="Ringkasan Pengajuan" icon={<File size={16} className="text-slate-400" />}><div className="space-y-4"><Field label="Sumber Pengajuan" value={isDosen ? 'Auth Dosen' : 'Auth Masyarakat'} /><Field label="Jenis PKM" value={pengajuan.jenis_pkm?.nama_jenis} /><Field label="Email Pengaju" value={submitterEmail} /><Field label="Tanggal Pengajuan" value={fmtDate(pengajuan.created_at)} />{isDosen && <><Field label="Tanggal Mulai" value={fmtDate(pengajuan.tgl_mulai)} /><Field label="Tanggal Selesai" value={fmtDate(pengajuan.tgl_selesai)} /></>}</div></Card>
                    {pengajuan.catatan_admin && <div className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"><div className="mb-1 text-[12px] font-bold uppercase tracking-wider text-amber-700">Catatan Terakhir</div><p className="whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-slate-700">{pengajuan.catatan_admin}</p></div>}
                    {pengajuan.status_pengajuan !== 'selesai' && <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4"><h2 className="text-[14px] font-semibold text-zinc-900">Verifikasi Berkas</h2></div><div className="space-y-6 p-5"><div className="grid grid-cols-1 gap-3"><button onClick={() => missing.length > 0 ? setConfirmDialog({ open: true, title: 'Verifikasi Belum Bisa Dilanjutkan', message: `Pengajuan ini masih belum lengkap pada bagian: ${missing.join(', ')}. Lengkapi dulu data tersebut atau hubungi pengaju sebelum memproses status.`, action: () => undefined, variant: 'warning', confirmLabel: 'Mengerti', cancelLabel: 'Tutup' }) : setSelectedAction('diterima')} className={`flex items-center justify-between rounded-lg border px-4 py-3 text-[14px] font-medium transition-all ${selectedAction === 'diterima' ? 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-emerald-200 bg-emerald-50/30 text-emerald-700'}`}><div className="flex items-center gap-3"><CheckCircle size={18} />Diterima</div></button><button onClick={() => missing.length > 0 ? setConfirmDialog({ open: true, title: 'Verifikasi Belum Bisa Dilanjutkan', message: `Pengajuan ini masih belum lengkap pada bagian: ${missing.join(', ')}. Lengkapi dulu data tersebut atau hubungi pengaju sebelum memproses status.`, action: () => undefined, variant: 'warning', confirmLabel: 'Mengerti', cancelLabel: 'Tutup' }) : setSelectedAction('direvisi')} className={`flex items-center justify-between rounded-lg border px-4 py-3 text-[14px] font-medium transition-all ${selectedAction === 'direvisi' ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-sm' : 'border-amber-200 bg-amber-50/30 text-amber-700'}`}><div className="flex items-center gap-3"><RotateCcw size={18} />Revisi</div></button><button onClick={() => missing.length > 0 ? setConfirmDialog({ open: true, title: 'Verifikasi Belum Bisa Dilanjutkan', message: `Pengajuan ini masih belum lengkap pada bagian: ${missing.join(', ')}. Lengkapi dulu data tersebut atau hubungi pengaju sebelum memproses status.`, action: () => undefined, variant: 'warning', confirmLabel: 'Mengerti', cancelLabel: 'Tutup' }) : setSelectedAction('ditolak')} className={`flex items-center justify-between rounded-lg border px-4 py-3 text-[14px] font-medium transition-all ${selectedAction === 'ditolak' ? 'border-red-300 bg-red-50 text-red-800 shadow-sm' : 'border-red-200 bg-red-50/30 text-red-700'}`}><div className="flex items-center gap-3"><X size={18} />Ditolak</div></button></div>{selectedAction === 'direvisi' && <div className="pt-2"><textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={4} placeholder="Catatan revisi..." className="w-full rounded-md border border-zinc-200 p-3 text-[13px] outline-none" />{catatanError && <p className="mt-1.5 text-[12px] text-red-500">{catatanError}</p>}</div>}<button onClick={saveDecision} disabled={!selectedAction || (selectedAction === 'direvisi' && !catatan.trim())} className={`w-full rounded-xl py-3 text-[14px] font-bold ${selectedAction && (selectedAction !== 'direvisi' || catatan.trim()) ? 'bg-zinc-900 text-white' : 'cursor-not-allowed bg-zinc-100 text-zinc-400'}`}>Verifikasi</button></div></div>}
                </div>
            </div>

            <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} cancelLabel={confirmDialog.cancelLabel} onConfirm={() => { confirmDialog.action(); setConfirmDialog((prev) => ({ ...prev, open: false })); }} onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))} variant={confirmDialog.variant} />
        </AdminLayout>
    );
}
