# SIGAP PKM - Frontend Progress Documentation

Frontend untuk Sistem Informasi Geospasial dan Akses Pelayanan Pengabdian Kepada Masyarakat (SIGAP PKM) Politeknik Pariwisata Makassar.

README ini mendeskripsikan evolusi frontend SIGAP PKM berdasarkan:

- branch `fe`
- branch `fe-2`
- working tree sekarang di atas `fe-2`

Dokumen ini ditulis untuk merekam kondisi frontend terbaru yang akan dipush sebagai branch `fe-3`.

## 1. Status Pengembangan Saat Ini

Saat README ini diperbarui:

- branch aktif lokal: `fe-2`
- remote repository: `https://github.com/githubnyabintang/SIGAP-P3M.git`
- project sudah memiliki pengembangan lanjutan di working tree lokal yang belum dipush
- kondisi kerja sekarang adalah state baru yang akan dipisahkan ke branch `fe-3`

Artinya, isi README ini tidak hanya menjelaskan isi branch `fe-2`, tetapi juga menjelaskan keseluruhan implementasi terbaru yang sudah ada di project lokal saat ini sebagai kandidat final `fe-3`.

## 2. Ringkasan Perbandingan Branch

### Branch `fe`

Branch `fe` adalah fondasi frontend awal. Fokus utamanya masih pada:

- landing page berbasis peta
- autentikasi dasar
- struktur halaman React + Inertia
- styling dasar untuk peta, auth, dan layout umum

Pada tahap ini project sudah memiliki arah visual SIGAP PKM, tetapi belum sedalam versi sekarang dari sisi:

- pemisahan pengalaman desktop dan mobile
- alur akses pengajuan yang kompleks
- pengelolaan status pengajuan per user
- komponen feedback submit yang seragam
- splash screen mobile
- helper data untuk integrasi backend

### Branch `fe-2`

Branch `fe-2` adalah hasil pengembangan lanjutan dari branch `fe` berdasarkan diskusi antara Front-End dan Back-End.

Secara konteks kerja, branch ini merupakan hasil diskusi dengan Akmal selaku Back-End Developer terkait UI/UX dari branch `fe`, lalu diterjemahkan ke implementasi frontend yang lebih matang.

Dari hasil diff `fe..fe-2`, area yang paling berkembang adalah:

- `LandingPage`
- `LoginDosen`
- `DosenSubmissionCard`
- `SubmitDokumentasiLaporan`
- `landing.css`
- `login.css`

Secara umum `fe-2` sudah membawa:

- dashboard dosen yang jauh lebih kaya
- kartu akses pengajuan PKM inline
- status pengajuan yang lebih jelas
- komponen chart dan insight yang lebih matang
- form dan visual yang lebih premium dibanding fondasi di `fe`

### Kondisi Project Lokal Saat Ini

Kondisi lokal sekarang adalah eksplorasi lanjutan yang dibuat secara mandiri dari sisi Front-End Developer untuk menyiapkan opsi frontend lain.

State ini diposisikan sebagai branch `fe-3`, yaitu versi yang disiapkan oleh saya selaku Front-End Developer untuk menawarkan opsi lanjutan yang berbeda dari `fe-2` dan akan dipaparkan ke Project Lead, yaitu Fikri.

Dari diff terhadap `fe-2`, perubahan paling dominan ada di:

- `LandingPage.jsx`
- `LoginDosen.jsx`
- `LoginMasyarakat.jsx`
- `DosenSubmissionCard.jsx`
- `landing.css`
- `lecturer-form.css`
- file-file mobile baru
- helper data baru
- popup feedback baru

Secara praktis, state project sekarang sudah mencakup:

- dual experience desktop dan mobile yang dipisahkan dengan lebih rapi
- landing page mobile khusus
- login dosen mobile khusus
- login masyarakat mobile khusus
- splash screen mobile
- status pengajuan dan status PKM yang lebih konsisten
- akses pengajuan PKM dengan alur dosen dan masyarakat yang dipisahkan tapi seragam
- lapisan fallback data dummy yang siap digantikan backend
- sistem popup sukses/error yang seragam

