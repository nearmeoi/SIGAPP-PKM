import React, { useRef, useState, useMemo, ChangeEvent, FormEvent } from 'react';
import { useForm, router } from '@inertiajs/react';
import ActionFeedbackDialog from './ActionFeedbackDialog';
import DocumentationGallery from './DocumentationGallery';
import TestimonialSidebarDisplay from './TestimonialSidebarDisplay';
import type { PkmData } from '@/types';

interface Submission {
    id: number;
    judul: string;
    ringkasan: string;
    tanggal: string;
    status: string;
    catatan?: string;
    tim_pelaksana?: { dosen_terlibat: string[]; staff_terlibat: string[]; mahasiswa_terlibat: string[] };
}

interface DosenSubmissionCardProps {
    onSubmitted?: (submission: Submission) => void;
    submissionStatus?: string;
    onUpdateSubmissionStatus?: (status: string) => void;
    pkmStatusData?: PkmData | null;
    pkmListData?: PkmData[];
    submissionHistory?: Submission[];
    hideMainTabNav?: boolean;
    onlyShowStatus?: boolean;
}

interface RabItem {
    nama_item: string;
    jumlah: number;
    harga: number;
    total: number;
}

interface FormData {
    nama_ketua: string;
    instansi: string;
    email: string;
    whatsapp: string;
    judul_kegiatan: string;
    provinsi: string;
    kota_kabupaten: string;
    kecamatan: string;
    kelurahan_desa: string;
    alamat_lengkap: string;
    
    tim_dosen: string[];
    tim_staff: string[];
    tim_mahasiswa: string[];
    
    rab_items: RabItem[];
    
    dana_perguruan_tinggi: number;
    dana_pemerintah: number;
    dana_lembaga_dalam: number;
    dana_lembaga_luar: number;
    
    surat_permohonan: string;
    surat_proposal: string;
    link_tambahan: string[];
}

const createSubmittedLabel = (): string => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
const getPkmStatusLabel = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1d4ed8' },
        ditangguhkan: { label: 'Revisi', icon: 'fa-file-pen', bg: '#fef3c7', color: '#b45309' },
        ditolak: { label: 'Ditolak', icon: 'fa-circle-xmark', bg: '#fee2e2', color: '#b91c1c' },
        diterima: { label: 'Diterima', icon: 'fa-circle-check', bg: '#dcfce7', color: '#15803d' },
        berlangsung: { label: 'Berlangsung', icon: 'fa-person-walking', bg: '#fef3c7', color: '#b45309' },
        selesai: { label: 'Selesai', icon: 'fa-flag-checkered', bg: '#dcfce7', color: '#15803d' },
        belum_diajukan: { label: 'Belum Diajukan', icon: 'fa-file-circle-plus', bg: '#f1f5f9', color: '#64748b' },
    };
    return styles[status] || styles.belum_diajukan;
};

