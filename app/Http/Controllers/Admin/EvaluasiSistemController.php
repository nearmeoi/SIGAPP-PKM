<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvaluasiSistem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluasiSistemController extends Controller
{
    public function index()
    {
        $evaluasi = EvaluasiSistem::orderBy('created_at', 'desc')->get();
        return Inertia::render('Admin/EvaluasiSistem/Index', [
            'evaluasi' => $evaluasi
        ]);
    }

    public function destroy($id)
    {
        $evaluasi = EvaluasiSistem::findOrFail($id);
        $evaluasi->delete();

        return redirect()->back()->with('success', 'Data evaluasi sistem berhasil dihapus.');
    }
}
