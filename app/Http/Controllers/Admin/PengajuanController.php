<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use App\Models\Aktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengajuanController extends Controller
{
    public function index()
    {
        $listPengajuan = Pengajuan::with(['user', 'jenisPkm'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Pengajuan/Index', [
            'listPengajuan' => $listPengajuan,
        ]);
    }

    public function show(int $id)
    {
        $pengajuan = Pengajuan::with([
            'user',
            'jenisPkm',
            'timKegiatan.pegawai',
            'aktivitas',
            'arsip',
        ])->findOrFail($id);

        $listPegawai = \App\Models\Pegawai::orderBy('nama_pegawai')
            ->get(['id_pegawai', 'nama_pegawai', 'nip']);

        return Inertia::render('Admin/Pengajuan/Detail', [
            'pengajuan' => $pengajuan,
            'listPegawai' => $listPegawai,
        ]);
    }

    /**
     * Ubah status pengajuan. Jika status menjadi 'diterima',
     * otomatis buat record aktivitas baru dengan status 'berjalan'.
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status_pengajuan' => 'required|in:diproses,direvisi,diterima,ditolak,selesai',
            'catatan_admin' => 'nullable|string|max:1000',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);
        $statusLama = $pengajuan->status_pengajuan;
        $statusBaru = $request->status_pengajuan;

        $pengajuan->status_pengajuan = $statusBaru;
        $pengajuan->catatan_admin = $request->catatan_admin;
        $pengajuan->save();

        // ✅ AUTO-TRIGGER: buat aktivitas otomatis saat status berubah ke 'diterima'
        if ($statusBaru === 'diterima' && $statusLama !== 'diterima') {
            // Cek agar tidak membuat duplikat
            $aktivitasSudahAda = Aktivitas::where('id_pengajuan', $id)->exists();
            if (!$aktivitasSudahAda) {
                Aktivitas::create([
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'status_pelaksanaan' => 'berjalan',
                ]);
            }
        }

        return redirect()->back()->with('success', 'Status pengajuan berhasil diperbarui.');
    }

    /**
     * Tambah anggota Tim PKM ke pengajuan
     */
    public function storeTim(Request $request, int $id)
    {
        $request->validate([
            'id_pegawai' => 'nullable|exists:pegawai,id_pegawai',
            'nama_mahasiswa' => 'nullable|string|max:255',
            'peran_tim' => 'required|string|max:100',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        \App\Models\TimKegiatan::create([
            'id_pengajuan' => $pengajuan->id_pengajuan,
            'id_pegawai' => $request->id_pegawai,
            'nama_mahasiswa' => $request->nama_mahasiswa,
            'peran_tim' => $request->peran_tim,
        ]);

        return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan.');
    }

    /**
     * Hapus anggota Tim PKM
     */
    public function destroyTim(int $pengajuanId, int $timId)
    {
        $tim = \App\Models\TimKegiatan::where('id_pengajuan', $pengajuanId)
            ->where('id_tim', $timId)
            ->firstOrFail();

        $tim->delete();

        return redirect()->back()->with('success', 'Anggota tim berhasil dihapus.');
    }

    /**
     * Update pengaturan aktivitas (thumbnail & status pelaksanaan)
     */
    public function updateAktivitas(Request $request, int $id)
    {
        $request->validate([
            'status_pelaksanaan' => 'required|in:persiapan,berjalan,selesai',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        // Get or create the aktivitas record for this pengajuan
        $aktivitas = Aktivitas::firstOrCreate(
            ['id_pengajuan' => $pengajuan->id_pengajuan],
            ['status_pelaksanaan' => $request->status_pelaksanaan]
        );

        $aktivitas->status_pelaksanaan = $request->status_pelaksanaan;

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('aktivitas/thumbnails', 'public');
            $aktivitas->url_thumbnail = '/storage/' . $path;
        }

        $aktivitas->save();

        return redirect()->back()->with('success', 'Pengaturan aktivitas berhasil disimpan.');
    }
}
