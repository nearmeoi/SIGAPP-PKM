# 🗺️ BikinMap — Peta Sebaran Kegiatan P3M

> Platform pemetaan interaktif untuk kegiatan Penelitian, Pengabdian, dan Pemberdayaan Masyarakat (P3M) Politeknik Pariwisata Makassar.

> [!NOTE]
> **Catatan Penting:** Pengembangan sisi Front-end pada branch ini merupakan hasil dari diskusi intensif dengan **Akmal** pada hari Kamis, 26 Maret 2026.

---

## ✨ Fitur Utama Frontend (UI/UX & React Components)

Pembaruan besar-besaran pada sisi Frontend menggunakan **React + Inertia.js** dengan pendekatan **Premium Fintech UI Design**:

### 🔐 Autentikasi & Akun
- **Dual Login Pages**: Desain halaman login terpisah untuk **Dosen** dan **Masyarakat** dengan UI modern, split-screen desktop, dan mobile-friendly.
- **Form Verification / Register**: Komponen form dengan validasi global, input OTP simulasi, dan error state handling (Red Border & Error Toast).
- **Role Indicators**: Lencana penunjuk peran pengguna aktif (Dosen/Masyarakat) bergaya dinamis di atas peta (desktop) atau di dalam hamburger menu (mobile).

### 🗺️ Pemetaan (Map Dashboard)
- **Peta Interaktif (Leaflet)**: Peta full-screen (mobile) atau boxed-container (desktop) dengan marker kustom (Kuning: Berlangsung, Hijau: Selesai).
- **Search Widget**: Bar pencarian melayang dengan dropdown hasil auto-complete untuk mencari desa/nama P3M secara instan.
- **Glassmorphism Sidebars**: Panel kiri (Daftar Kegiatan) dan Panel Kanan (Detail Kegiatan) dengan efek *blur* gaya iOS/Fintech.
- **Bottom Sheet Mobile**: Implementasi native-feel *bottom sheet* (swipe-to-dismiss) untuk melihat detail lokasi di layar sentuh perangkat genggam.
- **Extended FAB**: Tombol Floating Action Button (`+`) warna gradasi biru dengan animasi *hover slide-in text* ("Buat Pengajuan").

### 📋 Komponen Form Premium & Interaktif
- **Sistem Validasi Global**: Semua form mengadopsi standar UI yang terpusat (asterisk wajib, border merah untuk field kosong, ikon FontAwesome *prefix* di dalam input).
- **Testimonial Modal (React Portal)**: Form Tulis Testimoni 1-Layar (Overlay penuh) dengan *Interactive Star Rating* (1-5 Bintang). Render bersih melepaskan diri dari CSS sidebar menggunakan `ReactDOM.createPortal`.
- **Dynamic Array Inputs**: Pada form Dosen, input untuk "Personil Terlibat" (Dosen, Mahasiswa, Staff) bersifat dinamis (Bisa ditambah `+` atau dihapus `-` secara instan).
- **Premium File Dropzone**: Drag & drop area untuk mengunggah proposal PDF atau gambar dokumentasi dengan ikon *cloud-arrow-up* / *file-pdf*.
- **Toast Notifications**: Notifikasi pop-up cantik berwarna untuk umpan balik *Success* atau *Error* usai pengiriman form.

### 🚀 Pembaruan Khusus Dashboard Dosen (v2.0)
- **Inline Submission Card**: Integrasi form "Akses Pengajuan PKM" langsung di dalam dashboard utama untuk efisiensi input data.
- **Synchronized Map Layout**: Layout peta yang dinamis, otomatis menyesuaikan tinggi (`stretch`) dengan kolom konten dashboard di sebelahnya.
- **Floating Status System**: Tombol "Status Pengajuan" melayang yang ter-jangkar pada peta, menggantikan navbar statis untuk area pandang peta yang lebih luas.
- **Side-Menu Accordion**: Menu samping yang rapi (flush-left) untuk memantau status pengajuan secara real-time tanpa mengganggu navigasi utama.
- **Control Alignment**: Penyelarasan presisi Bar Pencarian (`MapSearchWidget`) dengan kontrol zoom peta di sisi kiri layar.

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