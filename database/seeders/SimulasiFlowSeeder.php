<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SimulasiFlowSeeder extends Seeder
{
    public function run()
    {
        // 1. Ambil atau Buat User Dosen/Pemohon
        $user = \App\Models\User::firstOrCreate(
        ['email' => 'dosen@poltekpar.ac.id'],
        [
            'name' => 'Dr. Andi Pemohon',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'user',
        ]
        );

        // 2. Ambil Master Data
        $jenisPkm = \App\Models\JenisPkm::firstOrCreate(['nama_jenis' => 'Pemberdayaan Masyarakat']);
        $lokasiPkm = \App\Models\LokasiPkm::firstOrCreate(['provinsi' => 'Sulawesi Selatan', 'kota_kabupaten' => 'Makassar']);

        $userPegawai1 = \App\Models\User::firstOrCreate(
        ['email' => 'bsantoso@poltekpar.ac.id'],
        ['name' => 'Budi Santoso, S.ST., M.Par', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'role' => 'admin']
        );
        $pegawai1 = \App\Models\Pegawai::firstOrCreate(['nip' => '198001012005011001'], ['id_user' => $userPegawai1->id_user, 'nama_pegawai' => 'Budi Santoso, S.ST., M.Par', 'status_pegawai' => 'aktif']);

        $userPegawai2 = \App\Models\User::firstOrCreate(
        ['email' => 'saminah@poltekpar.ac.id'],
        ['name' => 'Dr. Siti Aminah', 'password' => \Illuminate\Support\Facades\Hash::make('password'), 'role' => 'admin']
        );
        $pegawai2 = \App\Models\Pegawai::firstOrCreate(['nip' => '198502022010012002'], ['id_user' => $userPegawai2->id_user, 'nama_pegawai' => 'Dr. Siti Aminah', 'status_pegawai' => 'aktif']);

        // 3. Buat Data Simulasi (Siklus Pengajuan)

        // Simulasi 1: Baru Diajukan (Diproses)
        \App\Models\Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'id_lokasi_pkm' => $lokasiPkm->id_lokasi_pkm,
            'judul_kegiatan' => 'Pendampingan Desa Wisata Rammang-Rammang (Diproses)',
            'instansi_mitra' => 'Kelompok Sadar Wisata',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 15000000,
            'kebutuhan' => 'Pelatihan CHSE untuk pengelola homestay lokal.',
            'status_pengajuan' => 'diproses',
            'tgl_mulai' => now()->addDays(14)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(20)->format('Y-m-d'),
        ]);

        // Simulasi 2: Direvisi
        \App\Models\Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'id_lokasi_pkm' => $lokasiPkm->id_lokasi_pkm,
            'judul_kegiatan' => 'Pengembangan Digital Marketing Desa (Direvisi)',
            'instansi_mitra' => 'BUMDes Barania',
            'sumber_dana' => 'Mandiri',
            'total_anggaran' => 5000000,
            'kebutuhan' => 'Pelatihan TikTok dan IG Ads.',
            'status_pengajuan' => 'direvisi',
            'catatan_admin' => 'RAB kurang detail. Mohon rincikan biaya transportasi.',
            'tgl_mulai' => now()->addDays(30)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(35)->format('Y-m-d'),
        ]);

        // Simulasi 3: Ditolak
        \App\Models\Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'id_lokasi_pkm' => $lokasiPkm->id_lokasi_pkm,
            'judul_kegiatan' => 'Riset Perilaku Wisatawan (Ditolak)',
            'instansi_mitra' => '-',
            'sumber_dana' => 'Lainnya',
            'total_anggaran' => 20000000,
            'kebutuhan' => 'Bukan PKM, tapi murni riset dosen.',
            'status_pengajuan' => 'ditolak',
            'catatan_admin' => 'Maaf, ini masuk ranah Penelitian (P3M), bukan ranah Pengabdian Masyarakat (PKM). Arahkan proposal ke skema P3M.',
            'tgl_mulai' => now()->format('Y-m-d'),
            'tgl_selesai' => now()->format('Y-m-d'),
        ]);

        // Simulasi 4: Diterima (Punya Tim & Aktivitas Berjalan)
        $diterima = \App\Models\Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'id_lokasi_pkm' => $lokasiPkm->id_lokasi_pkm,
            'judul_kegiatan' => 'Sertifikasi Tour Guide Lokal (Diterima)',
            'instansi_mitra' => 'HPI Makassar',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 25000000,
            'kebutuhan' => 'Sertifikasi kompetensi untuk 20 orang.',
            'status_pengajuan' => 'diterima',
            'catatan_admin' => 'Proposal disetujui. Silakan lanjut ke pelaksanaan.',
            'tgl_mulai' => now()->subDays(5)->format('Y-m-d'),
            'tgl_selesai' => now()->addDays(5)->format('Y-m-d'),
        ]);

        \App\Models\TimKegiatan::create(['id_pengajuan' => $diterima->id_pengajuan, 'id_pegawai' => $pegawai1->id_pegawai, 'peran_tim' => 'Ketua']);
        \App\Models\TimKegiatan::create(['id_pengajuan' => $diterima->id_pengajuan, 'nama_mahasiswa' => 'Aldo', 'peran_tim' => 'Anggota (Mhs)']);
        \App\Models\Aktivitas::create(['id_pengajuan' => $diterima->id_pengajuan, 'status_pelaksanaan' => 'berjalan', 'catatan_pelaksanaan' => 'Persiapan materi modul.']);

        // Simulasi 5: Selesai (Punya Tim, Aktivitas, Arsip)
        $selesai = \App\Models\Pengajuan::create([
            'id_user' => $user->id_user,
            'id_jenis_pkm' => $jenisPkm->id_jenis_pkm,
            'id_lokasi_pkm' => $lokasiPkm->id_lokasi_pkm,
            'judul_kegiatan' => 'Penyuluhan Sapta Pesona (Selesai)',
            'instansi_mitra' => 'Dinas Pariwisata',
            'sumber_dana' => 'DIPA Poltekpar',
            'total_anggaran' => 10000000,
            'kebutuhan' => 'Kampanye sadar wisata.',
            'status_pengajuan' => 'selesai',
            'tgl_mulai' => now()->subDays(60)->format('Y-m-d'),
            'tgl_selesai' => now()->subDays(55)->format('Y-m-d'),
        ]);

        \App\Models\TimKegiatan::create(['id_pengajuan' => $selesai->id_pengajuan, 'id_pegawai' => $pegawai2->id_pegawai, 'peran_tim' => 'Ketua']);
        \App\Models\Aktivitas::create(['id_pengajuan' => $selesai->id_pengajuan, 'status_pelaksanaan' => 'selesai', 'catatan_pelaksanaan' => 'Semua rangkaian acara tuntas.']);
        \App\Models\Arsip::create(['id_pengajuan' => $selesai->id_pengajuan, 'nama_dokumen' => 'Laporan Akhir (LPJ)', 'jenis_arsip' => 'Laporan', 'url_dokumen' => '#lpj']);
        \App\Models\Arsip::create(['id_pengajuan' => $selesai->id_pengajuan, 'nama_dokumen' => 'Sertifikat & Dokumentasi', 'jenis_arsip' => 'Sertifikat', 'url_dokumen' => '#foto']);
    }
}
