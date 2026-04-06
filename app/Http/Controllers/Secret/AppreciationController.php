<?php

namespace App\Http\Controllers\Secret;

use App\Http\Controllers\Controller;
use App\Models\DeveloperAppreciation;
use App\Models\DeveloperDocumentation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppreciationController extends Controller
{
    public function index()
    {
        $developers = DeveloperAppreciation::orderBy('urutan')->get();
        $docs = DeveloperDocumentation::orderBy('urutan')->get();

        return Inertia::render('Secret/Appreciation/Index', [
            'developers' => $developers,
            'docs' => $docs,
        ]);
    }

    public function storeDev(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'peran' => 'nullable|string|max:255',
            'asal_instansi' => 'nullable|string|max:255',
            'foto' => 'nullable|string',
            'urutan' => 'required|integer',
        ]);

        DeveloperAppreciation::create($request->all());
        return redirect()->back()->with('success', 'Data developer berhasil ditambahkan.');
    }

    public function updateDev(Request $request, $id)
    {
        $dev = DeveloperAppreciation::findOrFail($id);
        $dev->update($request->all());
        return redirect()->back()->with('success', 'Data developer berhasil diupdate.');
    }

    public function destroyDev($id)
    {
        $dev = DeveloperAppreciation::findOrFail($id);
        $dev->delete();
        return redirect()->back()->with('success', 'Data dihapus.');
    }

    public function storeDoc(Request $request)
    {
        $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'foto' => 'required|string',
            'urutan' => 'required|integer',
        ]);

        DeveloperDocumentation::create($request->all());
        return redirect()->back()->with('success', 'Dokumentasi ditambahkan.');
    }

    public function updateDoc(Request $request, $id)
    {
        $doc = DeveloperDocumentation::findOrFail($id);
        $doc->update($request->all());
        return redirect()->back()->with('success', 'Dokumentasi diupdate.');
    }

    public function destroyDoc($id)
    {
        $doc = DeveloperDocumentation::findOrFail($id);
        $doc->delete();
        return redirect()->back()->with('success', 'Dokumentasi dihapus.');
    }
}
