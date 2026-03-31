<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Arsip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArsipController extends Controller
{
    public function index(Request $request)
    {
        $listArsip = Arsip::with(['pengajuan.user'])
            ->when($request->search, function ($query, $search) {
                $query->where('nama_dokumen', 'like', "%{$search}%")
                    ->orWhereHas('pengajuan', function ($q) use ($search) {
                        $q->where('judul_kegiatan', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Arsip/Index', [
            'listArsip' => $listArsip,
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_pengajuan' => 'required|exists:pengajuan,id_pengajuan',
            'nama_dokumen' => 'required|string|max:255',
            'jenis_arsip' => 'required|in:Laporan,Sertifikat,laporan_akhir,daftar_hadir,foto_kegiatan,dokumen_lain',
            'url_dokumen' => 'required|url|max:2048',
            'keterangan' => 'nullable|string|max:500',
        ]);

        Arsip::create($request->only([
            'id_pengajuan',
            'nama_dokumen',
            'jenis_arsip',
            'url_dokumen',
            'keterangan',
        ]));

        return redirect()->back()->with('success', 'Arsip berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $arsip = Arsip::findOrFail($id);

        $request->validate([
            'nama_dokumen' => 'required|string|max:255',
            'jenis_arsip'  => 'required|in:Laporan,Sertifikat,laporan_akhir,daftar_hadir,foto_kegiatan,dokumen_lain',
            'url_dokumen'  => 'required|url|max:2048',
            'keterangan'   => 'nullable|string|max:500',
        ]);

        $arsip->update($request->only(['nama_dokumen', 'jenis_arsip', 'url_dokumen', 'keterangan']));

        return redirect()->back()->with('success', 'Arsip berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $arsip = Arsip::findOrFail($id);
        $arsip->delete();

        return redirect()->back()->with('success', 'Arsip berhasil dihapus.');
    }
}
