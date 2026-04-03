<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

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
            'nip' => ['nullable', 'regex:/^\d{18}$/', 'unique:pegawai,nip'],
            'nama_pegawai' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'posisi' => 'nullable|string|max:255',
        ], [
            'nip.regex' => 'NIP harus terdiri dari 18 digit angka.',
        ]);

        Pegawai::create($request->only('id_user', 'nip', 'nama_pegawai', 'jabatan', 'posisi'));

        return redirect()->back()->with('success', 'Pegawai berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'id_user' => 'nullable|exists:users,id_user',
            'nip' => ['nullable', 'regex:/^\d{18}$/', Rule::unique('pegawai', 'nip')->ignore($id, 'id_pegawai')],
            'nama_pegawai' => 'required|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'posisi' => 'nullable|string|max:255',
        ], [
            'nip.regex' => 'NIP harus terdiri dari 18 digit angka.',
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
            'file' => 'required|file|mimes:csv,txt,xlsx,xls|max:8192',
        ], [
            'file.mimes' => 'Format file harus .csv atau .xlsx (Excel).',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $extension = strtolower($file->getClientOriginalExtension());
        $data = [];

        if (in_array($extension, ['xlsx', 'xls'])) {
            // Parse Excel dengan PhpSpreadsheet
            try {
                $spreadsheet = IOFactory::load($path);
                $sheet = $spreadsheet->getActiveSheet();
                $data = $sheet->toArray(null, true, true);
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['file' => 'Gagal membaca file Excel: '.$e->getMessage()]);
            }
        } else {
            // Parse CSV
            $firstLine = fgets(fopen($path, 'r'));
            $delimiter = (str_contains($firstLine, ';') && ! str_contains($firstLine, ',')) ? ';' : ',';
            $handle = fopen($path, 'r');
            while (($row = fgetcsv($handle, 1000, $delimiter)) !== false) {
                $data[] = $row;
            }
            fclose($handle);
        }

        if (empty($data) || count($data) < 2) {
            return redirect()->back()->withErrors(['file' => 'File kosong atau tidak memiliki baris data.']);
        }

        // Mapping header (case-insensitive, support: NO, NAMA, NIP, JABATAN, POSISI)
        $firstRow = array_values($data[0] ?? []);
        if (empty($firstRow)) {
            return redirect()->back()->withErrors(['file' => 'File tidak memiliki header.']);
        }
        $headers = array_map(fn ($h) => strtoupper(trim($h ?? '')), $firstRow);

        $colMap = [];
        foreach ($headers as $idx => $h) {
            $clean = preg_replace('/[^A-Z]/', '', $h);
            if ($clean === 'NAMA' || $clean === 'NAMAPEGAWAI' || $clean === 'NAMAPEOPLE') {
                $colMap['nama'] = $idx;
            } elseif ($clean === 'NIP') {
                $colMap['nip'] = $idx;
            } elseif ($clean === 'JABATAN') {
                $colMap['jabatan'] = $idx;
            } elseif ($clean === 'POSISI') {
                $colMap['posisi'] = $idx;
            }
        }

        // Fallback positional
        if (! isset($colMap['nama'])) {
            $colMap['nama'] = 1;
        }
        if (! isset($colMap['nip'])) {
            $colMap['nip'] = 2;
        }
        if (! isset($colMap['jabatan'])) {
            $colMap['jabatan'] = 3;
        }
        if (! isset($colMap['posisi'])) {
            $colMap['posisi'] = 4;
        }

        $count = 0;
        DB::beginTransaction();
        try {
            foreach ($data as $i => $row) {
                if ($i === 0) {
                    continue;
                } // skip header

                // Normalize row to array
                $rowArr = is_array($row) ? array_values($row) : [];
                $nama = trim($rowArr[$colMap['nama'] - 1] ?? '');

                if (empty($nama) || strtoupper($nama) === 'NAMA' || strtoupper($nama) === 'NAMA_PEGAWAI') {
                    continue;
                }

                Pegawai::create([
                    'nama_pegawai' => $nama,
                    'nip' => trim($rowArr[$colMap['nip'] - 1] ?? ''),
                    'jabatan' => trim($rowArr[$colMap['jabatan'] - 1] ?? ''),
                    'posisi' => trim($rowArr[$colMap['posisi'] - 1] ?? ''),
                ]);
                $count++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['file' => 'Gagal memproses data: '.$e->getMessage()]);
        }

        return redirect()->back()->with('success', "Berhasil mengimpor {$count} data pegawai.");
    }
}