## 3. Gambaran Besar Project Sekarang

Project ini sekarang berfungsi sebagai frontend SIGAP PKM dengan empat area pengalaman utama:

1. Landing page publik
2. Login dan akses dosen
3. Login dan akses masyarakat
4. Halaman submit dokumentasi/laporan dan halaman pendukung autentikasi

Selain itu ada satu halaman utilitas tambahan:

- `MapDashboard.jsx`

Halaman ini masih berfungsi sebagai area pengelolaan/pengujian frontend untuk peta dan entri data dummy.

## 4. Halaman dan Fitur yang Ada Sekarang

### 4.1 Landing Page

File utama:

- `resources/js/Pages/LandingPage.jsx`
- `resources/js/Components/LandingPageMobile.jsx`
- `resources/css/landing.css`
- `resources/css/landing-mobile.css`

Fitur landing page saat ini:

- peta sebaran PKM publik
- marker status kegiatan PKM
- legenda status PKM
- ringkasan total PKM, PKM selesai, dan PKM berlangsung
- sidebar daftar kegiatan
- sidebar detail titik PKM
- chart evaluasi PKM
- akses pengajuan PKM dari halaman publik
- menu dan navigasi publik P3M

#### Desktop Landing Page

Versi desktop tetap menggunakan shell utama landing page dengan:

- header web
- peta utama
- panel insight
- area chart
- kartu akses pengajuan

Desktop dijaga agar tidak tercampur dengan eksperimen mobile.

#### Mobile Landing Page

Versi mobile sekarang dipisahkan ke komponen khusus dan memiliki karakter seperti aplikasi mobile:

- bottom tab navbar khusus mobile
- tab `Menu`
- tab `Peta`
- tab `Dashboard`
- tab `Akses`
- tab `Login`
- sidebar drawer menu khusus mobile
- sidebar detail titik PKM khusus mobile
- tata letak map satu layar ala aplikasi map
- splash screen mobile-only

Hal penting:

- tab navbar bawah hanya tampil di mobile
- desktop tidak ikut menampilkan navbar bawah
- sidebar menu dan sidebar titik PKM memakai logika mobile yang terpisah dari desktop

### 4.2 Login Dosen

File utama:

- `resources/js/Pages/Auth/LoginDosen.jsx`
- `resources/js/Components/LoginDosenMobile.jsx`
- `resources/js/Components/DosenSubmissionCard.jsx`
- `resources/css/login-dosen-mobile.css`

Login dosen sekarang bukan hanya halaman login visual, tetapi halaman akun dosen dengan beberapa mode:

- peta kegiatan user
- dashboard evaluasi PKM
- akses pengajuan PKM
- kegiatan dan riwayat
- status pengajuan
- status PKM berlangsung/selesai

#### Desktop Login Dosen

Versi desktop memiliki:

- peta akun dosen
- sidebar aktivitas
- dashboard evaluasi
- kartu akses pengajuan PKM
- status pengajuan
- mode status PKM berlangsung
- mode status PKM selesai
- dokumentasi dan testimoni pada mode selesai

Di bagian akses pengajuan, logika status saat ini adalah:

- `belum_diajukan` menampilkan form pengajuan
- `diproses` menampilkan status diproses
- `ditangguhkan` menampilkan status revisi dan unggah revisi
- `ditolak` menampilkan status ditolak dan opsi pengajuan baru
- `diterima` menampilkan status diterima
- `berlangsung` menampilkan kartu PKM berlangsung
- `selesai` menampilkan kartu PKM selesai

#### Mobile Login Dosen

Versi mobile dosen mengikuti pola mobile landing, tetapi dengan konteks akun dosen:

