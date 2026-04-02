<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\JenisPkm;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
                ->with(['timKegiatan.pegawai', 'jenisPkm'])
                ->latest()
                ->get()
                ->map(fn ($p) => [
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
                    'sumber_dana' => $p->sumber_dana,
                    'total_anggaran' => $p->total_anggaran,
                    'tgl_mulai' => optional($p->tgl_mulai)->format('Y-m-d'),
                    'tgl_selesai' => optional($p->tgl_selesai)->format('Y-m-d'),
                    'jenis_pkm' => $p->jenisPkm ? $p->jenisPkm->nama_jenis : null,
                    'tim_kegiatan' => $p->timKegiatan->map(fn ($t) => [
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
            'proposal_url' => 'nullable|string|max:2048',
            'surat_permohonan_url' => 'nullable|string|max:2048',
            'rab' => 'nullable|string|max:2048',
            'dosen_terlibat' => 'nullable|array',
            'dosen_terlibat.*' => 'string|max:255',
            'staff_terlibat' => 'nullable|array',
            'staff_terlibat.*' => 'string|max:255',
            'mahasiswa_terlibat' => 'nullable|array',
            'mahasiswa_terlibat.*' => 'string|max:255',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $pengajuan = Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $request->id_jenis_pkm ?? $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'kecamatan' => $request->kecamatan ?? '',
            'kelurahan_desa' => $request->kelurahan_desa ?? '',
            'alamat_lengkap' => $request->alamat_lengkap ?? '',
            'judul_kegiatan' => $request->judul_kegiatan,
            'kebutuhan' => $request->kebutuhan ?? '',
            'instansi_mitra' => $request->instansi_mitra ?? '',
            'no_telepon' => $request->no_telepon ?? '',
            'sumber_dana' => $request->sumber_dana ?? '',
            'total_anggaran' => $request->total_anggaran ?? 0,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'proposal' => $request->proposal_url ?? '',
            'surat_permohonan' => $request->surat_permohonan_url ?? '',
            'rab' => $request->rab ?? '',
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
            $rows = array_map(fn ($m) => array_merge($m, [
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
            $suratPermohonanUrl = '/storage/'.$suratPermohonanUrl;
        }
        if ($request->hasFile('surat_proposal')) {
            $suratProposalUrl = $request->file('surat_proposal')->store('pengajuan/dokumen', 'public');
            $suratProposalUrl = '/storage/'.$suratProposalUrl;
        }

        Pengajuan::create([
            'id_user' => Auth::id(),
            'id_jenis_pkm' => $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'provinsi' => $request->provinsi,
            'kota_kabupaten' => $request->kota_kabupaten,
            'kecamatan' => $request->kecamatan ?? '',
            'kelurahan_desa' => $request->kelurahan_desa ?? '',
            'alamat_lengkap' => $request->alamat_lengkap ?? '',
            'judul_kegiatan' => 'Pengajuan PKM dari '.$request->institution,
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
                if (! empty(trim($name))) {
                    $teamMembers[] = [
                        'id_pegawai' => null,
                        'nama_mahasiswa' => $name,
                        'peran_tim' => $role,
                    ];
                }
            }
        }
    }
}
