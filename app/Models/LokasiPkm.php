<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LokasiPkm extends Model
{
    protected $table = 'lokasi_pkm';
    protected $primaryKey = 'id_lokasi_pkm';

    protected $fillable = [
        'provinsi',
        'kota_kabupaten',
        'kecamatan',
        'kelurahan_desa',
        'latitude',
        'longitude',
    ];

    public function pengajuan()
    {
        return $this->hasMany(Pengajuan::class , 'id_lokasi_pkm');
    }
}