- splash screen mobile
- bottom tab navbar mobile
- tab `Menu`
- tab `Peta`
- tab `Dashboard`
- tab `Akses`
- tab `Logout`
- drawer menu dengan info `Akun Dosen`
- ringkasan status pengajuan di drawer
- ringkasan status pengajuan di area akses
- toggle mobile untuk `Pengajuan PKM` dan `Kegiatan & Riwayat`

### 4.3 Login Masyarakat

File utama:

- `resources/js/Pages/Auth/LoginMasyarakat.jsx`
- `resources/js/Components/LoginMasyarakatMobile.jsx`
- `resources/js/Components/MasyarakatSubmissionCard.jsx`
- `resources/css/masyarakat-form.css`

Login masyarakat sekarang mengadopsi shell interaksi yang sama dengan dosen, tetapi isi form mengikuti kebutuhan masyarakat.

#### Desktop Login Masyarakat

Versi desktop memiliki:

- peta akun masyarakat
- dashboard evaluasi
- kartu akses pengajuan PKM
- status pengajuan masyarakat
- status PKM berlangsung/selesai
- kegiatan dan riwayat

#### Mobile Login Masyarakat

Versi mobile masyarakat mengadopsi arsitektur `LoginDosenMobile`, dengan penyesuaian:

- drawer menampilkan `Akun Masyarakat`
- deskripsi menu mengikuti konteks masyarakat
- status pengajuan masyarakat tampil di drawer dan di atas area akses
- layout mobile tetap konsisten dengan dosen
- isi form tetap form masyarakat

### 4.4 Akses Pengajuan PKM

Ini adalah area yang paling banyak berkembang di project saat ini.

#### Dosen

File utama:

- `resources/js/Components/DosenSubmissionCard.jsx`
- `resources/js/Components/LecturerSubmissionForm.jsx`
- `resources/css/lecturer-form.css`

Fitur pengajuan dosen:

- form inline
- validasi field wajib
- validasi struktur tim
- minimal satu dari dosen/staf/mahasiswa harus dipilih
- entry dinamis untuk dosen/staf/mahasiswa
- validasi entry tambahan yang kosong
- upload proposal
- alur revisi
- alur pengajuan baru setelah ditolak/selesai
- tab `Pengajuan PKM`
- tab `Kegiatan & Riwayat`

#### Masyarakat

File utama:

- `resources/js/Components/MasyarakatSubmissionCard.jsx`
- `resources/js/Components/GeneralSubmissionForm.jsx`

Fitur pengajuan masyarakat:

- form inline
- field masyarakat tetap dipertahankan
- upload surat permohonan PDF
- link teks untuk unduh template surat permohonan
- status pengajuan masyarakat
- status PKM berlangsung/selesai
- riwayat pengajuan

### 4.5 Submit Dokumentasi dan Laporan

File utama:

- `resources/js/Pages/Auth/SubmitDokumentasiLaporan.jsx`

Fitur:

- submit tautan dokumentasi
- submit laporan
- validasi field wajib
- popup feedback sukses/error yang seragam

### 4.6 Halaman Autentikasi Pendukung

File:

- `resources/js/Pages/Auth/Login.jsx`
- `resources/js/Pages/Auth/Register.jsx`
- `resources/js/Pages/Auth/VerifyEmail.jsx`

Fungsi:

- login umum
- registrasi
- verifikasi email

### 4.7 Map Dashboard

File:

- `resources/js/Pages/MapDashboard.jsx`

Peran saat ini:

- area pengelolaan/pengujian frontend
- entri data peta
- pengujian submit link
- popup feedback seragam

## 5. Komponen Shared Penting

Beberapa komponen penting yang sekarang menjadi fondasi bersama:

