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
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Skip header
        fgetcsv($handle);

        $count = 0;
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if (count($data) >= 1) {
                Pegawai::create([
                    'nama_pegawai' => $data[0],
                    'nip'          => $data[1] ?? null,
                    'jabatan'      => $data[2] ?? null,
                    'posisi'       => $data[3] ?? null,
                ]);
                $count++;
            }
        }

        fclose($handle);

        return redirect()->back()->with('success', "Berhasil mengimpor {$count} data pegawai.");
    }
}
