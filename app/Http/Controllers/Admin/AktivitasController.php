<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\UndanganMail;
use App\Models\Aktivitas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AktivitasController extends Controller
{
    public function index(Request $request)
    {
        $sortField = $request->get('sort', 'created_at');
        $sortDir = $request->get('direction', 'desc');

        $listAktivitas = Aktivitas::with([
            'pengajuan.user',
            'pengajuan.jenisPkm',
        ])
            ->when($request->status, function ($query, $status) {
                $query->where('status_pelaksanaan', $status);
            })
            ->when($sortField === 'status_pelaksanaan', function ($query) use ($sortDir) {
                $query->orderByRaw("FIELD(status_pelaksanaan, 'belum_mulai', 'persiapan', 'berjalan', 'selesai') ".$sortDir);
            }, function ($query) use ($sortField, $sortDir) {
                $query->orderBy($sortField, $sortDir);
            })
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Aktivitas/Index', [
            'listAktivitas' => $listAktivitas,
            'filters' => [
                'sort' => $sortField,
                'direction' => $sortDir,
                'status' => $request->status,
            ],
        ]);
    }

    public function show(int $id)
    {
        $aktivitas = Aktivitas::with([
            'pengajuan.user',
            'pengajuan.jenisPkm',
            'pengajuan.timKegiatan.pegawai',
            'arsip',
        ])->findOrFail($id);

        return Inertia::render('Admin/Aktivitas/Detail', [
            'aktivitas' => $aktivitas,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'status_pelaksanaan' => 'required|in:belum_mulai,persiapan,berjalan,selesai',
            'catatan_pelaksanaan' => 'nullable|string|max:1000',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $aktivitas = Aktivitas::findOrFail($id);

        $aktivitas->status_pelaksanaan = $request->status_pelaksanaan;

        if ($request->filled('catatan_pelaksanaan')) {
            $aktivitas->catatan_pelaksanaan = $request->catatan_pelaksanaan;
        }

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('aktivitas/thumbnails', 'public');
            $aktivitas->url_thumbnail = '/storage/'.$path;
        }

        $aktivitas->save();

        // Save location data if included in the request
        if ($request->filled('save_location')) {
            $aktivitas->pengajuan()->update([
                'latitude' => $request->input('latitude'),
                'longitude' => $request->input('longitude'),
                'provinsi' => $request->input('provinsi'),
                'kota_kabupaten' => $request->input('kota_kabupaten'),
                'kecamatan' => $request->input('kecamatan'),
                'kelurahan_desa' => $request->input('kelurahan_desa'),
                'alamat_lengkap' => $request->input('alamat_lengkap'),
            ]);
        }

        if ($aktivitas->status_pelaksanaan === 'selesai') {
            $aktivitas->pengajuan()->update(['status_pengajuan' => 'selesai']);
        } else {
            $aktivitas->pengajuan()->update(['status_pengajuan' => 'diterima']);
        }

        return redirect()->back()->with('success', 'Aktivitas berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $aktivitas = Aktivitas::findOrFail($id);
        $aktivitas->delete();

        return redirect()->back()->with('success', 'Aktivitas berhasil dihapus.');
    }

    /**
     * Send invitation emails to selected aktivitas (belum_mulai only).
     * Rate limited to 100 emails per day.
     */
    public function sendUndangan(Request $request)
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:aktivitas,id_aktivitas',
            'subject' => 'required|string|max:255',
            'body' => 'required|string|max:5000',
        ]);

        // Daily rate limiting via cache
        $cacheKey = 'undangan_email_count_'.now()->toDateString();
        $sentToday = (int) Cache::get($cacheKey, 0);
        $dailyLimit = 300;

        $aktivitasList = Aktivitas::with(['pengajuan.user'])
            ->whereIn('id_aktivitas', $request->ids)
            ->where('status_pelaksanaan', 'belum_mulai')
            ->get();

        if ($aktivitasList->isEmpty()) {
            return back()->with('error', 'Tidak ada aktivitas berstatus "Belum Mulai" yang dipilih.');
        }

        $successCount = 0;
        $failedEmails = [];
        $skippedNoEmail = 0;

        foreach ($aktivitasList as $aktivitas) {
            // Check daily limit
            if (($sentToday + $successCount) >= $dailyLimit) {
                $failedEmails[] = 'Batas harian (100 email/hari) telah tercapai.';
                break;
            }

            $pengajuan = $aktivitas->pengajuan;
            if (! $pengajuan) {
                continue;
            }

            $recipientEmail = $pengajuan->email_pengusul ?? $pengajuan->user?->email;
            $recipientName = $pengajuan->nama_pengusul ?? $pengajuan->user?->name ?? 'Bapak/Ibu';
            $judulKegiatan = $pengajuan->judul_kegiatan ?? '-';
            $tglMulai = $pengajuan->tgl_mulai ? Carbon::parse($pengajuan->tgl_mulai)->locale('id')->isoFormat('D MMMM YYYY') : 'Akan ditentukan';
            $tglSelesai = $pengajuan->tgl_selesai ? Carbon::parse($pengajuan->tgl_selesai)->locale('id')->isoFormat('D MMMM YYYY') : 'Akan ditentukan';
            $lokasiParts = array_filter([$pengajuan->kota_kabupaten, $pengajuan->provinsi]);
            $lokasi = ! empty($lokasiParts) ? implode(', ', $lokasiParts) : 'Akan ditentukan';
            $jenisPkm = $pengajuan->jenisPkm?->nama_jenis ?? 'PKM';

            if (! $recipientEmail || ! filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                $skippedNoEmail++;

                continue;
            }

            try {
                Mail::to($recipientEmail)->send(
                    new UndanganMail($recipientName, $judulKegiatan, $request->subject, $request->body, $recipientEmail, $tglMulai, $tglSelesai, $lokasi, $jenisPkm)
                );
                $successCount++;
            } catch (\Throwable $e) {
                $failedEmails[] = "{$recipientEmail}: {$e->getMessage()}";
            }
        }

        // Update daily counter
        Cache::put($cacheKey, $sentToday + $successCount, now()->endOfDay());

        // Build response message
        $message = "Berhasil mengirim {$successCount} undangan.";
        if ($skippedNoEmail > 0) {
            $message .= " ({$skippedNoEmail} dilewati karena tidak ada email.)";
        }
        if (! empty($failedEmails)) {
            $message .= ' Gagal: '.implode('; ', array_slice($failedEmails, 0, 3));
        }

        $remaining = $dailyLimit - ($sentToday + $successCount);
        $message .= " (Sisa kuota hari ini: {$remaining} email)";

        return back()->with($successCount > 0 ? 'success' : 'error', $message);
    }

    /**
     * Export aktivitas data to CSV.
     */
    public function export(Request $request)
    {
        $query = Aktivitas::with(['pengajuan.user', 'pengajuan.jenisPkm', 'pengajuan.timKegiatan.pegawai', 'arsip'])
            ->when($request->search, function ($query, $search) {
                $escaped = addcslashes($search, '\\%_');
                $query->whereHas('pengajuan', fn ($q) => $q->where('judul_kegiatan', 'like', "%{$escaped}%"));
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status_pelaksanaan', $status);
            })
            ->latest();

        $filename = 'aktivitas_'.now()->format('Y-m-d_His').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF)); // UTF-8 BOM

            fputcsv($file, [
                'No',
                'Nama Kegiatan',
                'Pengusul',
                'Jenis PKM',
                'Lokasi',
                'Tanggal Mulai',
                'Tanggal Selesai',
                'Status Pelaksanaan',
                'Tim Kegiatan',
                'Catatan',
            ]);

            $no = 1;
            $query->chunk(100, function ($items) use ($file, &$no) {
                foreach ($items as $a) {
                    $p = $a->pengajuan;

                    $namaTim = $p ? $p->timKegiatan->map(function ($anggota) {
                        $nama = $anggota->pegawai?->nama_pegawai ?? $anggota->nama_mahasiswa ?? '-';
                        $peran = $anggota->peran_tim ?? '';

                        return $peran ? "{$nama} ({$peran})" : $nama;
                    })->implode('; ') : '-';

                    $lokasi = $p ? collect([
                        $p->kelurahan_desa,
                        $p->kecamatan,
                        $p->kota_kabupaten,
                        $p->provinsi,
                    ])->filter()->implode(', ') : '-';

                    fputcsv($file, [
                        $no++,
                        $p?->judul_kegiatan ?? '-',
                        $p?->user?->name ?? $p?->nama_pengusul ?? '-',
                        $p?->jenisPkm?->nama_jenis ?? '-',
                        $lokasi ?: '-',
                        optional($p?->tgl_mulai)->format('d M Y') ?? '-',
                        optional($p?->tgl_selesai)->format('d M Y') ?? '-',
                        ucfirst(str_replace('_', ' ', $a->status_pelaksanaan)),
                        $namaTim ?: '-',
                        $a->catatan_pelaksanaan ?? '-',
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