- `resources/js/Components/ActionFeedbackDialog.jsx`
- `resources/js/Components/MobileSplashScreen.jsx`
- `resources/js/Components/LandingCharts.jsx`
- `resources/js/Components/DocumentationGallery.jsx`
- `resources/js/Components/TestimonialForm.jsx`
- `resources/js/Components/TestimonialSidebarDisplay.jsx`
- `resources/js/Components/BottomSheet.jsx`
- `resources/js/Components/MobileTabBar.jsx`

Fungsi masing-masing:

- `ActionFeedbackDialog.jsx`
  popup seragam untuk sukses/error submit

- `MobileSplashScreen.jsx`
  splash screen mobile-only berbasis session tab

- `LandingCharts.jsx`
  chart evaluasi PKM yang dipakai di landing dan dashboard akun

- `DocumentationGallery.jsx`
  area tampilan dokumentasi kegiatan

- `TestimonialForm.jsx`
  form kirim testimoni

- `TestimonialSidebarDisplay.jsx`
  tampilan testimoni di panel kegiatan

- `BottomSheet.jsx`
  panel bawah mobile untuk detail

- `MobileTabBar.jsx`
  tab navbar bawah mobile

## 6. Sistem Validasi dan Feedback Form

Project sekarang sudah jauh lebih seragam dibanding sebelumnya.

Standar yang sudah diterapkan:

- tombol submit nonaktif bila field wajib belum lengkap
- warning visual muncul saat user sudah mulai mengisi tapi belum lengkap
- popup sukses/error menggunakan komponen yang sama
- validasi khusus untuk struktur tim dosen
- validasi file upload
- validasi revisi

Form yang sudah memakai pola ini:

- pengajuan dosen
- pengajuan masyarakat
- testimonial
- general submission
- submit dokumentasi/laporan
- data entry tambahan pada landing/map dashboard

## 7. Arsitektur Data Dummy dan Kesiapan Backend

File terpenting:

- `resources/js/data/sigapData.js`

Tujuan file ini adalah memisahkan:

- data demo frontend
- data nyata dari backend

Pola yang sekarang dipakai:

- jika backend mengirim array data, frontend memakai data backend
- jika backend belum mengirim data dan demo mode aktif, frontend memakai fallback dummy
- jika demo mode dimatikan, frontend tidak akan menampilkan dummy

Flag environment:

- `VITE_ENABLE_SIGAP_DEMO_DATA=true`

Jika diubah menjadi:

- `VITE_ENABLE_SIGAP_DEMO_DATA=false`

maka fallback dummy akan mati.

### Kontrak Data yang Sudah Disiapkan

Landing page siap menerima:

- `publicPkmData`

Login dosen siap menerima:

- `userPkmData`
- `userSubmissionData`
- `userSubmissionHistory`

Login masyarakat siap menerima:

- `userPkmData`
- `userSubmissionData`
- `userSubmissionHistory`

### Catatan Penting

Walaupun wadah backend sudah siap, sebagian alur submit saat ini masih mock di frontend, misalnya:

- perubahan status lokal setelah submit
- simulasi delay dengan `setTimeout`
- penambahan data pengajuan ke state lokal

Artinya:

- struktur integrasi backend sudah aman disiapkan
- dummy data bisa dimatikan saat deploy
- tetapi endpoint backend nyata masih perlu dihubungkan agar semua submit benar-benar persist ke database

## 8. Mobile-Only Enhancements yang Sudah Ada

Bagian ini tidak ada atau belum matang di branch lebih awal, tetapi sekarang sudah ada:

- mobile landing page khusus
- mobile login dosen khusus
- mobile login masyarakat khusus
- tab navbar bawah yang menempel ke layar
- drawer menu mobile
- sidebar detail PKM mobile
- scroll vertical-only untuk pengalaman mobile
- splash screen mobile-only
- pemisahan styling mobile agar desktop tidak ikut berubah

File styling baru yang mendukung ini:

- `resources/css/landing-mobile.css`
- `resources/css/login-dosen-mobile.css`
- `resources/css/mobile-splash.css`

## 9. Routing yang Tersedia

Route yang sekarang aktif:

