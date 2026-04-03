<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\JenisPkm;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PengajuanUserController extends Controller
{
    /**
     * Display the submission page for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user ? ($user->role ?? 'masyarakat') : 'masyarakat';

        // Ambil pengajuan milik user dari database
        $userSubmissions = $user
            ? Pengajuan::where('id_user', $user->id_user)
                ->with(['timKegiatan.pegawai', 'jenisPkm', 'user'])
                ->latest()
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id_pengajuan,
                    'judul' => $p->judul_kegiatan,
                    'ringkasan' => $p->kebutuhan ?: ($p->instansi_mitra ?: '-'),
                    'tanggal' => optional($p->created_at)->format('d M Y') ?? '-',
                    'status' => $p->status_pengajuan,
                    'catatan' => $p->catatan_admin,
                    'instansi_mitra' => $p->instansi_mitra,
                    'no_telepon' => $p->no_telepon,
                    'provinsi' => $p->provinsi,
                    'kota_kabupaten' => $p->kota_kabupaten,
                    'kecamatan' => $p->kecamatan,
                    'kelurahan_desa' => $p->kelurahan_desa,
                    'alamat_lengkap' => $p->alamat_lengkap,
                    'proposal' => $p->proposal,
                    'surat_permohonan' => $p->surat_permohonan,
                    'rab' => $p->rab,
                    'rab_items' => $p->rab_items ?? [],
                    'sumber_dana' => $p->sumber_dana,
                    'total_anggaran' => $p->total_anggaran,
                    'dana_perguruan_tinggi' => $p->dana_perguruan_tinggi,
                    'dana_pemerintah' => $p->dana_pemerintah,
                    'dana_lembaga_dalam' => $p->dana_lembaga_dalam,
                    'dana_lembaga_luar' => $p->dana_lembaga_luar,
                    'tgl_mulai' => optional($p->tgl_mulai)->format('Y-m-d'),
                    'tgl_selesai' => optional($p->tgl_selesai)->format('Y-m-d'),
                    'tipe_pengusul' => $this->resolveSubmitterType($p),
                    'jenis_pkm' => $p->jenisPkm ? $p->jenisPkm->nama_jenis : null,
                    'nama_pengusul' => $this->resolveSubmitterName($p),
                    'email_pengusul' => $this->resolveSubmitterEmail($p),
                    'kebutuhan' => $p->kebutuhan,
                    'tim_kegiatan' => $p->timKegiatan->map(fn($t) => [
                        'nama' => $t->pegawai ? $t->pegawai->nama_pegawai : $t->nama_mahasiswa,
                        'peran' => $t->peran_tim,
                    ]),
                ])
                ->values()
                ->toArray()
            : [];

        return Inertia::render('Auth/Pengajuan', [
            'role' => $role,
            'initialView' => $request->routeIs('pengajuan.status') ? 'status' : 'form',
            'userSubmissions' => $userSubmissions,
        ]);
    }

    /**
     * Store a newly created submission.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'masyarakat') {
            return $this->storeMasyarakat($request);
        }

        // Logic for Dosen
        $request->validate([
            'id_jenis_pkm' => 'nullable|exists:jenis_pkm,id_jenis_pkm',
            'judul_kegiatan' => 'required|string|max:255',
            'nama_dosen' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'instansi_mitra' => 'nullable|string|max:255',
            'no_telepon' => 'nullable|string|max:20',
            'provinsi' => 'required|string|max:100',
            'kota_kabupaten' => 'required|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kelurahan_desa' => 'nullable|string|max:100',
            'alamat_lengkap' => 'nullable|string|max:1000',
            'sumber_dana' => 'nullable|string|max:255',
            'total_anggaran' => 'nullable|numeric|min:0',
            'tgl_mulai' => 'nullable|date',
            'tgl_selesai' => 'nullable|date|after_or_equal:tgl_mulai',
            'surat_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'surat_permohonan' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'rab' => 'nullable|string|max:2048',
            'rab_items' => 'nullable|array',
            'rab_items.*.nama_item' => 'nullable|string|max:255',
            'rab_items.*.jumlah' => 'nullable|numeric|min:1',
            'rab_items.*.harga' => 'nullable|numeric|min:0',
            'dosen_terlibat' => 'nullable|array',
            'dosen_terlibat.*' => 'string|max:255',
            'staff_terlibat' => 'nullable|array',
            'staff_terlibat.*' => 'string|max:255',
            'mahasiswa_terlibat' => 'nullable|array',
            'mahasiswa_terlibat.*' => 'string|max:255',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $suratPermohonanUrl = null;
        $suratProposalUrl = null;

        if ($request->hasFile('surat_permohonan')) {
            $suratPermohonanUrl = '/storage/' . $request->file('surat_permohonan')->store('pengajuan/dokumen', 'public');
        }
        if ($request->hasFile('surat_proposal')) {
            $suratProposalUrl = '/storage/' . $request->file('surat_proposal')->store('pengajuan/dokumen', 'public');
        }

        $rabItems = $this->normalizeRabItems($request->input('rab_items', []));

        $pengajuan = Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $request->id_jenis_pkm ?? $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'tipe_pengusul' => 'dosen',
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'kecamatan' => $request->kecamatan ?? '',
            'kelurahan_desa' => $request->kelurahan_desa ?? '',
            'alamat_lengkap' => $request->alamat_lengkap ?? '',
            'judul_kegiatan' => $request->judul_kegiatan,
            'nama_pengusul' => $request->nama_dosen,
            'email_pengusul' => $request->email ?: $user->email,
            'kebutuhan' => $request->kebutuhan ?? '',
            'instansi_mitra' => $request->instansi_mitra ?? '',
            'no_telepon' => $request->no_telepon ?? '',
            'sumber_dana' => $request->sumber_dana ?? '',
            'total_anggaran' => $rabItems !== [] ? collect($rabItems)->sum('total') : ($request->total_anggaran ?? 0),
            'dana_perguruan_tinggi' => $request->dana_perguruan_tinggi,
            'dana_pemerintah' => $request->dana_pemerintah,
            'dana_lembaga_dalam' => $request->dana_lembaga_dalam,
            'dana_lembaga_luar' => $request->dana_lembaga_luar,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'proposal' => $suratProposalUrl ?? '',
            'surat_permohonan' => $suratPermohonanUrl ?? '',
            'rab' => $request->rab ?? '',
            'rab_items' => $rabItems,
            'status_pengajuan' => 'diproses',
        ]);

        // Cari data pegawai milik user (Dosen) yang sedang login
        $pegawai = Pegawai::where('id_user', $user->id_user)->first();

        // Dosen pengusul utama dimasukkan ke tim sebagai Ketua
        $teamMembers = [];
        if ($pegawai) {
            $teamMembers[] = [
                'id_pegawai' => $pegawai->id_pegawai,
                'nama_mahasiswa' => null,
                'peran_tim' => 'Ketua/Dosen Pengusul',
            ];
        } else {
            // Fallback jika data pegawai belum di-link ke user
            $teamMembers[] = [
                'id_pegawai' => null,
                'nama_mahasiswa' => trim($request->nama_dosen),
                'peran_tim' => 'Ketua/Dosen Pengusul',
            ];
        }

        $this->addTeamMembers($teamMembers, $request->dosen_terlibat, 'Dosen');
        $this->addTeamMembers($teamMembers, $request->staff_terlibat, 'Staff');
        $this->addTeamMembers($teamMembers, $request->mahasiswa_terlibat, 'Mahasiswa');

        if (count($teamMembers) > 0) {
            $now = now();
            $rows = array_map(fn($m) => array_merge($m, [
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'created_at' => $now,
                'updated_at' => $now,
            ]), $teamMembers);
            TimKegiatan::insert($rows);
        }

        return redirect()->back()
            ->with('success', 'Pengajuan PKM berhasil dikirim! Silakan tunggu konfirmasi dari admin.');
    }

    /**
     * Store a submission from Masyarakat.
     */
    private function storeMasyarakat(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'needs' => 'required|string',
            'email' => 'required|email|max:255',
            'whatsapp' => 'required|string|max:20',
            'provinsi' => 'required|string|max:100',
            'kota_kabupaten' => 'required|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kelurahan_desa' => 'nullable|string|max:100',
            'alamat_lengkap' => 'nullable|string|max:1000',
            'surat_permohonan' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
            'surat_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $suratPermohonanUrl = null;
        $suratProposalUrl = null;

        if ($request->hasFile('surat_permohonan')) {
            $suratPermohonanUrl = $request->file('surat_permohonan')->store('pengajuan/dokumen', 'public');
            $suratPermohonanUrl = '/storage/' . $suratPermohonanUrl;
        }
        if ($request->hasFile('surat_proposal')) {
            $suratProposalUrl = $request->file('surat_proposal')->store('pengajuan/dokumen', 'public');
            $suratProposalUrl = '/storage/' . $suratProposalUrl;
        }

        Pengajuan::create([
            'id_user' => Auth::id(),
            'id_jenis_pkm' => $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'tipe_pengusul' => 'masyarakat',
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'kecamatan' => $request->kecamatan ?? '',
            'kelurahan_desa' => $request->kelurahan_desa ?? '',
            'alamat_lengkap' => $request->alamat_lengkap ?? '',
            'judul_kegiatan' => 'Pengajuan PKM dari ' . $request->institution,
            'nama_pengusul' => $request->name,
            'email_pengusul' => $request->email,
            'kebutuhan' => $request->needs,
            'instansi_mitra' => $request->institution,
            'no_telepon' => $request->whatsapp,
            'surat_permohonan' => $suratPermohonanUrl,
            'proposal' => $suratProposalUrl,
            'rab' => $request->input('link_tambahan') ? implode(', ', $request->input('link_tambahan')) : '',
            'status_pengajuan' => 'diproses',
        ]);

        return redirect()->back()
            ->with('success', 'Pengajuan PKM berhasil dikirim! Silakan tunggu konfirmasi dari admin.');
    }

    /**
     * Helper to add team members.
     */
    private function addTeamMembers(array &$teamMembers, $members, string $role)
    {
        if (is_array($members)) {
            foreach ($members as $name) {
                if (!empty(trim($name))) {
                    $teamMembers[] = [
                        'id_pegawai' => null,
                        'nama_mahasiswa' => $name,
                        'peran_tim' => $role,
                    ];
                }
            }
        }
    }

    private function normalizeRabItems(array $items): array
    {
        return collect($items)
            ->map(function ($item) {
                $namaItem = trim((string) data_get($item, 'nama_item', ''));
                $jumlah = (float) data_get($item, 'jumlah', 0);
                $harga = (float) data_get($item, 'harga', 0);

                if ($namaItem === '' || $jumlah <= 0) {
                    return null;
                }

                return [
                    'nama_item' => $namaItem,
                    'jumlah' => $jumlah,
                    'harga' => $harga,
                    'total' => round($jumlah * $harga, 2),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function resolveSubmitterType(Pengajuan $pengajuan): string
    {
        $storedType = Str::lower((string) $pengajuan->tipe_pengusul);
        if (in_array($storedType, ['dosen', 'masyarakat'], true)) {
            return $storedType;
        }

        return Str::lower((string) $pengajuan->user?->role) === 'dosen' ? 'dosen' : 'masyarakat';
    }

    private function resolveSubmitterName(Pengajuan $pengajuan): string
    {
        if (!empty($pengajuan->nama_pengusul)) {
            return $pengajuan->nama_pengusul;
        }

        if ($this->resolveSubmitterType($pengajuan) === 'dosen') {
            $ketuaTim = $pengajuan->timKegiatan->first(function ($tim) {
                return Str::contains(Str::lower((string) $tim->peran_tim), 'ketua');
            });

            $ketuaName = $ketuaTim?->pegawai?->nama_pegawai ?? $ketuaTim?->nama_mahasiswa;
            if (!empty($ketuaName)) {
                return $ketuaName;
            }
        }

        return $pengajuan->user?->name ?? '';
    }

    private function resolveSubmitterEmail(Pengajuan $pengajuan): string
    {
        if (!empty($pengajuan->email_pengusul)) {
            return $pengajuan->email_pengusul;
        }

        return $pengajuan->user?->email ?? '';
    }
}
