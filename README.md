# SIGAPPA P3M Poltekpar Makassar

Sistem Informasi Geospasial dan Akses Pelayanan Pengabdian Pariwisata (SIGAPPA) untuk P3M Politeknik Pariwisata Makassar.

Repositori ini berisi aplikasi web berbasis Laravel + Inertia React yang menggabungkan:

- portal publik SIGAPPA
- autentikasi dosen dan masyarakat
- form pengajuan PKM
- cek status pengajuan
- dashboard admin P3M
- pengelolaan aktivitas, arsip, testimoni, pegawai, dan template dokumen

## Gambaran Web

Antarmuka publik saat ini mengikuti struktur web P3M dengan menu utama:

- `Beranda`
- `Cek Status`
- `Pengajuan`
- `Panduan`
- `Portal P3M`

Konten publik yang tersedia di aplikasi:

- peta sebaran kegiatan PKM
- statistik pengajuan dan status pelaksanaan
- akses pengajuan untuk dosen dan masyarakat
- halaman panduan penggunaan
- pengumpulan arsip publik
- form testimoni publik
- tautan profil dan kegiatan P3M

## Fitur Utama

### 1. Landing Page Publik

- peta lokasi kegiatan PKM berbasis Leaflet
- ringkasan status pengajuan dan kegiatan
- grafik evaluasi dan statistik pengunjung
- CTA ke pengajuan, cek status, dan portal

### 2. Pengajuan Auth Dosen

- form pengajuan PKM dosen
- input informasi ketua pengusul
- detail kegiatan dan lokasi
- tim pelaksana dinamis
- tabel RAB per item
- sumber dana
- unggah surat permohonan dan proposal
- link tambahan pendukung

### 3. Pengajuan Auth Masyarakat

- form pengajuan PKM masyarakat
- identitas pengusul/perwakilan
- kebutuhan PKM
- lokasi pelaksanaan
- unggah surat permohonan dan proposal
- link tambahan

### 4. Cek Status Pengajuan

- riwayat pengajuan per pengguna
- status `diproses`, `direvisi`, `diterima`, `ditolak`, dan `selesai`
- catatan admin pada pengajuan yang perlu revisi

### 5. Dashboard Admin

Panel admin mencakup modul:

- dashboard evaluasi dan grafik pengajuan
- kelola pengajuan
- detail pengajuan dosen dan masyarakat
- verifikasi berkas
- kelola pegawai
- kelola user
- kelola aktivitas
- kelola arsip
- kelola testimoni
- master data jenis PKM
- template dokumen

## Fitur Admin Pengajuan

Alur admin pengajuan yang sudah ada di project saat ini:

- daftar pengajuan dengan filter, pencarian, ekspor, dan indikator kelengkapan data
- detail pengajuan mengikuti format form asli
- admin dapat mengedit data penting pengajuan
- admin dapat mengedit tim pelaksana
- admin dapat mengedit rincian tabel RAB pada pengajuan dosen
- admin dapat mengedit sumber dana
- admin tidak bisa memverifikasi pengajuan jika data inti masih belum lengkap
- status verifikasi tersedia untuk `diterima`, `direvisi`, dan `ditolak`

## Template Dokumen

Aplikasi sudah mendukung:

- pengelolaan template dokumen di admin
- unduh template publik melalui route `/template/{jenis}`

Template ini dipakai untuk kebutuhan pengajuan seperti surat permohonan dan proposal.

## Route Penting

### Publik

- `/`
- `/panduan`
- `/pengajuan`
- `/cek-status`
- `/testimoni`
- `/kumpul-arsip`
- `/template/{jenis}`

### Autentikasi

- `/login`
- `/register`
- `/login/dosen`
- `/login/masyarakat`
- `/verify-email`

### Admin

- `/admin/dashboard`
- `/admin/pengajuan`
- `/admin/pegawai`
- `/admin/users`
- `/admin/aktivitas`
- `/admin/arsip`
- `/admin/testimoni`
- `/admin/master/jenis-pkm`
- `/admin/templates`

## Stack Teknologi

- Laravel 12
- PHP 8.4
- Inertia.js React
- React 19
- TypeScript
- Vite
- Tailwind CSS
- MySQL
- Leaflet
- Chart.js
- Lucide React

## Struktur Folder Penting

```text
app/
|-- Http/Controllers/
|-- Models/
`-- Providers/

database/
|-- migrations/
`-- seeders/

resources/
|-- css/
`-- js/
    |-- Components/
    |-- Layouts/
    |-- Pages/
    `-- data/

routes/
`-- web.php
```

## Cara Menjalankan

### Prasyarat

- PHP 8.4+
- Composer
- Node.js 18+
- npm
- MySQL

### Instalasi

```bash
git clone https://github.com/githubnyabintang/SIGAP-P3M.git
cd SIGAP-P3M
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Jika memakai PowerShell:

```powershell
Copy-Item .env.example .env
```

### Konfigurasi Database

Atur koneksi database pada `.env`, misalnya:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigap_p3m
DB_USERNAME=root
DB_PASSWORD=
```

### Migrasi dan Seeder

```bash
php artisan migrate --seed
```

Jika ingin reset total:

```bash
php artisan migrate:fresh --seed
```

### Menjalankan Development

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

### Build Production

```bash
npm run build
```

## Akun Uji

Data akun mengikuti seeder yang tersedia di project. Untuk lingkungan lokal, akun admin dan akun dosen dummy dapat dicek pada:

- `database/seeders/UserSeeder.php`

## Catatan Pengembangan

Beberapa pembaruan penting di state proyek saat ini:

- submitter pengajuan disimpan berdasarkan input form, bukan hanya akun
- admin melihat detail pengajuan sesuai format form dosen atau masyarakat
- admin dapat melengkapi dan memperbaiki data pengajuan
- item RAB dosen sekarang dapat disimpan per baris
- verifikasi pengajuan diblokir bila isian inti masih kosong

## Validasi yang Umum Dipakai

Sebelum deploy atau merge, pengecekan yang biasa dipakai:

```bash
php -l app/Http/Controllers/Admin/PengajuanController.php
php -l app/Http/Controllers/User/PengajuanUserController.php
npm run build
```

## Lisensi

Repositori ini digunakan untuk pengembangan internal SIGAPPA P3M Politeknik Pariwisata Makassar.
