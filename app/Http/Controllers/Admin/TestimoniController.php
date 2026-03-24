<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimoni;
use Inertia\Inertia;

class TestimoniController extends Controller
{
    public function index()
    {
        $listTestimoni = Testimoni::with(['aktivitas.pengajuan.user'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Testimoni/Index', [
            'listTestimoni' => $listTestimoni,
        ]);
    }
}
