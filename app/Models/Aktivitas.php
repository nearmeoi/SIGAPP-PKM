<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aktivitas extends Model
{
    protected $table = 'aktivitas';
    protected $primaryKey = 'id_aktivitas';

    protected $fillable = [
        'id_pengajuan',
        'status_pelaksanaan',
        'url_thumbnail',
    ];

    public function pengajuan()
    {
        return $this->belongsTo(Pengajuan::class , 'id_pengajuan', 'id_pengajuan');
    }

    public function arsip()
    {
        return $this->hasMany(Arsip::class , 'id_aktivitas', 'id_aktivitas');
    }

    public function testimoni()
    {
        return $this->hasMany(Testimoni::class , 'id_aktivitas', 'id_aktivitas');
    }
}
