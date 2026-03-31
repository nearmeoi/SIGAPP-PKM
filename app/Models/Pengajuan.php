<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengajuan extends Model
{
    use SoftDeletes;

    protected $table = 'pengajuan';

    protected $primaryKey = 'id_pengajuan';

    public $timestamps = true;

    protected $fillable = [
        'id_user',
        'id_jenis_pkm',
        'provinsi',
        'kota_kabupaten',
        'kecamatan',
        'kelurahan_desa',
        'alamat_lengkap',
        'latitude',
        'longitude',
        'judul_kegiatan',
        'kebutuhan',
        'instansi_mitra',
        'no_telepon',
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

    const STATUS_DIPROSES = 'diproses';

    const STATUS_DIREVISI = 'direvisi';

    const STATUS_DITERIMA = 'diterima';

    const STATUS_DITOLAK = 'ditolak';

    const STATUS_SELESAI = 'selesai';

    protected function casts(): array
    {
        return [
            'total_anggaran' => 'decimal:2',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'tgl_mulai' => 'date',
            'tgl_selesai' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function jenisPkm()
    {
        return $this->belongsTo(JenisPkm::class, 'id_jenis_pkm', 'id_jenis_pkm');
    }

    public function timKegiatan()
    {
        return $this->hasMany(TimKegiatan::class, 'id_pengajuan', 'id_pengajuan');
    }

    public function aktivitas()
    {
        return $this->hasOne(Aktivitas::class, 'id_pengajuan', 'id_pengajuan');
    }

    public function arsip()
    {
        return $this->hasMany(Arsip::class, 'id_pengajuan', 'id_pengajuan');
    }

    public function testimoni()
    {
        return $this->hasManyThrough(
            Testimoni::class,
            Aktivitas::class,
            'id_pengajuan',
            'id_aktivitas',
            'id_pengajuan',
            'id_aktivitas'
        );
    }

    public function getFullAddressAttribute(): string
    {
        return collect([
            $this->alamat_lengkap,
            $this->kelurahan_desa,
            $this->kecamatan,
            $this->kota_kabupaten,
            $this->provinsi,
        ])->filter()->implode(', ');
    }
}
