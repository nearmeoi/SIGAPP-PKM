<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimoni;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimoniController extends Controller
{
    public function index(Request $request)
    {
        $listTestimoni = Testimoni::with(['aktivitas.pengajuan.user'])
            ->when($request->search, function ($query, $search) {
                $escaped = addcslashes($search, '\\%_');
                $query->where(function ($q) use ($escaped) {
                    $q->where('nama_pemberi', 'like', "%{$escaped}%")
                        ->orWhere('pesan_ulasan', 'like', "%{$escaped}%")
                        ->orWhereHas('aktivitas.pengajuan', fn ($p) => $p->where('judul_kegiatan', 'like', "%{$escaped}%"));
                });
            })
            ->when($request->rating, function ($query, $rating) {
                $query->where('rating', $rating);
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Admin/Testimoni/Index', [
            'listTestimoni' => $listTestimoni,
            'filters' => [
                'search' => $request->search ?? '',
                'rating' => $request->rating ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_aktivitas' => 'required|exists:aktivitas,id_aktivitas',
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
        ]);

        Testimoni::create($request->only('id_aktivitas', 'nama_pemberi', 'rating', 'pesan_ulasan'));

        return redirect()->back()->with('success', 'Testimoni berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $testimoni = Testimoni::findOrFail($id);

        $request->validate([
            'nama_pemberi' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'pesan_ulasan' => 'nullable|string|max:2000',
        ]);

        $testimoni->update($request->only('nama_pemberi', 'rating', 'pesan_ulasan'));

        return redirect()->back()->with('success', 'Testimoni berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $testimoni = Testimoni::findOrFail($id);
        $testimoni->delete();

        return redirect()->back()->with('success', 'Testimoni berhasil dihapus.');
    }
}
