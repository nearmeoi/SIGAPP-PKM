<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisPkm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    // === JENIS PKM ===
    public function indexJenis(Request $request)
    {
        $sortField = $request->get('sort', 'nama_jenis');
        $sortDir = $request->get('direction', 'asc');

        $listJenisPkm = JenisPkm::orderBy($sortField, $sortDir)->get();

        return Inertia::render('Admin/MasterData/JenisPkm', [
            'listJenisPkm' => $listJenisPkm,
            'filters' => [
                'sort' => $sortField,
                'direction' => $sortDir,
            ],
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
        $jenis = JenisPkm::findOrFail($id);
        $pengajuanCount = $jenis->pengajuan()->count();

        if ($pengajuanCount > 0) {
            return redirect()->back()->with('error', "Tidak dapat menghapus jenis PKM '{$jenis->nama_jenis}' karena masih digunakan oleh {$pengajuanCount} pengajuan.");
        }

        $jenis->delete();

        return redirect()->back()->with('success', 'Jenis PKM berhasil dihapus.');
    }
}
