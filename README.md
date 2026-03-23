# 🗺️ BikinMap — Peta Sebaran Kegiatan P3M

> Platform pemetaan interaktif untuk kegiatan Penelitian, Pengabdian, dan Pemberdayaan Masyarakat (P3M) Politeknik Pariwisata Makassar.

---

## ✨ Fitur Utama

### 🖥️ Tampilan Desktop
- **Peta interaktif** berbasis Leaflet dengan marker kustom berwarna (🟡 Berlangsung / 🟢 Selesai)
- **Search bar** untuk mencari lokasi kegiatan secara real-time
- **Hamburger menu** — sidebar kiri dengan daftar kegiatan dan thumbnail
- **Detail sidebar** — panel kanan dengan informasi lengkap kegiatan (gambar, status, deskripsi, lokasi, aksi)
- **Glassmorphism overlay** pada peta saat sidebar aktif
- **Form CRUD** — Tambah & Edit data kegiatan PKM dengan fitur Pick Location dari peta dan upload thumbnail
- **Success modal** dengan animasi dan ikon

### 📱 Tampilan Mobile (Fintech-style Map App)
Tampilan mobile dirancang khusus berbeda dari desktop, terinspirasi dari aplikasi fintech/maps seperti Grab, Gojek, dan Google Maps:
- **Peta full-screen** (100vh) — tanpa border, tanpa kotak, langsung penuh layar
- **Bottom Tab Bar** — navigasi bawah dengan 4 tab (Beranda, Peta, Kegiatan, Akun) dengan efek glassmorphism
- **Bottom Sheet** — panel geser dari bawah saat klik titik lokasi (swipe-to-dismiss)
- **Daftar Kegiatan** — bottom sheet dengan thumbnail saat klik tab Kegiatan
- Header, Footer, Hero section tersembunyi di mobile untuk pengalaman app-first

---

## 🛠️ Tech Stack

| Teknologi | Keterangan |
|---|---|
| **Laravel** | Backend framework (PHP) |
| **React** | Frontend library (via Inertia.js) |
| **Inertia.js** | SPA bridge antara Laravel & React |
| **Leaflet** | Library peta interaktif |
| **react-leaflet** | React wrapper untuk Leaflet |
| **Vite** | Build tool & bundler |
| **Font Awesome** | Icon library |

---

## 🚀 Instalasi & Setup

### Prasyarat
- PHP >= 8.1
- Composer
- Node.js >= 18
- NPM

### Langkah Instalasi

```bash
# Clone repository
git clone https://github.com/githubnyabintang/bikinmap.git
cd bikinmap

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Menjalankan Development Server

```bash
# Terminal 1 — Laravel Server
php artisan serve

# Terminal 2 — Vite Dev Server (hot reload)
npm run dev
```

Buka `http://localhost:8000` di browser.

### Build untuk Production

```bash
npm run build
```

---

## 📁 Struktur Proyek (Frontend)

```
resources/
├── css/
│   ├── app.css              # Styling utama (sidebar, map, overlay, mobile)
│   └── landing.css           # Styling landing page (hero, features, CTA)
├── js/
│   ├── Components/
│   │   ├── Header.jsx        # Navbar desktop
│   │   ├── Footer.jsx        # Footer website
│   │   ├── MobileTabBar.jsx  # Bottom tab bar (mobile only)
│   │   └── BottomSheet.jsx   # Bottom sheet component (mobile only)
│   ├── Layouts/
│   │   └── DefaultLayout.jsx # Layout wrapper (Header + Footer)
│   └── Pages/
│       ├── LandingPage.jsx   # Halaman utama (peta, sidebar, modals)
│       └── MapDashboard.jsx  # Dashboard admin peta
```

---

## 📸 Screenshot

### Desktop
- Header mega-menu dengan branding P3M Poltekpar Makassar
- Peta dalam kontainer 1200px dengan rounded corners dan shadow premium
- Sidebar detail kegiatan dengan glassmorphism overlay

### Mobile
- Peta full-screen seperti aplikasi fintech
- Bottom tab bar dengan glassmorphism
- Bottom sheet untuk detail lokasi dengan thumbnail, deskripsi, dan tombol aksi

---

## 📝 Lisensi

Proyek ini dikembangkan untuk keperluan internal **P3M Politeknik Pariwisata Makassar**.

---

## 👤 Author

Dikembangkan oleh **Bintang** — [@githubnyabintang](https://github.com/githubnyabintang)