export default function DosenSubmissionCard({
    onSubmitted,
    submissionStatus = 'belum_diajukan',
    onUpdateSubmissionStatus,
    pkmStatusData = null,
    pkmListData = [],
    submissionHistory = [],
    hideMainTabNav = false,
    onlyShowStatus = false,
}: DosenSubmissionCardProps) {
    const [mainTab, setMainTab] = useState('pengajuan');
    const [expandedHubSections, setExpandedHubSections] = useState({ kegiatan: false, riwayat: false });
    const [expandedActivityId, setExpandedActivityId] = useState<number | null>(pkmListData[0]?.id ?? null);
    const [selectedDetail, setSelectedDetail] = useState<Submission | null>(null);
    const [isMockSubmitting, setIsMockSubmitting] = useState(false);
    const [feedbackDialog, setFeedbackDialog] = useState<{ show: boolean; type: 'success' | 'error'; title: string; message: string }>({ show: false, type: 'success', title: '', message: '' });

    const { data, setData, errors, setError, clearErrors, reset } = useForm<FormData>({
        nama_ketua: '',
        instansi: 'Politeknik Pariwisata Makassar',
        email: '',
        whatsapp: '',
        judul_kegiatan: '',
        provinsi: '',
        kota_kabupaten: '',
        kecamatan: '',
        kelurahan_desa: '',
        alamat_lengkap: '',
        tim_dosen: [''],
        tim_staff: [''],
        tim_mahasiswa: [''],
        rab_items: [{ nama_item: '', jumlah: 1, harga: 0, total: 0 }],
        dana_perguruan_tinggi: 0,
        dana_pemerintah: 0,
        dana_lembaga_dalam: 0,
        dana_lembaga_luar: 0,
        surat_permohonan: '',
        surat_proposal: '',
        link_tambahan: [''],
    });

    const handleAddMember = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa') => setData(type, [...data[type], '']);
    const handleRemoveMember = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa', idx: number) => setData(type, data[type].filter((_, i) => i !== idx));
    const handleMemberChange = (type: 'tim_dosen' | 'tim_staff' | 'tim_mahasiswa', idx: number, val: string) => {
        const updated = [...data[type]];
        updated[idx] = val;
        setData(type, updated);
    };

    const handleAddRab = () => setData('rab_items', [...data.rab_items, { nama_item: '', jumlah: 1, harga: 0, total: 0 }]);
    const handleRemoveRab = (idx: number) => setData('rab_items', data.rab_items.filter((_, i) => i !== idx));
    const handleRabChange = (idx: number, field: keyof RabItem, val: string | number) => {
        const updated = [...data.rab_items];
        const item = { ...updated[idx], [field]: val };
        if (field === 'jumlah' || field === 'harga') item.total = Number(item.jumlah) * Number(item.harga);
        updated[idx] = item;
        setData('rab_items', updated);
    };

    const handleAddLink = () => setData('link_tambahan', [...data.link_tambahan, '']);
    const handleRemoveLink = (idx: number) => setData('link_tambahan', data.link_tambahan.filter((_, i) => i !== idx));
    const handleLinkChange = (idx: number, val: string) => {
        const updated = [...data.link_tambahan];
        updated[idx] = val;
        setData('link_tambahan', updated);
    };

    const totalRAB = useMemo(() => data.rab_items.reduce((sum, item) => sum + (item.total || 0), 0), [data.rab_items]);
    const totalDana = Number(data.dana_perguruan_tinggi) + Number(data.dana_pemerintah) + Number(data.dana_lembaga_dalam) + Number(data.dana_lembaga_luar);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.judul_kegiatan.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi judul kegiatan PKM.' });
            return;
        }
        if (!data.nama_ketua.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi nama ketua kelompok.' });
            return;
        }
        if (!data.email.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi email kampus.' });
            return;
        }
        if (!data.provinsi.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi provinsi lokasi PKM.' });
            return;
        }
        if (!data.kota_kabupaten.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi kota/kabupaten.' });
            return;
        }

        setIsMockSubmitting(true);

        // Build payload sesuai backend PengajuanUserController::store (role dosen)
        const payload = {
            judul_kegiatan:     data.judul_kegiatan,
            nama_dosen:         data.nama_ketua,
            instansi_mitra:     data.instansi,
            no_telepon:         data.whatsapp,
            provinsi:           data.provinsi,
            kota_kabupaten:     data.kota_kabupaten,
            kecamatan:          data.kecamatan,
            kelurahan_desa:     data.kelurahan_desa,
            alamat_lengkap:     data.alamat_lengkap,
            dosen_terlibat:     data.tim_dosen.filter(v => v.trim() !== ''),
            staff_terlibat:     data.tim_staff.filter(v => v.trim() !== ''),
            mahasiswa_terlibat: data.tim_mahasiswa.filter(v => v.trim() !== ''),
            sumber_dana:        'Perguruan Tinggi',
            total_anggaran:     totalRAB || 0,
            proposal_url:       data.surat_proposal,
            surat_permohonan_url: data.surat_permohonan,
            rab:                data.link_tambahan.filter(v => v.trim() !== '').join(', '),
        };

        router.post('/pengajuan', payload as any, {
            preserveScroll: true,
            onSuccess: () => {
                setIsMockSubmitting(false);
                onSubmitted?.({
                    id: Date.now(),
                    judul: data.judul_kegiatan,
                    ringkasan: `Lokasi: ${data.kota_kabupaten} • Ketua: ${data.nama_ketua}`,
                    tanggal: createSubmittedLabel(),
                    status: 'diproses',
                });
                onUpdateSubmissionStatus?.('diproses');
                setFeedbackDialog({ show: true, type: 'success', title: 'Pengajuan Berhasil', message: 'Data pengajuan PKM Dosen telah disimpan.' });
                reset();
            },
            onError: () => {
                setIsMockSubmitting(false);
                setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Mengirim', message: 'Terjadi kesalahan saat menyimpan. Coba lagi.' });
            },
        });
    };


    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const style = getSubmissionStatusStyle(selectedDetail.status);
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setSelectedDetail(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sigap-blue text-white flex items-center justify-center shadow-md"><i className="fa-solid fa-file-invoice text-lg"></i></div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedDetail.judul}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">{selectedDetail.tanggal}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"><i className="fa-solid fa-xmark"></i></button>
                    </div>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}><i className={`fa-solid ${style.icon}`}></i>{style.label}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sigap-blue"><i className="fa-solid fa-info-circle text-xs"></i><span className="text-xs font-bold uppercase tracking-wider">Ringkasan</span></div>
                            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedDetail.ringkasan}</p>
                        </div>
                        {selectedDetail.catatan && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-amber-600"><i className="fa-solid fa-comment-dots text-xs"></i><span className="text-xs font-bold uppercase tracking-wider">Catatan Admin</span></div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3"><i className="fa-solid fa-quote-left text-amber-200 text-xl mt-1"></i><p className="text-sm text-amber-800 italic leading-relaxed">{selectedDetail.catatan}</p></div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderArchiveTab = () => (
        <div className="p-6">
            <div className="flex items-start gap-4 p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 mb-5">
                <span className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-layer-group text-lg"></i></span>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">Arsip & Riwayat PKM</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">Daftar kegiatan PKM yang sudah terdata dan histori pengajuan Anda.</p>
                </div>
            </div>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(p => ({ ...p, kegiatan: !p.kegiatan }))}>
                    <h4 className="text-sm font-bold text-slate-900">Daftar Kegiatan</h4>
                    <i className={`fa-solid fa-chevron-${expandedHubSections.kegiatan ? 'up' : 'down'} text-slate-400`}></i>
                </button>
                {expandedHubSections.kegiatan && (
                    <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {pkmListData.map(a => (
                            <div key={a.id} className="p-4"><strong className="text-sm font-semibold text-slate-900 block">{a.nama}</strong><p className="text-xs text-slate-500">{a.tahun} • {a.kabupaten}</p></div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button type="button" className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors" onClick={() => setExpandedHubSections(p => ({ ...p, riwayat: !p.riwayat }))}>
                    <h4 className="text-sm font-bold text-slate-900">Riwayat Pengajuan</h4>
                    <i className={`fa-solid fa-chevron-${expandedHubSections.riwayat ? 'up' : 'down'} text-slate-400`}></i>
                </button>
                {expandedHubSections.riwayat && (
                    <div className="border-t border-slate-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Nama Pengajuan</th>
                                    <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissionHistory.length > 0 ? (
                                    submissionHistory.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4"><strong className="text-sm font-semibold text-slate-900 block">{item.judul}</strong><span className="text-[11px] text-slate-500 line-clamp-1">{item.ringkasan}</span></td>
                                            <td className="px-4 py-4 text-center">
                                                <button type="button" className="text-[11px] font-bold text-sigap-blue hover:underline" onClick={() => setSelectedDetail(item)}>Detail</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400 text-xs italic">Belum ada riwayat pengajuan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderSubmissionForm = () => (
        <div className="p-6 space-y-8">
            {/* Identitas Pengusul */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-id-card text-sigap-blue"></i>Identitas Pengusul</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Judul Kegiatan PKM <span className="text-red-500">*</span></label>
                        <input type="text" value={data.judul_kegiatan} onChange={e => setData('judul_kegiatan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Masukkan judul pengabdian" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Nama Ketua Kelompok (Dosen) <span className="text-red-500">*</span></label>
                        <input type="text" value={data.nama_ketua} onChange={e => setData('nama_ketua', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Nama lengkap dan gelar" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Instansi / Unit Kerja</label>
                        <input type="text" value={data.instansi} readOnly className="w-full px-3 py-2 border border-slate-100 bg-slate-50 text-slate-500 rounded-lg text-sm" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Email Kampus <span className="text-red-500">*</span></label>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="email@poltekparmakassar.ac.id" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">WhatsApp <span className="text-red-500">*</span></label>
                        <input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="081234567890" />
                    </div>
                </div>
            </section>

            {/* Lokasi PKM Card */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-map-location-dot text-sigap-blue"></i>Lokasi PKM</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Provinsi <span className="text-red-500">*</span></label><input type="text" value={data.provinsi} onChange={e => setData('provinsi', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Provinsi" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kota / Kabupaten <span className="text-red-500">*</span></label><input type="text" value={data.kota_kabupaten} onChange={e => setData('kota_kabupaten', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Kota/Kabupaten" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kecamatan</label><input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Kecamatan" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Kelurahan / Desa</label><input type="text" value={data.kelurahan_desa} onChange={e => setData('kelurahan_desa', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder="Kelurahan/Desa" /></div>
                    <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-slate-700">Alamat Lengkap</label><textarea value={data.alamat_lengkap} onChange={e => setData('alamat_lengkap', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100 resize-none" placeholder="Detail alamat lokasi PKM..." /></div>
                </div>
            </section>

            {/* Tim Pelaksana Section */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-users-gear text-sigap-blue"></i>Tim Pelaksana</h3>
                
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Anggota Dosen</label>
                    {data.tim_dosen.map((m, i) => (
                        <div key={i} className="flex gap-2">
                            <input type="text" value={m} onChange={e => handleMemberChange('tim_dosen', i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder={`Nama Dosen ${i+1}`} />
                            {data.tim_dosen.length > 1 && <button type="button" onClick={() => handleRemoveMember('tim_dosen', i)} className="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50"><i className="fa-solid fa-trash-can"></i></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddMember('tim_dosen')} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Dosen</button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Anggota Staff</label>
                    {data.tim_staff.map((m, i) => (
                        <div key={i} className="flex gap-2">
                            <input type="text" value={m} onChange={e => handleMemberChange('tim_staff', i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder={`Nama Staff ${i+1}`} />
                            {data.tim_staff.length > 1 && <button type="button" onClick={() => handleRemoveMember('tim_staff', i)} className="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50"><i className="fa-solid fa-trash-can"></i></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddMember('tim_staff')} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Staff</button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Anggota Mahasiswa</label>
                    {data.tim_mahasiswa.map((m, i) => (
                        <div key={i} className="flex gap-2">
                            <input type="text" value={m} onChange={e => handleMemberChange('tim_mahasiswa', i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue focus:ring-2 focus:ring-blue-100" placeholder={`Nama Mahasiswa ${i+1}`} />
                            {data.tim_mahasiswa.length > 1 && <button type="button" onClick={() => handleRemoveMember('tim_mahasiswa', i)} className="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50"><i className="fa-solid fa-trash-can"></i></button>}
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddMember('tim_mahasiswa')} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Mahasiswa</button>
                </div>
            </section>

            {/* RAB Section */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-calculator text-sigap-blue"></i>Rencana Anggaran Biaya (RAB)</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[400px]">
                        <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-3 py-2">Item</th>
                                <th className="px-3 py-2 w-20 text-center">Jml</th>
                                <th className="px-3 py-2 w-32">Harga (Rp)</th>
                                <th className="px-3 py-2 w-10 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.rab_items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-2"><input type="text" value={item.nama_item} onChange={e => handleRabChange(idx, 'nama_item', e.target.value)} className="w-full px-2 py-1.5 border border-slate-100 rounded text-xs outline-none focus:border-sigap-blue" placeholder="Nama item..." /></td>
                                    <td className="p-2"><input type="number" value={item.jumlah} onChange={e => handleRabChange(idx, 'jumlah', parseInt(e.target.value)||0)} className="w-full px-2 py-1.5 border border-slate-100 rounded text-xs text-center outline-none focus:border-sigap-blue" /></td>
                                    <td className="p-2"><input type="number" value={item.harga} onChange={e => handleRabChange(idx, 'harga', parseInt(e.target.value)||0)} className="w-full px-2 py-1.5 border border-slate-100 rounded text-xs outline-none focus:border-sigap-blue" /></td>
                                    <td className="p-2 text-center">
                                        {data.rab_items.length > 1 && <button type="button" onClick={() => handleRemoveRab(idx)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-xmark"></i></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50/50">
                            <tr>
                                <td colSpan={2} className="px-3 py-2 text-xs font-bold text-slate-700 text-right">Estimasi Total RAB:</td>
                                <td className="px-3 py-2 text-xs font-bold text-sigap-blue">Rp {totalRAB.toLocaleString('id-ID')}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button type="button" onClick={handleAddRab} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Baris RAB</button>
            </section>

            {/* Sumber Dana Section */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-hand-holding-dollar text-sigap-blue"></i>Sumber Pendanaan (Rp)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase">Perguruan Tinggi</label><input type="number" value={data.dana_perguruan_tinggi} onChange={e => setData('dana_perguruan_tinggi', parseInt(e.target.value)||0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="0" /></div>
                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase">Pemerintah</label><input type="number" value={data.dana_pemerintah} onChange={e => setData('dana_pemerintah', parseInt(e.target.value)||0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="0" /></div>
                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase">Lembaga Dalam Negeri</label><input type="number" value={data.dana_lembaga_dalam} onChange={e => setData('dana_lembaga_dalam', parseInt(e.target.value)||0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="0" /></div>
                    <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-500 uppercase">Lembaga Luar Negeri</label><input type="number" value={data.dana_lembaga_luar} onChange={e => setData('dana_lembaga_luar', parseInt(e.target.value)||0)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="0" /></div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center"><span className="text-xs font-bold text-blue-700">Total Keseluruhan Dana:</span><span className="text-sm font-bold text-sigap-blue">Rp {totalDana.toLocaleString('id-ID')}</span></div>
            </section>

            {/* Dokumen Section */}
            <section className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><i className="fa-solid fa-link text-sigap-blue"></i>Tautan Dokumen Pendukung</h3>
                <div className="space-y-4">
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Link Surat Permohonan <span className="text-red-500">*</span></label><input type="url" value={data.surat_permohonan} onChange={e => setData('surat_permohonan', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="https://..." /></div>
                    <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-700">Link Proposal PKM <span className="text-red-500">*</span></label><input type="url" value={data.surat_proposal} onChange={e => setData('surat_proposal', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="https://..." /></div>
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-700">Link Tambahan Lainnya</label>
                        {data.link_tambahan.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <input type="url" value={l} onChange={e => handleLinkChange(i, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-sigap-blue" placeholder="Link tambahan..." />
                                {data.link_tambahan.length > 1 && <button type="button" onClick={() => handleRemoveLink(i)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500"><i className="fa-solid fa-trash-can"></i></button>}
                            </div>
                        ))}
                        <button type="button" onClick={handleAddLink} className="text-xs font-bold text-sigap-blue hover:underline flex items-center gap-1.5"><i className="fa-solid fa-plus-circle"></i>Tambah Tautan Lagi</button>
                    </div>
                </div>
            </section>

            <button type="submit" disabled={isMockSubmitting} className="w-full py-3.5 bg-sigap-blue hover:bg-sigap-darkBlue text-white font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {isMockSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i>Memproses...</> : <><i className="fa-solid fa-paper-plane"></i>Kirim Pengajuan Dosen</>}
            </button>
        </div>
    );

    if (onlyShowStatus || submissionStatus !== 'belum_diajukan') {
        const style = getSubmissionStatusStyle(submissionStatus);
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                    <div><h3 className="text-base font-bold text-slate-900">Akses Pengajuan PKM</h3><p className="text-sm text-slate-500 mt-0.5">Kelola pengajuan dosen Anda</p></div>
                </div>
                {!hideMainTabNav && (
                    <div className="flex border-b border-slate-100">
                        <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                        <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                    </div>
                )}
                {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center py-8 border-b border-slate-100">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg" style={{ backgroundColor: style.bg, color: style.color }}><i className={`fa-solid ${style.icon}`}></i></div>
                            <h4 className="text-lg font-bold text-slate-900 mb-3">{submissionStatus === 'belum_diajukan' ? 'Belum Ada Pengajuan Aktif' : 'Status Pengajuan: ' + style.label}</h4>
                            <p className="text-sm text-slate-600 max-w-md">Detail riwayat pengajuan dosen dapat dilihat pada tabel di bawah.</p>
                            {submissionStatus === 'ditolak' || submissionStatus === 'belum_diajukan' ? (
                                <button type="button" onClick={() => onUpdateSubmissionStatus?.('belum_diajukan')} className="mt-6 px-8 py-3 bg-sigap-blue text-white font-bold rounded-xl shadow-md transition-transform hover:scale-105">Buat Pengajuan Baru</button>
                            ) : null}
                        </div>
                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4"><i className="fa-solid fa-clock-rotate-left text-sigap-blue"></i><h4 className="text-sm font-bold text-slate-900">Semua Riwayat Pengajuan</h4></div>
                            <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Nama Pengajuan</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {submissionHistory.length > 0 ? (
                                            submissionHistory.map(item => (
                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-4"><strong className="text-sm font-semibold text-slate-900 block">{item.judul}</strong><span className="text-[11px] text-slate-500 line-clamp-1">{item.ringkasan}</span></td>
                                                    <td className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">{item.tanggal}</td>
                                                    <td className="px-4 py-4 text-center">
                                                        <button type="button" className="text-[11px] font-bold text-sigap-blue hover:underline" onClick={() => setSelectedDetail(item)}>Detail</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs italic">Belum ada riwayat pengajuan.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                {renderDetailModal()}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sigap-blue to-sigap-darkBlue flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Form Pengajuan PKM Dosen</h3><p className="text-sm text-slate-500 mt-0.5">Silakan lengkapi data usulan pengabdian</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-sigap-blue border-b-2 border-sigap-blue' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
                </div>
            )}
            {!hideMainTabNav && mainTab === 'arsip' ? renderArchiveTab() : (
                <form onSubmit={handleSubmit}>
                    {renderSubmissionForm()}
                </form>
            )}
            <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
            {renderDetailModal()}
        </div>
    );
}
