<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PegawaiController extends Controller
{
    public function index()
    {
        $listPegawai = Pegawai::with('user')->get();

        return Inertia::render('Admin/Pegawai/Index', [
            'listPegawai' => $listPegawai,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_user' => 'nullable|exists:users,id_user',
            'nip' => 'nullable|string|max:50',
            'nama_pegawai' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'posisi' => 'nullable|string|max:255',
        ]);

        Pegawai::create($request->only('id_user', 'nip', 'nama_pegawai', 'jabatan', 'posisi'));

        return redirect()->back()->with('success', 'Pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'id_user' => 'nullable|exists:users,id_user',
            'nip' => 'nullable|string|max:50',
            'nama_pegawai' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'posisi' => 'nullable|string|max:255',
        ]);

        $pegawai = Pegawai::findOrFail($id);
        $pegawai->update($request->only('id_user', 'nip', 'nama_pegawai', 'jabatan', 'posisi'));

        return redirect()->back()->with('success', 'Pegawai berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        Pegawai::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Pegawai berhasil dihapus.');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xls,xlsx|max:2048',
        ]);

        // TODO: Implement CSV/Excel import logic using a package like maatwebsite/excel
        return redirect()->back()->with('error', 'Fitur import CSV belum tersedia. Silakan tambahkan pegawai secara manual.');
    }
}
