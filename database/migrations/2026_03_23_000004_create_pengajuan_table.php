<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    public function up(): void
    {
        Schema::create('pengajuan', function (Blueprint $table) {
            $table->id('id_pengajuan');
            $table->foreignId('id_user')->constrained('users', 'id_user')->onDelete('cascade');
            $table->foreignId('id_jenis_pkm')->constrained('jenis_pkm', 'id_jenis_pkm')->onDelete('cascade');
            $table->foreignId('id_lokasi_pkm')->constrained('lokasi_pkm', 'id_lokasi_pkm')->onDelete('cascade');
            $table->string('judul_kegiatan');
            $table->text('kebutuhan')->nullable();
            $table->string('instansi_mitra')->nullable();
            $table->string('proposal')->nullable();
            $table->string('surat_permohonan')->nullable();
            $table->string('rab')->nullable();
            $table->string('sumber_dana')->nullable();
            $table->decimal('total_anggaran', 15, 2)->default(0);
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_selesai')->nullable();
            $table->string('status_pengajuan')->default('draft');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengajuan');
    }
};
