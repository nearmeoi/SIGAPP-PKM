<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        // Tambah kolom detail pada tabel aktivitas
        Schema::table('aktivitas', function (Blueprint $table) {
            $table->text('catatan_pelaksanaan')->nullable()->after('status_pelaksanaan');
            $table->date('tgl_realisasi_mulai')->nullable()->after('catatan_pelaksanaan');
            $table->date('tgl_realisasi_selesai')->nullable()->after('tgl_realisasi_mulai');
        });
    }

    public function down(): void
    {
        Schema::table('aktivitas', function (Blueprint $table) {
            $table->dropColumn(['catatan_pelaksanaan', 'tgl_realisasi_mulai', 'tgl_realisasi_selesai']);
        });
    }
};
