<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use App\Models\Arsip;
use App\Models\JenisPkm;
use App\Models\Pengajuan;
use App\Models\TimKegiatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()->role === 'superadmin', 403, 'Hanya superadmin yang dapat mengakses halaman ini.');
        
        return Inertia::render('Admin/ImportHistory');
    }

    public function preview(Request $request)
    {
        abort_unless($request->user()->role === 'superadmin', 403, 'Akses ditolak.');

        $request->validate([
            'file_xlsx' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        try {
            $file = $request->file('file_xlsx');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            
            $rows = [];
            $isFirstRow = true;

            foreach ($worksheet->getRowIterator() as $row) {
                $cellIterator = $row->getCellIterator();
                $cellIterator->setIterateOnlyExistingCells(false);

                $rowData = [];
                foreach ($cellIterator as $cell) {
                    $rowData[] = $cell->getValue();
                }

                // Skip header
                if ($isFirstRow) {
                    $isFirstRow = false;
                    continue;
                }
                
                // If the first col (Tahun) is empty and second col (Judul) is empty, skip
                if (empty(trim($rowData[0] ?? '')) && empty(trim($rowData[1] ?? ''))) {
                    continue;
                }

                $rows[] = [
                    'id' => uniqid(),
                    'tahun' => trim($rowData[0] ?? ''),
                    'judul' => trim($rowData[1] ?? ''),
                    'jenis' => trim($rowData[2] ?? ''),
                    'kebutuhan' => trim($rowData[3] ?? ''),
                    'pengusul' => trim($rowData[4] ?? ''),
                    'ketua' => trim($rowData[5] ?? ''),
                    'dosen' => trim($rowData[6] ?? ''),
                    'staff' => trim($rowData[7] ?? ''),
                    'mahasiswa' => trim($rowData[8] ?? ''),
                    'desa' => trim($rowData[9] ?? ''),
                    'kecamatan' => trim($rowData[10] ?? ''),
                    'kota' => trim($rowData[11] ?? ''),
                    'provinsi' => trim($rowData[12] ?? ''),
                    'link_rab' => trim($rowData[13] ?? ''),
                    'anggaran' => (float) str_replace(['Rp', '.', ',', ' '], '', trim($rowData[14] ?? '')),
                    'sumber' => trim($rowData[15] ?? ''),
                    'link_testimoni' => trim($rowData[16] ?? ''),
                    'link_surat' => trim($rowData[17] ?? ''),
                    'link_laporan' => trim($rowData[18] ?? ''),
                    'link_foto' => trim($rowData[19] ?? ''),
                ];
            }

            return response()->json(['data' => $rows]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal membaca file Excel. ' . $e->getMessage()], 422);
        }
    }

    public function store(Request $request)
    {
        abort_unless($request->user()->role === 'superadmin', 403, 'Akses ditolak.');

        $request->validate([
            'rows' => 'required|array',
            'rows.*.judul' => 'required|string',
        ]);

        $successCount = 0;
        $rowsData = $request->input('rows');

        DB::beginTransaction();
        try {
            foreach ($rowsData as $data) {
                
                $tahun = $data['tahun'] ?? '';
                $judul = $data['judul'];
                $strJenis = $data['jenis'] ?? '';
                $kebutuhan = $data['kebutuhan'] ?? '';
                $tipePengusul = $data['pengusul'] ?? '';
                $ketua = $data['ketua'] ?? '';
                $dosenStr = $data['dosen'] ?? '';
                $staffStr = $data['staff'] ?? '';
                $mhsStr = $data['mahasiswa'] ?? '';
                
                $desa = $data['desa'] ?? '';
                $kecamatan = $data['kecamatan'] ?? '';
                $kota = $data['kota'] ?? '';
                $provinsi = $data['provinsi'] ?? '';
                
                $linkRab = $data['link_rab'] ?? '';
                $totalAnggaran = (float) $data['anggaran'];
                $sumberDana = $data['sumber'] ?? '';
                
                $linkTestimoni = $data['link_testimoni'] ?? '';
                $linkSurat = $data['link_surat'] ?? '';
                $linkLaporan = $data['link_laporan'] ?? '';
                $linkFoto = $data['link_foto'] ?? '';

                $jenis = JenisPkm::where('nama_jenis', 'like', "%{$strJenis}%")->first();
                $idJenis = $jenis ? $jenis->id_jenis_pkm : 1;

                $createdDate = empty($tahun) ? now() : $tahun . '-01-01 00:00:00';

                // Buat Pengajuan
                $pengajuan = Pengajuan::create([
                    'id_user' => $request->user()->id_user,
                    'id_jenis_pkm' => $idJenis,
                    'tipe_pengusul' => strtolower($tipePengusul) == 'dosen' ? 'dosen' : 'masyarakat',
                    'judul_kegiatan' => $judul,
                    'kebutuhan' => $kebutuhan,
                    'provinsi' => $provinsi,
                    'kota_kabupaten' => $kota,
                    'kecamatan' => $kecamatan,
                    'kelurahan_desa' => $desa,
                    'alamat_lengkap' => ltrim($desa . ', ' . $kecamatan . ', ' . $kota . ', ' . $provinsi, ', '),
                    'tgl_mulai' => empty($tahun) ? date('Y-m-d') : $tahun . '-01-01',
                    'tgl_selesai' => empty($tahun) ? date('Y-m-d') : $tahun . '-12-31',
                    'status_pengajuan' => 'selesai',
                    'catatan_admin' => 'Hasil Import Historis',
                    'total_anggaran' => $totalAnggaran,
                    'sumber_dana' => $sumberDana,
                    'surat_permohonan' => !empty($linkSurat) ? $linkSurat : null,
                    'rab' => !empty($linkRab) ? $linkRab : null,
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]);

                // Buat Aktivitas
                $aktivitas = Aktivitas::create([
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'status_pelaksanaan' => 'selesai',
                    'catatan_pelaksanaan' => 'Selesai (Diimpor via XLSX)',
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]);

                $timData = [];
                // Ketua
                if (!empty($ketua)) {
                    $timData[] = [
                        'id_pengajuan' => $pengajuan->id_pengajuan,
                        'nama_mahasiswa' => $ketua,
                        'peran_tim' => 'Ketua',
                        'created_at' => $createdDate,
                        'updated_at' => $createdDate,
                    ];
                }

                // Split Helper
                $splitNames = function($str) {
                    return collect(preg_split('/[,|;]/', $str))->map(fn($item) => trim($item))->filter()->values()->toArray();
                };

                foreach ($splitNames($dosenStr) as $dosen) {
                    $timData[] = ['id_pengajuan' => $pengajuan->id_pengajuan, 'nama_mahasiswa' => $dosen, 'peran_tim' => 'Dosen', 'created_at' => $createdDate, 'updated_at' => $createdDate];
                }
                foreach ($splitNames($staffStr) as $staff) {
                    $timData[] = ['id_pengajuan' => $pengajuan->id_pengajuan, 'nama_mahasiswa' => $staff, 'peran_tim' => 'Staff', 'created_at' => $createdDate, 'updated_at' => $createdDate];
                }
                foreach ($splitNames($mhsStr) as $mhs) {
                    $timData[] = ['id_pengajuan' => $pengajuan->id_pengajuan, 'nama_mahasiswa' => $mhs, 'peran_tim' => 'Mahasiswa', 'created_at' => $createdDate, 'updated_at' => $createdDate];
                }

                if (!empty($timData)) {
                    TimKegiatan::insert($timData);
                }

                // Arsip Eksternal
                $arsipData = [];
                $baseArsip = [
                    'id_pengajuan' => $pengajuan->id_pengajuan,
                    'id_aktivitas' => $aktivitas->id_aktivitas,
                    'keterangan' => 'Arsip Impor Historis',
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ];

                if (!empty($linkLaporan)) {
                    $arsipData[] = array_merge($baseArsip, ['nama_dokumen' => 'Laporan Akhir', 'jenis_arsip' => 'laporan_akhir', 'url_dokumen' => $linkLaporan]);
                }
                if (!empty($linkFoto)) {
                    $arsipData[] = array_merge($baseArsip, ['nama_dokumen' => 'Dokumentasi PKM', 'jenis_arsip' => 'foto_kegiatan', 'url_dokumen' => $linkFoto]);
                }
                if (!empty($linkTestimoni)) {
                    $arsipData[] = array_merge($baseArsip, ['nama_dokumen' => 'Testimoni Mitra/Masyarakat', 'jenis_arsip' => 'dokumen_lain', 'url_dokumen' => $linkTestimoni]);
                }

                if (!empty($arsipData)) {
                    Arsip::insert($arsipData);
                }

                $successCount++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal menyimpan data ke database: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', "Import selesai! Berhasil menyimpan {$successCount} data PKM.");
    }
}
