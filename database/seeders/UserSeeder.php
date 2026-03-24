<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pegawai;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Akun Admin
        User::updateOrCreate(
        ['email' => 'admin@poltekpar.ac.id'],
        [
            'name' => 'Administrator',
            'password' => Hash::make('password'), // default password: password
            'role' => 'admin'
        ]
        );

        // 2. Akun Dosen (Pegawai)
        $dosenUser = User::updateOrCreate(
        ['email' => 'dosen@poltekpar.ac.id'],
        [
            'name' => 'Budi Dosen',
            'password' => Hash::make('password'),
            'role' => 'dosen' // Role diubah menjadi dosen
        ]
        );

        Pegawai::updateOrCreate(
        ['nip' => '198001012005011001'],
        [
            'id_user' => $dosenUser->id_user, // pakai id_user karena primary key nya beda
            'nama_pegawai' => 'Budi Dosen, M.Pd.',
            'status_pegawai' => 'aktif'
        ]
        );

        // 3. Akun Masyarakat
        User::updateOrCreate(
        ['email' => 'masyarakat@example.com'],
        [
            'name' => 'Warga Masyarakat',
            'password' => Hash::make('password'),
            'role' => 'masyarakat' // Role diubah menjadi masyarakat
        ]
        );
    }
}
