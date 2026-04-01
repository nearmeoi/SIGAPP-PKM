<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PegawaiController extends Controller
{
    public function index(Request $request)
    {
        $listPegawai = Pegawai::with('user')
            ->when($request->search, function ($query, $search) {
                $query->where('nama_pegawai', 'like', '%'.addcslashes($search, '\\%_').'%')
                    ->orWhere('nip', 'like', '%'.addcslashes($search, '\\%_').'%');
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Pegawai/Index', [
            'listPegawai' => $listPegawai,
            'filters' => ['search' => $request->search ?? ''],
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
            'file' => 'required|file|mimes:csv,txt,xlsx|max:4096',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (in_array($extension, ['xlsx', 'xls'])) {
            // Parse XLSX as tab-separated (simple fallback without library)
            $tmpFile = tempnam(sys_get_temp_dir(), 'xls');
            $file->moveAs(dirname($tmpFile), basename($tmpFile));
            $content = file_get_contents($tmpFile);

            // Try CSV fallback
            $lines = file($tmpFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (! $lines) {
                @unlink($tmpFile);

                return redirect()->back()->withErrors(['file' => 'Format file tidak didukung. Gunakan CSV dengan kolom: NO, NAMA, NIP, JABATAN, Posisi.']);
            }

            $data = [];
            foreach ($lines as $line) {
                $fields = str_getcsv($line, "\t");
                if (count($fields) < 2) {
                    $fields = str_getcsv($line, ',');
                }
                $data[] = $fields;
            }
            @unlink($tmpFile);
        } else {
            $data = [];
            $handle = fopen($file->getRealPath(), 'r');
            while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }

        if (empty($data) || count($data) < 2) {
            return redirect()->back()->withErrors(['file' => 'File kosong atau tidak ada data.']);
        }

        // Read headers and map columns
        $headers = array_map(fn ($h) => trim(strtoupper($h)), $data[0]);
        $colMap = [];
        foreach ($headers as $i => $h) {
            $key = preg_replace('/[^A-Z]/', '', $h);
            if (str_contains($key, 'NAMA')) {
                $colMap['nama'] = $i;
            } elseif (str_contains($key, 'NIP')) {
                $colMap['nip'] = $i;
            } elseif (str_contains($key, 'JABATAN')) {
                $colMap['jabatan'] = $i;
            } elseif (str_contains($key, 'POSISI')) {
                $colMap['posisi'] = $i;
            }
        }

        // If no header mapping found, fallback to positional
        if (empty($colMap)) {
            $colMap = ['nama' => 0, 'nip' => 1, 'jabatan' => 2, 'posisi' => 3];
        }

        $count = 0;
        for ($rowIdx = 1; $rowIdx < count($data); $rowIdx++) {
            $row = $data[$rowIdx];
            $nama = trim($row[$colMap['nama']] ?? '');
            if (empty($nama)) {
                continue;
            }

            Pegawai::create([
                'nama_pegawai' => $nama,
                'nip' => trim($row[$colMap['nip']] ?? ''),
                'jabatan' => trim($row[$colMap['jabatan']] ?? ''),
                'posisi' => trim($row[$colMap['posisi']] ?? ''),
            ]);
            $count++;
        }

        return redirect()->back()->with('success', "Berhasil mengimpor {$count} data pegawai.");
    }
}
