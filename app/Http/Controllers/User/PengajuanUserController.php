<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\JenisPkm;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PengajuanUserController extends Controller
{
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
            'id_jenis_pkm'      => 'nullable|exists:jenis_pkm,id_jenis_pkm',
            'judul_kegiatan'    => 'required|string|max:255',
            'nama_dosen'        => 'required|string|max:255',
            'instansi_mitra'    => 'nullable|string|max:255',
            'no_telepon'        => 'nullable|string|max:20',
            'provinsi'          => 'required|string|max:100',
            'kota_kabupaten'    => 'required|string|max:100',
            'kecamatan'         => 'nullable|string|max:100',
            'kelurahan_desa'    => 'nullable|string|max:100',
            'alamat_lengkap'    => 'nullable|string|max:1000',
            'sumber_dana'       => 'nullable|string|max:255',
            'total_anggaran'    => 'nullable|numeric|min:0',
            'tgl_mulai'         => 'nullable|date',
            'tgl_selesai'       => 'nullable|date|after_or_equal:tgl_mulai',
            'proposal_url'      => 'nullable|string|max:2048',
            'surat_permohonan_url' => 'nullable|string|max:2048',
            'rab'               => 'nullable|string|max:2048',
            'dosen_terlibat'    => 'nullable|array',
            'dosen_terlibat.*'  => 'string|max:255',
            'staff_terlibat'    => 'nullable|array',
            'staff_terlibat.*'  => 'string|max:255',
            'mahasiswa_terlibat'   => 'nullable|array',
            'mahasiswa_terlibat.*' => 'string|max:255',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        $pengajuan = Pengajuan::create([
            'id_user'          => $user->id_user,
            'id_jenis_pkm'     => $request->id_jenis_pkm ?? $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'provinsi'         => $request->provinsi,
            'kota_kabupaten'   => $request->kota_kabupaten,
            'kecamatan'        => $request->kecamatan ?? '',
            'kelurahan_desa'   => $request->kelurahan_desa ?? '',
            'alamat_lengkap'   => $request->alamat_lengkap ?? '',
            'judul_kegiatan'   => $request->judul_kegiatan,
            'instansi_mitra'   => $request->instansi_mitra ?? '',
            'no_telepon'       => $request->no_telepon ?? '',
            'sumber_dana'      => $request->sumber_dana ?? '',
            'total_anggaran'   => $request->total_anggaran ?? 0,
            'tgl_mulai'        => $request->tgl_mulai,
            'tgl_selesai'      => $request->tgl_selesai,
            'proposal'         => $request->proposal_url ?? '',
            'surat_permohonan' => $request->surat_permohonan_url ?? '',
            'rab'              => $request->rab ?? '',
            'status_pengajuan' => 'diproses',
        ]);

        // Dosen pengusul utama dimasukkan ke tim sebagai Ketua
        $teamMembers = [];
        $namaDosen = trim($request->nama_dosen ?? '');
        if ($namaDosen !== '') {
            $teamMembers[] = ['nama_mahasiswa' => $namaDosen, 'peran_tim' => 'Ketua/Dosen Pengusul'];
        }

        $this->addTeamMembers($teamMembers, $request->dosen_terlibat, 'Dosen');
        $this->addTeamMembers($teamMembers, $request->staff_terlibat, 'Staff');
        $this->addTeamMembers($teamMembers, $request->mahasiswa_terlibat, 'Mahasiswa');

        if (count($teamMembers) > 0) {
            $now = now();
            $rows = array_map(fn ($m) => array_merge($m, [
                'id_pengajuan' => $pengajuan->id_pengajuan,
                'created_at'   => $now,
                'updated_at'   => $now,
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
            'name'           => 'required|string|max:255',
            'institution'    => 'required|string|max:255',
            'needs'          => 'required|string',
            'email'          => 'required|email|max:255',
            'whatsapp'       => 'required|string|max:20',
            'provinsi'       => 'required|string|max:100',
            'kota_kabupaten' => 'required|string|max:100',
            'kecamatan'      => 'nullable|string|max:100',
            'kelurahan_desa' => 'nullable|string|max:100',
            'alamat_lengkap' => 'nullable|string|max:1000',
            'surat_permohonan' => 'nullable|string|max:2048',
            'surat_proposal'   => 'nullable|string|max:2048',
        ]);

        $defaultJenisPkm = JenisPkm::first();

        Pengajuan::create([
            'id_user'          => Auth::id(),
            'id_jenis_pkm'     => $defaultJenisPkm?->id_jenis_pkm ?? 1,
            'provinsi'         => $request->provinsi,
            'kota_kabupaten'   => $request->kota_kabupaten,
            'kecamatan'        => $request->kecamatan ?? '',
            'kelurahan_desa'   => $request->kelurahan_desa ?? '',
            'alamat_lengkap'   => $request->alamat_lengkap ?? '',
            'judul_kegiatan'   => 'Pengajuan PKM dari ' . $request->institution,
            'kebutuhan'        => $request->needs,
            'instansi_mitra'   => $request->institution,
            'no_telepon'       => $request->whatsapp,
            'surat_permohonan' => $request->surat_permohonan ?? '',
            'proposal'         => $request->surat_proposal ?? '',
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
                        'nama_mahasiswa' => $name,
                        'peran_tim'      => $role,
                    ];
                }
            }
        }
    }
}
