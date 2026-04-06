import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import AdminLayout from '../../Layouts/AdminLayout';
import { Upload, Download, AlertCircle, FileSpreadsheet, Eye, CheckSquare, Square, Save, Loader2, ArrowLeft } from 'lucide-react';
import Toast from '../../Components/Toast';

export default function ImportHistory() {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [toastInfo, setToastInfo] = useState<{show: boolean, type: 'success'|'error', msg: string}>({show: false, type: 'success', msg: ''});

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('file_xlsx', file);

        try {
            const response = await axios.post('/admin/import-history/preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const rows = response.data.data;
            setPreviewData(rows);
            // Default select all
            setSelectedRows(rows.map((r: any) => r.id));
            setPreviewMode(true);
            setToastInfo({show: true, type: 'success', msg: `Berhasil merangkum ${rows.length} data.`});
        } catch (error: any) {
            setToastInfo({show: true, type: 'error', msg: error.response?.data?.error || 'Gagal membaca file.'});
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImportSelected = () => {
        if (selectedRows.length === 0) {
            setToastInfo({show: true, type: 'error', msg: 'Pilih minimal satu baris untuk diunggah.'});
            return;
        }

        setIsProcessing(true);
        const rowsToSubmit = previewData.filter(r => selectedRows.includes(r.id));
        
        router.post('/admin/import-history', { rows: rowsToSubmit }, {
            onSuccess: () => {
                setPreviewMode(false);
                setFile(null);
                setPreviewData([]);
                setToastInfo({show: true, type: 'success', msg: `Import ${selectedRows.length} data historis telah selesai!`});
            },
            onError: (err) => {
                setToastInfo({show: true, type: 'error', msg: 'Terjadi kesalahan sistem, cek konsol'});
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    const toggleRow = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedRows.length === previewData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(previewData.map(r => r.id));
        }
    };

    const downloadTemplate = () => {
        const data = [
            {
                "Tahun": "2023", 
                "Judul PKM": "Pemberdayaan Desa Wisata", 
                "Jenis PKM / Skema Masy": "Pendampingan DeWis", 
                "Kebutuhan Daerah": "Pengolahan Sampah", 
                "Pengusul": "Dosen",
                "Ketua TIM": "Budi Santoso", 
                "Dosen Terlibat": "Andi,Siti", 
                "Staff Terlibat": "Joko", 
                "Mahasiswa Terlibat": "Rani,Tono",
                "Desa": "Mekarwangi", 
                "Kecamatan": "Lembang", 
                "Kabupaten/Kota": "Bandung Barat", 
                "Provinsi": "Jawa Barat",
                "Link RAB": "https://drive.google.com/...", 
                "Total Anggaran": "5000000", 
                "Sumber Dana": "Mandiri",
                "Link Testimoni": "https://drive.google.com/...", 
                "Link Surat Permohonan": "https://...", 
                "Link Laporan Akhir PKM": "https://...", 
                "Link Foto Dokumentasi": "https://..."
            }
        ];

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Optional: auto-adjust column widths
        const colWidths = Object.keys(data[0]).map(() => ({ wch: 25 }));
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        
        XLSX.writeFile(workbook, "Template_Import_Historis.xlsx");
    };

    return (
        <AdminLayout title="Import Data Historis">
            <Toast show={toastInfo.show} type={toastInfo.type} title={toastInfo.type === 'success' ? 'Berhasil' : 'Gagal'} message={toastInfo.msg} onClose={() => setToastInfo({...toastInfo, show: false})} />

            {!previewMode ? (
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="bg-poltekpar-navy text-white rounded-2xl p-8 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-poltekpar-gold opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-poltekpar-primary opacity-20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                            <div className="max-w-2xl">
                                <h2 className="text-[24px] font-black tracking-tight mb-2">Impor Data PKM Historis (XLSX)</h2>
                                <p className="text-white/80 text-[14px] leading-relaxed">
                                    Unggah file Excel (XLSX/CSV). Sistem akan melakukan pratinjau data untuk dikonfirmasi ulang sebelum disimpan serentak ke arsip dan database Aktivitas/Pengajuan.
                                </p>
                            </div>
                            <button onClick={downloadTemplate} className="bg-poltekpar-gold hover:bg-yellow-400 text-poltekpar-navy font-bold text-[13px] px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                                <Download size={18} /> Unduh Format Template
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-4 text-[13px]">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
                                <h3 className="font-bold flex items-center gap-2 text-poltekpar-navy mb-3"><AlertCircle size={18}/> Panduan</h3>
                                <ul className="space-y-2 text-zinc-600">
                                    <li><b>Tahun PKM:</b> Diisi tahunnya saja (Misal 2023).</li>
                                    <li><b>Anggota Tim:</b> Pisahkan dengan koma jika jamak.</li>
                                    <li><b>Kolom Link:</b> Masukkan link Google Drive/Cloud valid.</li>
                                    <li><b>Total Anggaran:</b> Angka saja (Misal: 5000000).</li>
                                </ul>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200">
                                <form onSubmit={handlePreview} className="flex flex-col h-full items-center">
                                    <div 
                                        className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer relative
                                        ${dragActive ? 'border-poltekpar-primary bg-poltekpar-primary/5' : 'border-zinc-300 bg-zinc-50 hover:bg-zinc-100'}`}
                                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    >
                                        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-poltekpar-primary-light text-poltekpar-primary' : 'bg-white shadow-sm border border-zinc-200 text-zinc-400'}`}>
                                            {file ? <FileSpreadsheet size={28} /> : <Upload size={28} />}
                                        </div>
                                        {file ? (
                                            <div className="text-center"><p className="font-bold text-zinc-900">{file.name}</p><p className="text-sm text-green-600">Terpilih ({(file.size/1024).toFixed(1)} KB)</p></div>
                                        ) : (
                                            <div className="text-center"><p className="font-bold text-zinc-700">Pilih / Tarik File XLSX</p></div>
                                        )}
                                    </div>
                                    <div className="mt-6 w-full flex justify-end">
                                        <button type="submit" disabled={!file || isProcessing} className="bg-poltekpar-navy text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold text-[14px] shadow-md hover:bg-poltekpar-primary disabled:opacity-50">
                                            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                                            Preview Data Tersortir
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-[80vh]">
                    <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setPreviewMode(false)} className="text-zinc-400 hover:text-zinc-600">
                                <ArrowLeft size={20} />
                            </button>
                            <h3 className="font-bold text-zinc-900">Validasi Data Import ({selectedRows.length} / {previewData.length} Dipilih)</h3>
                        </div>
                        <button onClick={handleImportSelected} disabled={selectedRows.length===0 || isProcessing} className="bg-poltekpar-primary text-white px-4 py-2 flex items-center gap-2 rounded-lg font-bold text-sm hover:bg-poltekpar-navy disabled:opacity-50 transition-all">
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Simpan ke Database
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto bg-zinc-50/30 p-4">
                        <table className="w-full text-left bg-white border border-zinc-200 rounded-lg overflow-hidden">
                            <thead className="bg-poltekpar-navy text-white sticky top-0 shadow-sm z-10 text-[12px] uppercase">
                                <tr>
                                    <th className="py-3 px-4 font-bold text-center w-12 cursor-pointer" onClick={toggleAll}>
                                        {selectedRows.length === previewData.length ? <CheckSquare size={16}/> : <Square size={16}/>}
                                    </th>
                                    <th className="py-3 px-4 font-bold">Judul PKM</th>
                                    <th className="py-3 px-4 font-bold">Tahun</th>
                                    <th className="py-3 px-4 font-bold">Ketua</th>
                                    <th className="py-3 px-4 font-bold">Jenis / Pendanaan</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] divide-y divide-zinc-200">
                                {previewData.map(row => (
                                    <tr key={row.id} className={`hover:bg-zinc-50 cursor-pointer ${selectedRows.includes(row.id) ? 'bg-blue-50/30' : ''}`} onClick={() => toggleRow(row.id)}>
                                        <td className="py-3 px-4 text-center">
                                            {selectedRows.includes(row.id) ? <CheckSquare size={16} className="text-poltekpar-primary mx-auto" /> : <Square size={16} className="text-zinc-300 mx-auto" />}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-zinc-900 line-clamp-1">{row.judul || '-'}</div>
                                            <div className="text-[11px] text-zinc-500 mt-0.5">{row.desa}, {row.provinsi}</div>
                                        </td>
                                        <td className="py-3 px-4 font-medium text-zinc-700">{row.tahun || '-'}</td>
                                        <td className="py-3 px-4 text-zinc-800">{row.ketua || '-'}</td>
                                        <td className="py-3 px-4">
                                            <div className="text-zinc-800">{row.jenis || '-'}</div>
                                            <div className="text-[11px] text-green-600 font-bold mt-0.5">{row.anggaran > 0 ? `Rp ${row.anggaran.toLocaleString('id-ID')}` : '-'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
