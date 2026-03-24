<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('lokasi_pkm', function (Blueprint $table) {
            $table->id('id_lokasi_pkm');
            $table->string('provinsi');
            $table->string('kota_kabupaten');
            $table->string('kecamatan')->nullable();
            $table->string('kelurahan_desa')->nullable();
            $table->float('latitude')->nullable();
            $table->float('longitude')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lokasi_pkm');
    }
};