- `/` -> `LandingPage`
- `/login` -> `Auth/Login`
- `/register` -> `Auth/Register`
- `/submit-dokumentasi-laporan` -> `Auth/SubmitDokumentasiLaporan`
- `/verify-email` -> `Auth/VerifyEmail`
- `/login/dosen` -> `Auth/LoginDosen`
- `/login/masyarakat` -> `Auth/LoginMasyarakat`
- `POST /logout` -> logout session

File route:

- `routes/web.php`

## 10. Tech Stack

Project ini menggunakan:

- Laravel
- Inertia.js React
- React 19
- Vite
- Leaflet
- React Leaflet
- Chart.js
- React Chart.js 2
- Font Awesome

File referensi:

- `package.json`

## 11. Struktur File Penting

### Pages

```text
resources/js/Pages/
|-- LandingPage.jsx
|-- MapDashboard.jsx
`-- Auth/
    |-- Login.jsx
    |-- Register.jsx
    |-- VerifyEmail.jsx
    |-- LoginDosen.jsx
    |-- LoginMasyarakat.jsx
    `-- SubmitDokumentasiLaporan.jsx
```

### Components

```text
resources/js/Components/
|-- ActionFeedbackDialog.jsx
|-- BottomSheet.jsx
|-- DocumentationGallery.jsx
|-- DosenSubmissionCard.jsx
|-- Footer.jsx
|-- GeneralSubmissionForm.jsx
|-- Header.jsx
|-- LandingCharts.jsx
|-- LandingPageMobile.jsx
|-- LecturerSubmissionForm.jsx
|-- LoginDosenMobile.jsx
|-- LoginMasyarakatMobile.jsx
|-- MasyarakatSubmissionCard.jsx
|-- MobileSplashScreen.jsx
|-- MobileTabBar.jsx
|-- TestimonialForm.jsx
|-- TestimonialSidebarDisplay.jsx
`-- Toast.jsx
```

### CSS

```text
resources/css/
|-- app.css
|-- auth-layout.css
|-- documentation-gallery.css
|-- form-components.css
|-- landing.css
|-- landing-mobile.css
|-- lecturer-form.css
|-- login.css
|-- login-dosen-mobile.css
|-- masyarakat-form.css
|-- mobile-splash.css
|-- testimonial-sidebar.css
`-- verify-email.css
```

### Data Helper

```text
resources/js/data/
`-- sigapData.js
```

## 12. Cara Menjalankan Project

### Prasyarat

- PHP 8.x
- Composer
- Node.js 18+
- npm

### Instalasi

```bash
git clone https://github.com/githubnyabintang/SIGAP-P3M.git
cd SIGAP-P3M
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Jika memakai Windows PowerShell, copy env bisa dilakukan dengan:

```powershell
Copy-Item .env.example .env
```

### Development

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

## 13. Ringkasan Kondisi Project Saat Ini

Jika dirangkum, project sekarang sudah memiliki:

- landing page publik desktop dan mobile yang berbeda tetapi konsisten
- login dosen desktop dan mobile
- login masyarakat desktop dan mobile
- splash screen mobile-only
- kartu akses pengajuan PKM yang jauh lebih matang
- validasi submit yang seragam
- popup feedback sukses/error yang seragam
- helper data dummy vs backend
- readiness untuk integrasi data per-user

Dengan kata lain, dibanding `fe` dan `fe-2`, kondisi project sekarang sudah berada pada tahap frontend yang jauh lebih siap untuk:

- finishing integrasi backend
- pengosongan dummy data saat deploy
- penguncian flow per user
- publikasi lanjutan sebagai tahap berikut pengembangan

## 14. Catatan Pengembangan

README ini menjelaskan kondisi frontend terbaru yang diposisikan sebagai isi branch `fe-3`, yaitu opsi pengembangan lanjutan dari sisi Front-End Developer untuk dipaparkan ke Project Lead.
