<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisPkm;
use App\Models\LokasiPkm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    // === JENIS PKM ===
    public function indexJenis()
    {
        $listJenisPkm = JenisPkm::all();

        return Inertia::render('Admin/MasterData/JenisPkm', [
            'listJenisPkm' => $listJenisPkm,
        ]);
    }

    public function storeJenis(Request $request)
    {
        $request->validate([
            'nama_jenis' => 'required|string|max:255',
            'warna_icon' => 'nullable|string|max:50',
        ]);

        JenisPkm::create($request->only('nama_jenis', 'warna_icon'));

        return redirect()->back()->with('success', 'Jenis PKM berhasil ditambahkan.');
    }

    public function updateJenis(Request $request, int $id)
    {
        $request->validate([
            'nama_jenis' => 'required|string|max:255',
            'warna_icon' => 'nullable|string|max:50',
        ]);

        $jenis = JenisPkm::findOrFail($id);
        $jenis->update($request->only('nama_jenis', 'warna_icon'));

        return redirect()->back()->with('success', 'Jenis PKM berhasil diperbarui.');
    }

    public function destroyJenis(int $id)
    {
        JenisPkm::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Jenis PKM berhasil dihapus.');
    }
}
