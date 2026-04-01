<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use App\Models\JenisPkm;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PengajuanController extends Controller
{
    public function index(Request $request)
    {
        $listPengajuan = Pengajuan::with(['user', 'jenisPkm'])
            ->when($request->search, function ($query, $search) {
                $escaped = addcslashes($search, '\\%_');
                $query->where(function ($q) use ($escaped) {
                    $q->where('judul_kegiatan', 'like', "%{$escaped}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$escaped}%"));
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status_pengajuan', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Pengajuan/Index', [
            'listPengajuan' => $listPengajuan,
            'filters' => [
                'search' => $request->search ?? '',
                'status' => $request->status ?? '',
            ],
        ]);
    }

    public function show(int $id)
    {
        $pengajuan = Pengajuan::with([
            'user',
            'jenisPkm',
            'timKegiatan.pegawai',
            'aktivitas',
            'arsip',
        ])->findOrFail($id);

        $listPegawai = Pegawai::orderBy('nama_pegawai')
            ->get(['id_pegawai', 'nama_pegawai', 'nip']);

        $listJenisPkm = JenisPkm::orderBy('nama_jenis')->get();

        return Inertia::render('Admin/Pengajuan/Detail', [
            'pengajuan' => $pengajuan,
            'listPegawai' => $listPegawai,
            'listJenisPkm' => $listJenisPkm,
        ]);
    }

    /**
     * Full update of a submission (admin migration/edit purposes)
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'judul_kegiatan' => 'required|string|max:255',
            'id_jenis_pkm' => 'nullable|exists:jenis_pkm,id_jenis_pkm',
            'no_telepon' => 'nullable|string|max:25',
            'instansi_mitra' => 'nullable|string|max:255',
            'kebutuhan' => 'nullable|string',
            'sumber_dana' => 'nullable|string|max:255',
            'total_anggaran' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'provinsi' => 'nullable|string|max:100',
            'kota_kabupaten' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kelurahan_desa' => 'nullable|string|max:100',
            'alamat_lengkap' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status_pengajuan' => 'nullable|in:diproses,direvisi,diterima,ditolak',
            'catatan_admin' => 'nullable|string|max:1000',
            'proposal' => 'nullable|string|max:2048',
            'surat_permohonan' => 'nullable|string|max:2048',
            'rab' => 'nullable|string|max:2048',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);
        $pengajuan->update($request->only([
            'judul_kegiatan', 'id_jenis_pkm', 'no_telepon', 'instansi_mitra',
            'kebutuhan', 'sumber_dana', 'total_anggaran', 'tgl_mulai', 'tgl_selesai',
            'provinsi', 'kota_kabupaten', 'kecamatan', 'kelurahan_desa', 'alamat_lengkap',
            'latitude', 'longitude', 'status_pengajuan', 'catatan_admin',
            'proposal', 'surat_permohonan', 'rab',
        ]));

        return redirect()->back()->with('success', 'Pengajuan berhasil diperbarui.');
    }

    /**
     * Soft-delete a submission
     */
    public function destroy(int $id)
    {
        $pengajuan = Pengajuan::findOrFail($id);

        // Cascading soft deletes to related tables
        Aktivitas::where('id_pengajuan', $id)->get()->each->delete();
        TimKegiatan::where('id_pengajuan', $id)->get()->each->delete();

        $pengajuan->delete();

        return redirect()->back()->with('success', 'Pengajuan berhasil dihapus.');
    }

    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status_pengajuan' => 'required|in:diproses,direvisi,diterima,ditolak',
            'catatan_admin' => 'nullable|string|max:1000',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);
        $statusLama = $pengajuan->status_pengajuan;
        $statusBaru = $request->status_pengajuan;

        $pengajuan->status_pengajuan = $statusBaru;
        $pengajuan->catatan_admin = $request->catatan_admin;
        $pengajuan->save();

        if ($statusBaru === 'diterima' && $statusLama !== 'diterima') {
            $aktivitasSudahAda = Aktivitas::where('id_pengajuan', $id)->exists();
            if (! $aktivitasSudahAda) {
                Aktivitas::create([
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'status_pelaksanaan' => 'belum_mulai',
                ]);
            }
        }

        return redirect()->back()->with('success', 'Status pengajuan berhasil diperbarui.');
    }

    public function storeTim(Request $request, int $id)
    {
        $request->validate([
            'id_pegawai' => 'nullable|exists:pegawai,id_pegawai',
            'nama_mahasiswa' => 'nullable|string|max:255',
            'peran_tim' => 'required|string|max:100',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        TimKegiatan::create([
            'id_pengajuan' => $pengajuan->id_pengajuan,
            'id_pegawai' => $request->id_pegawai,
            'nama_mahasiswa' => $request->nama_mahasiswa,
            'peran_tim' => $request->peran_tim,
        ]);

        return redirect()->back()->with('success', 'Anggota tim berhasil ditambahkan.');
    }

    public function destroyTim(int $pengajuanId, int $timId)
    {
        $tim = TimKegiatan::where('id_pengajuan', $pengajuanId)
            ->where('id_tim', $timId)
            ->firstOrFail();

        $tim->delete();

        return redirect()->back()->with('success', 'Anggota tim berhasil dihapus.');
    }

    public function updateLokasi(Request $request, int $id)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);
        $pengajuan->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return redirect()->back()->with('success', 'Koordinat lokasi berhasil diperbarui.');
    }

    /**
     * Export to CSV with extended columns:
     * nama_kegiatan | pengusul | jenis_pkm | instansi | tahun | sumber_dana | total_dana | nama_tim | status | lokasi | arsip
     */
    public function export(Request $request)
    {
        $query = Pengajuan::with(['user', 'jenisPkm', 'timKegiatan.pegawai', 'arsip'])
            ->when($request->search, function ($query, $search) {
                $escaped = addcslashes($search, '\\%_');
                $query->where(function ($q) use ($escaped) {
                    $q->where('judul_kegiatan', 'like', "%{$escaped}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$escaped}%"));
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status_pengajuan', $status);
            })
            ->latest();

        $filename = 'pengajuan_'.now()->format('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($file, [
                'Nama Kegiatan',
                'Pengusul',
                'Jenis PKM',
                'Instansi/Mitra',
                'Tahun',
                'Sumber Dana',
                'Total Dana (Rp)',
                'Nama Tim',
                'Status',
                'Lokasi',
                'Arsip',
            ]);

            $query->chunk(100, function ($items) use ($file) {
                foreach ($items as $p) {
                    // Build team names string
                    $namaTim = $p->timKegiatan->map(function ($anggota) {
                        $nama = $anggota->pegawai?->nama_pegawai ?? $anggota->nama_mahasiswa ?? '-';
                        $peran = $anggota->peran_tim ?? '';

                        return $peran ? "{$nama} ({$peran})" : $nama;
                    })->implode('; ');

                    // Build arsip/document links
                    $arsipList = $p->arsip->map(function ($doc) {
                        return "{$doc->nama_dokumen}: {$doc->url_dokumen}";
                    })->implode(' | ');

                    // Build location string
                    $lokasi = collect([
                        $p->kelurahan_desa,
                        $p->kecamatan,
                        $p->kota_kabupaten,
                        $p->provinsi,
                    ])->filter()->implode(', ') ?: '-';

                    fputcsv($file, [
                        $p->judul_kegiatan,
                        $p->user?->name ?? '-',
                        $p->jenisPkm?->nama_jenis ?? '-',
                        $p->instansi_mitra ?? '-',
                        $p->tgl_mulai?->year ?? $p->created_at?->year ?? '-',
                        $p->sumber_dana ?? '-',
                        number_format((float) $p->total_anggaran, 0, ',', '.'),
                        $namaTim ?: '-',
                        ucfirst($p->status_pengajuan),
                        $lokasi,
                        $arsipList ?: '-',
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
