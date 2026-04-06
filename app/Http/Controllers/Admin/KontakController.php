<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kontak;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KontakController extends Controller
{
    public function index()
    {
        $kontaks = Kontak::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/Kontak/Index', [
            'kontaks' => $kontaks
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'platform' => 'required|string|max:255',
            'nilai_kontak' => 'required|string|max:1000',
            'label' => 'nullable|string|max:255',
            'ikon' => 'nullable|string|max:255',
        ]);

        Kontak::create($request->all());

        return redirect()->back()->with('success', 'Data kontak berhasil ditambahkan.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'platform' => 'required|string|max:255',
            'nilai_kontak' => 'required|string|max:1000',
            'label' => 'nullable|string|max:255',
            'ikon' => 'nullable|string|max:255',
        ]);

        $kontak = Kontak::findOrFail($id);
        $kontak->update($request->all());

        return redirect()->back()->with('success', 'Data kontak berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $kontak = Kontak::findOrFail($id);
        $kontak->delete();

        return redirect()->back()->with('success', 'Data kontak berhasil dihapus.');
    }
}
