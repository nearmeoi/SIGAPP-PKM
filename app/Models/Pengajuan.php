<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengajuan extends Model
{
    use SoftDeletes;
    protected $table = 'pengajuan';
    protected $primaryKey = 'id_pengajuan';
    // Gunakan timestamps standar Laravel (created_at + updated_at)
    public $timestamps = true;

    protected $fillable = [
        'id_user',
        'id_jenis_pkm',
        'id_lokasi_pkm',
        'judul_kegiatan',
        'kebutuhan',
        'instansi_mitra',
        'proposal',
        'surat_permohonan',
        'rab',
        'sumber_dana',
        'total_anggaran',
        'tgl_mulai',
        'tgl_selesai',
        'status_pengajuan',
        'catatan_admin',
    ];

    // Status yang valid berdasarkan alur bisnis
    const STATUS_DIPROSES = 'diproses';
    const STATUS_DIREVISI = 'direvisi';
    const STATUS_DITERIMA = 'diterima';
    const STATUS_DITOLAK = 'ditolak';
    const STATUS_SELESAI = 'selesai';

    protected function casts(): array
    {
        return [
            'total_anggaran' => 'decimal:2',
            'tgl_mulai' => 'date',
            'tgl_selesai' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class , 'id_user');
    }

    public function jenisPkm()
    {
        return $this->belongsTo(JenisPkm::class , 'id_jenis_pkm', 'id_jenis_pkm');
    }

    public function lokasiPkm()
    {
        return $this->belongsTo(LokasiPkm::class , 'id_lokasi_pkm', 'id_lokasi_pkm');
    }

    public function timKegiatan()
    {
        return $this->hasMany(TimKegiatan::class , 'id_pengajuan', 'id_pengajuan');
    }

    public function aktivitas()
    {
        // Satu pengajuan hanya memiliki satu aktivitas pelaksanaan
        return $this->hasOne(Aktivitas::class , 'id_pengajuan', 'id_pengajuan');
    }

    public function arsip()
    {
        return $this->hasMany(Arsip::class , 'id_pengajuan', 'id_pengajuan');
    }

    public function testimoni()
    {
        return $this->hasMany(Testimoni::class , 'id_pengajuan', 'id_pengajuan');
    }
}
