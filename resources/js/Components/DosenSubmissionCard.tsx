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
    instansi_mitra?: string;
    no_telepon?: string;
    provinsi?: string;
    kota_kabupaten?: string;
    kecamatan?: string;
    kelurahan_desa?: string;
    alamat_lengkap?: string;
    proposal?: string;
    surat_permohonan?: string;
    rab?: string;
    sumber_dana?: string;
    total_anggaran?: number;
    tgl_mulai?: string;
    tgl_selesai?: string;
    jenis_pkm?: string;
    tim_kegiatan?: { nama: string; peran: string }[];
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
    sumber_dana: string[];
}

const createSubmittedLabel = (): string => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
const getPkmStatusLabel = (status: string): string => status === 'berlangsung' ? 'Berlangsung' : 'Selesai';

const getSubmissionStatusStyle = (status: string) => {
    const styles: Record<string, { label: string; icon: string; bg: string; color: string }> = {
        diproses: { label: 'Diproses', icon: 'fa-clock', bg: '#dbeafe', color: '#1E4A8C' },
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
        sumber_dana: [],
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
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!data.judul_kegiatan.trim()) {
            setFeedbackDialog({ show: true, type: 'error', title: 'Form Belum Lengkap', message: 'Mohon isi judul kegiatan PKM.' });
            return;
        }
        setIsMockSubmitting(true);

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
            sumber_dana:        data.sumber_dana.join(', ') || '',
            dana_perguruan_tinggi: data.dana_perguruan_tinggi > 0 ? data.dana_perguruan_tinggi : null,
            dana_pemerintah:    data.dana_pemerintah > 0 ? data.dana_pemerintah : null,
            dana_lembaga_dalam: data.dana_lembaga_dalam > 0 ? data.dana_lembaga_dalam : null,
            dana_lembaga_luar:  data.dana_lembaga_luar > 0 ? data.dana_lembaga_luar : null,
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
                setFeedbackDialog({ show: true, type: 'error', title: 'Gagal Mengirim', message: 'Terjadi kesalahan saat mengirim pengajuan.' });
            },
        });
    };

    const renderDetailModal = () => {
        if (!selectedDetail) return null;
        const style = getSubmissionStatusStyle(selectedDetail.status);
        
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="absolute inset-0" onClick={() => setSelectedDetail(null)}></div>
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-poltekpar-primary text-white flex items-center justify-center shadow-md">
                                <i className="fa-solid fa-file-invoice text-lg"></i>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{selectedDetail.judul}</h3>
                                <p className="text-[11px] text-slate-500 font-medium">{selectedDetail.tanggal}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status Pengajuan</span>
                            <div className="px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                <i className={`fa-solid ${style.icon}`}></i>
                                {style.label}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Informasi Umum</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500">Kategori:</span> <span className="text-slate-900 font-semibold">{selectedDetail.jenis_pkm || '-'}</span></p>
                                        <p><span className="text-slate-500">Instansi:</span> <span className="text-slate-900 font-semibold">{selectedDetail.instansi_mitra || '-'}</span></p>
                                        <p><span className="text-slate-500">WhatsApp:</span> <span className="text-slate-900 font-semibold">{selectedDetail.no_telepon || '-'}</span></p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lokasi PKM</h4>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                                        {selectedDetail.alamat_lengkap && <p className="mb-1">{selectedDetail.alamat_lengkap}</p>}
                                        <p>{[selectedDetail.kelurahan_desa, selectedDetail.kecamatan, selectedDetail.kota_kabupaten, selectedDetail.provinsi].filter(Boolean).join(', ')}</p>
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-4">
                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tim Pelaksana</h4>
                                    <div className="space-y-2">
                                        {selectedDetail.tim_kegiatan && selectedDetail.tim_kegiatan.length > 0 ? (
                                            selectedDetail.tim_kegiatan.map((t, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-poltekpar-primary"></div>
                                                    <span className="text-slate-900 font-medium">{t.nama}</span>
                                                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-tighter">({t.peran})</span>
                                                </div>
                                            ))
                                        ) : <p className="text-xs text-slate-400 italic">Data tim belum diatur.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anggaran & Dokumen</h4>
                                    <div className="space-y-3">
                                        <div className="p-2.5 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                                            <span className="text-[10px] font-bold text-blue-700 uppercase">Total RAB</span>
                                            <span className="text-sm font-black text-poltekpar-primary">Rp {Number(selectedDetail.total_anggaran || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedDetail.proposal && <a href={selectedDetail.proposal} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-pdf mr-1.5"></i>PROPOSAL</a>}
                                            {selectedDetail.surat_permohonan && <a href={selectedDetail.surat_permohonan} target="_blank" className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200"><i className="fa-solid fa-file-contract mr-1.5"></i>PERMOHONAN</a>}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {selectedDetail.catatan && (
                            <section>
                                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <i className="fa-solid fa-comment-dots"></i> Catatan Admin
                                </h4>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-sm text-amber-800 italic leading-relaxed">{selectedDetail.catatan}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={() => setSelectedDetail(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">Tutup</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderArchiveTab = () => (
        <div className="p-6">
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
        </div>
    );

    const renderSubmissionForm = () => (
        <div className="p-5 space-y-6">
            {/* Informasi Ketua */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Informasi Ketua Pengusul</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input type="text" value={data.nama_ketua} onChange={e => setData('nama_ketua', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Nama lengkap & gelar" required />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Instansi</label>
                        <input type="text" value={data.instansi} onChange={e => setData('instansi', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="email@contoh.com" required />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">No. WhatsApp <span className="text-red-500">*</span></label>
                        <input type="tel" value={data.whatsapp} onChange={e => setData('whatsapp', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="08xxxxxxxxxx" required />
                    </div>
                </div>
            </div>

            {/* Judul Kegiatan */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Detail Kegiatan</h4>
                <div>
                    <label className="text-[13px] font-bold text-slate-600 mb-1 block">Judul Kegiatan PKM <span className="text-red-500">*</span></label>
                    <textarea value={data.judul_kegiatan} onChange={e => setData('judul_kegiatan', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary min-h-[80px]" placeholder="Masukkan judul kegiatan pengabdian masyarakat..." required />
                </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Lokasi Kegiatan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Provinsi</label>
                        <input type="text" value={data.provinsi} onChange={e => setData('provinsi', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Provinsi" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Kota/Kabupaten</label>
                        <input type="text" value={data.kota_kabupaten} onChange={e => setData('kota_kabupaten', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Kota/Kabupaten" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Kecamatan</label>
                        <input type="text" value={data.kecamatan} onChange={e => setData('kecamatan', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Kecamatan" />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Kelurahan/Desa</label>
                        <input type="text" value={data.kelurahan_desa} onChange={e => setData('kelurahan_desa', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Kelurahan/Desa" />
                    </div>
                </div>
                <div>
                    <label className="text-[13px] font-bold text-slate-600 mb-1 block">Alamat Lengkap</label>
                    <textarea value={data.alamat_lengkap} onChange={e => setData('alamat_lengkap', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary min-h-[60px]" placeholder="Alamat lengkap lokasi kegiatan..." />
                </div>
            </div>

            {/* Tim */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Tim Pelaksana</h4>
                {(['tim_dosen', 'tim_staff', 'tim_mahasiswa'] as const).map(type => (
                    <div key={type}>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">
                            {type === 'tim_dosen' ? 'Dosen Terlibat' : type === 'tim_staff' ? 'Staf Terlibat' : 'Mahasiswa Terlibat'}
                        </label>
                        {data[type].map((member, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <input type="text" value={member} onChange={e => handleMemberChange(type, idx, e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder={`Nama ${type === 'tim_dosen' ? 'dosen' : type === 'tim_staff' ? 'staf' : 'mahasiswa'}...`} />
                                {data[type].length > 1 && (
                                    <button type="button" onClick={() => handleRemoveMember(type, idx)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => handleAddMember(type)} className="text-[11px] font-bold text-poltekpar-primary flex items-center gap-1 hover:opacity-70">
                            <i className="fa-solid fa-plus"></i> Tambah
                        </button>
                    </div>
                ))}
            </div>

            {/* RAB */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Rencana Anggaran Biaya (RAB)</h4>
                {data.rab_items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Nama Item</label>
                            <input type="text" value={item.nama_item} onChange={e => handleRabChange(idx, 'nama_item', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="Item..." />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Jumlah</label>
                            <input type="number" value={item.jumlah} onChange={e => handleRabChange(idx, 'jumlah', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" min={1} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Harga</label>
                            <input type="number" value={item.harga} onChange={e => handleRabChange(idx, 'harga', Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" min={0} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[12px] font-bold text-slate-500 mb-1 block">Total</label>
                            <div className="px-3 py-2 bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 border border-slate-100">
                                Rp {item.total.toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div className="col-span-1">
                            {data.rab_items.length > 1 && (
                                <button type="button" onClick={() => handleRemoveRab(idx)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <div className="flex items-center justify-between">
                    <button type="button" onClick={handleAddRab} className="text-[11px] font-bold text-poltekpar-primary flex items-center gap-1 hover:opacity-70">
                        <i className="fa-solid fa-plus"></i> Tambah Item
                    </button>
                    <div className="text-sm font-bold text-poltekpar-primary">
                        Total RAB: Rp {totalRAB.toLocaleString('id-ID')}
                    </div>
                </div>
            </div>

            {/* Sumber Dana */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Sumber Dana</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { label: 'Perguruan Tinggi', key: 'dana_perguruan_tinggi' },
                        { label: 'Pemerintah', key: 'dana_pemerintah' },
                        { label: 'Lembaga Dalam Negeri', key: 'dana_lembaga_dalam' },
                        { label: 'Lembaga Luar Negeri', key: 'dana_lembaga_luar' },
                    ].map(option => (
                        <div key={option.key} className="px-4 py-3 rounded-xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-poltekpar-primary/20 transition-all">
                            <label className="text-[13px] font-bold text-slate-600 mb-1.5 block">{option.label}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                <input
                                    type="number"
                                    value={data[option.key as keyof FormData] as number}
                                    onChange={e => setData(option.key as any, Number(e.target.value))}
                                    className="w-full pl-8 pr-3 py-2 bg-transparent rounded-lg text-sm font-semibold outline-none text-slate-900 placeholder-slate-400"
                                    placeholder="0"
                                    min={0}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dokumen */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Dokumen & Tautan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Link Surat Permohonan</label>
                        <input type="url" value={data.surat_permohonan} onChange={e => setData('surat_permohonan', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="https://drive.google.com/..." />
                    </div>
                    <div>
                        <label className="text-[13px] font-bold text-slate-600 mb-1 block">Link Proposal</label>
                        <input type="url" value={data.surat_proposal} onChange={e => setData('surat_proposal', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="https://drive.google.com/..." />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[13px] font-bold text-slate-600">Tautan Tambahan</label>
                        <button type="button" onClick={handleAddLink} className="text-[11px] font-bold text-poltekpar-primary flex items-center gap-1 hover:opacity-70">
                            <i className="fa-solid fa-plus"></i> Tambah
                        </button>
                    </div>
                    {data.link_tambahan.map((link, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <input type="url" value={link} onChange={e => handleLinkChange(idx, e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-poltekpar-primary/20 focus:border-poltekpar-primary" placeholder="https://..." />
                            {data.link_tambahan.length > 1 && (
                                <button type="button" onClick={() => handleRemoveLink(idx)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
                <button type="submit" disabled={isMockSubmitting} className="w-full py-3 bg-gradient-to-r from-poltekpar-primary to-poltekpar-navy text-white font-bold rounded-xl shadow-lg shadow-poltekpar-primary/20 disabled:opacity-50 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2">
                    {isMockSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
            </div>
        </div>
    );

    if (onlyShowStatus) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6">
                    <div className="border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Nama Pengajuan</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">Tanggal</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submissionHistory.length > 0 ? (
                                    submissionHistory.map(item => {
                                        const style = getSubmissionStatusStyle(item.status);
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <strong className="text-[14px] font-bold text-slate-900 block group-hover:text-poltekpar-primary transition-colors">{item.judul}</strong>
                                                    <span className="text-[11px] text-slate-400 font-medium line-clamp-1">{item.ringkasan}</span>
                                                </td>
                                                <td className="px-6 py-5 text-[13px] text-slate-600 font-medium whitespace-nowrap">{item.tanggal}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm" style={{ backgroundColor: style.bg, color: style.color }}>
                                                            <i className={`fa-solid ${style.icon} text-[9px]`}></i>{style.label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <button type="button" className="px-4 py-1.5 bg-slate-100 hover:bg-poltekpar-primary hover:text-white text-slate-600 text-[11px] font-bold rounded-lg transition-all" onClick={() => setSelectedDetail(item)}>DETAIL</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-bold italic">
                                            <div className="flex flex-col items-center gap-3">
                                                <i className="fa-solid fa-folder-open text-4xl text-slate-200"></i>
                                                Belum ada riwayat pengajuan.
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <ActionFeedbackDialog show={feedbackDialog.show} type={feedbackDialog.type} title={feedbackDialog.title} message={feedbackDialog.message} onClose={() => setFeedbackDialog({ ...feedbackDialog, show: false })} />
                {renderDetailModal()}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-poltekpar-primary to-poltekpar-navy flex items-center justify-center text-white shadow-md"><i className="fa-solid fa-file-signature text-lg"></i></div>
                <div><h3 className="text-base font-bold text-slate-900">Form Pengajuan PKM Dosen</h3><p className="text-sm text-slate-500 mt-0.5">Silakan lengkapi data usulan pengabdian</p></div>
            </div>
            {!hideMainTabNav && (
                <div className="flex border-b border-slate-100">
                    <button type="button" onClick={() => setMainTab('pengajuan')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'pengajuan' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Pengajuan</button>
                    <button type="button" onClick={() => setMainTab('arsip')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mainTab === 'arsip' ? 'text-poltekpar-primary border-b-2 border-poltekpar-primary' : 'text-slate-500 hover:text-slate-700'}`}>Arsip</button>
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
