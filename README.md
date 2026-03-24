# SIGAP-PKM (Admin & Backend System)

Repositori ini berisi kode sumber untuk sistem backend dan administrasi **SIGAP-PKM**. Sistem ini dibangun menggunakan arsitektur monolitik modern dengan Laravel sebagai inti backend dan Inertia.js yang menjembatani *frontend* React.

## Tech Stack Utama (Backend)
- **Framework:** Laravel 12.x
- **Database:** MySQL
- **Bridge:** Inertia.js (Server-side routing)
- **Autentikasi:** Laravel Breeze / Session-based
- **Environment:** PHP 8.4

## Akun Kebutuhan Tes
- **Email:** admin@poltekpar.ac.id
- **Password:** password

## Persyaratan Sistem
Sebelum menjalankan *project* ini, pastikan sistem Anda telah terpasang perangkat lunak berikut:
- PHP >= 8.4
- Composer
- Node.js & npm (Untuk *compile* *asset* Inertia)
- MySQL Server

## Panduan Instalasi (Development)

1. **Clone repositori** dari cabang `backend`:
   ```bash
   git clone -b backend https://github.com/nearmeoi/sigap-pkm.git
   cd sigap-pkm
   ```

2. **Install dependensi PHP (Backend)**
   ```bash
   composer install
   ```

3. **Install dependensi Node (Frontend/Inertia assets)**
   Bagian ini tetap diperlukan karena Laravel menggunakan Vite untuk me-*render* tampilan panel admin.
   ```bash
   npm install
   ```

4. **Konfigurasi Environment**
   Salin file konfigurasi bawaan Laravel dan sesuaikan pengaturan *database*-nya:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan atur koneksi *database*, misalnya:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sigap_pkm
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. **Generate App Key**
   ```bash
   php artisan key:generate
   ```

6. **Migrasi Database & Seeding**
   Jalankan migrasi untuk membangun skema tabel sekaligus mengisi data awal (*dummy data* admin dll):
   ```bash
   php artisan migrate:fresh --seed
   ```

7. **Jalankan Aplikasi**
   Anda membutuhkan dua terminal yang berjalan bersamaan:

   *Terminal 1 (Backend PHP Server):*
   ```bash
   php artisan serve
   ```

   *Terminal 2 (Vite Asset Bundler):*
   ```bash
   npm run dev
   ```

Aplikasi sekarang dapat diakses melalui `http://localhost:8000`.

## � Struktur Folder Penting (Backend Context)
- `app/Models/` — Definisi skema relasi ORM (Pengajuan, Aktivitas, Pegawai, dll).
- `app/Http/Controllers/` — Logika bisnis REST dan *controller* pengatur rute.
- `database/migrations/` — Skema pembangunan *database*.
- `routes/web.php` — Titik masuk *routing* aplikasi utama.
- `resources/js/` — Direktori komponen React untuk panel administratif (dikendalikan via Inertia).

