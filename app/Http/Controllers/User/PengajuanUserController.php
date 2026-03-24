<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use App\Models\JenisPkm;
use App\Models\LokasiPkm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PengajuanUserController extends Controller
{
    /**
     * Dashboard user — tampilkan daftar pengajuan miliknya
     */
    public function dashboard()
    {
        $listPengajuan = Pengajuan::with(['jenisPkm', 'lokasiPkm'])
            ->where('id_user', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('User/Dashboard', [
            'listPengajuan' => $listPengajuan,
        ]);
    }

    /**
     * Tampilkan form buat pengajuan baru
     */
    public function create()
    {
        $listJenisPkm = JenisPkm::all();
        $listLokasiPkm = LokasiPkm::all();

        return Inertia::render('User/BuatPengajuan', [
            'listJenisPkm' => $listJenisPkm,
            'listLokasiPkm' => $listLokasiPkm,
        ]);
    }

    /**
     * Simpan pengajuan baru dari user
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_jenis_pkm' => 'required|exists:jenis_pkm,id_jenis_pkm',
            'id_lokasi_pkm' => 'required|exists:lokasi_pkm,id_lokasi_pkm',
            'judul_kegiatan' => 'required|string|max:255',
            'kebutuhan' => 'nullable|string',
            'instansi_mitra' => 'nullable|string|max:255',
            'sumber_dana' => 'nullable|string|max:255',
            'total_anggaran' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'proposal' => 'required|file|mimes:pdf|max:10240', // Max 10MB
            'surat_permohonan' => 'required|file|mimes:pdf|max:5120', // Max 5MB
            'rab' => 'nullable|file|mimes:pdf,xlsx,xls|max:5120',
        ]);

        Pengajuan::create([
            'id_user' => Auth::id(),
            'id_jenis_pkm' => $request->id_jenis_pkm,
            'id_lokasi_pkm' => $request->id_lokasi_pkm,
            'judul_kegiatan' => $request->judul_kegiatan,
            'kebutuhan' => $request->kebutuhan,
            'instansi_mitra' => $request->instansi_mitra,
            'sumber_dana' => $request->sumber_dana,
            'total_anggaran' => $request->total_anggaran ?? 0,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'proposal' => $request->file('proposal') ? $request->file('proposal')->store('pengajuan/proposal', 'public') : null,
            'surat_permohonan' => $request->file('surat_permohonan') ? $request->file('surat_permohonan')->store('pengajuan/surat', 'public') : null,
            'rab' => $request->file('rab') ? $request->file('rab')->store('pengajuan/rab', 'public') : null,
            'status_pengajuan' => 'diproses',
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Pengajuan PKM berhasil dikirim! Silakan tunggu konfirmasi dari admin.');
    }

    /**
     * Detail satu pengajuan milik user
     */
    public function show(int $id)
    {
        $pengajuan = Pengajuan::with([
            'jenisPkm',
            'lokasiPkm',
            'timKegiatan.pegawai',
            'aktivitas',
            'arsip',
        ])->where('id_user', Auth::id())
            ->findOrFail($id);

        return Inertia::render('User/DetailPengajuan', [
            'pengajuan' => $pengajuan,
        ]);
    }
}
