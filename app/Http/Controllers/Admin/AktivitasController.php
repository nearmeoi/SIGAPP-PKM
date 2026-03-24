<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
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
            'pengajuan.timKegiatan.pegawai'
        ])->findOrFail($id);

        return Inertia::render('Admin/Aktivitas/Detail', [
            'aktivitas' => $aktivitas,
        ]);
    }
}
