<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AktivitasController extends Controller
{
    public function index()
    {
        $listAktivitas = Aktivitas::with([
            'pengajuan.user',
            'pengajuan.jenisPkm',
        ])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Aktivitas/Index', [
            'listAktivitas' => $listAktivitas,
        ]);
    }

    public function show(int $id)
    {
        $aktivitas = Aktivitas::with([
            'pengajuan.user',
            'pengajuan.jenisPkm',
            'pengajuan.timKegiatan.pegawai',
        ])->findOrFail($id);

        return Inertia::render('Admin/Aktivitas/Detail', [
            'aktivitas' => $aktivitas,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'status_pelaksanaan' => 'required|in:belum_mulai,persiapan,berjalan,selesai',
            'catatan_pelaksanaan' => 'nullable|string|max:1000',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $aktivitas = Aktivitas::findOrFail($id);

        $aktivitas->status_pelaksanaan = $request->status_pelaksanaan;

        if ($request->filled('catatan_pelaksanaan')) {
            $aktivitas->catatan_pelaksanaan = $request->catatan_pelaksanaan;
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('aktivitas/thumbnails', 'public');
            $aktivitas->url_thumbnail = '/storage/'.$path;
        }

        $aktivitas->save();

        if ($aktivitas->status_pelaksanaan === 'selesai') {
            $aktivitas->pengajuan()->update(['status_pengajuan' => 'selesai']);
        }

        return redirect()->back()->with('success', 'Aktivitas berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $aktivitas = Aktivitas::findOrFail($id);
        $aktivitas->delete();

        return redirect()->back()->with('success', 'Aktivitas berhasil dihapus.');
    }
}
