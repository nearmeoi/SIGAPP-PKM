# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development** (run in parallel terminals):
```bash
php artisan serve        # Laravel backend (default: localhost:8000)
npm run dev              # Vite frontend dev server
```

**Database**:
```bash
php artisan migrate --seed        # Run migrations + seed
php artisan migrate:fresh --seed  # Full reset + seed
```

**Build & Validation**:
```bash
npm run build
php -l app/Http/Controllers/Admin/PengajuanController.php   # PHP syntax check
php -l app/Http/Controllers/User/PengajuanUserController.php
```

## Architecture

This is a **Laravel 12 + Inertia.js + React 19 (TypeScript)** monorepo. The server renders page components via Inertia — there is no separate API/SPA. Shared props (auth user, flash messages) are injected globally via `HandleInertiaRequests.php`.

### Backend Structure

Controllers are split into three namespaces:
- `Admin/` — CRUD for all admin panel modules, guarded by `middleware('admin')`
- `Auth/` — login, register, NIP check for dosen
- `User/` — public-facing pengajuan (submission) form and status check

**Middleware**:
- `admin` — restricts `/admin/*` routes to users with `role = 'admin'`
- `secret` — restricts `/secret/*` routes to superadmin
- `guest` — redirects authenticated users away from login/register pages

**Dosen login flow**: NIP is checked against the `pegawai` table (`/check-nip`) before allowing registration. Dosen accounts must have a matching NIP in pegawai to register.

### Core Model: `Pengajuan`

The `Pengajuan` model (`app/Models/Pengajuan.php`) is the central entity:
- Primary key: `id_pengajuan` (non-standard, not `id`)
- Uses `SoftDeletes`
- `tipe_pengusul`: `'dosen'` or `'masyarakat'` — determines which form view/detail view admin sees
- `rab_items`: JSON column (cast as `array`) for budget line items
- `status_pengajuan` lifecycle: `diproses → diterima/direvisi/ditolak → selesai`
- Scopes: `notifikasi()` (diproses + direvisi), `belumDibaca()` (unread notifications)
- Admin cannot update status if required fields are incomplete

**Relation chain**: `Pengajuan → Aktivitas → Arsip/Testimoni`

### Frontend Structure

Pages live in `resources/js/Pages/` mirroring route structure:
- `Admin/` — all admin dashboard pages, wrapped in `AdminLayout`
- `Auth/` — login, register, pengajuan form, verify email
- `Public/` — public-facing pages (testimoni, arsip, evaluasi)
- `LandingPage.tsx` — the main landing page with map, charts, and CTAs

Key components:
- `AdminLayout.tsx` — sidebar nav, notification bell, command palette, toast
- `pkmMapVisuals.ts` — Leaflet marker creation, PKM type color extraction, status metadata. All map/chart color logic derives from here using `extractDynamicPkmTypes()`
- `AdminEvalCharts.tsx`, `LandingCharts.tsx` — Chart.js wrappers
- `PkmMapDashboardCard.tsx` — floating map card with sidebar

### SQLite Compatibility

`AppServiceProvider` injects custom `YEAR()` and `FIELD()` SQL functions for SQLite. This allows local dev with SQLite while production uses MySQL. When writing raw queries, use `YEAR()` and `FIELD()` freely — they work in both environments.

### Geocoding

Nominatim API is proxied via:
- `GET /api/geocode?q=` — forward geocode (rate limited: 30/min)
- `GET /api/reverse-geocode?lat=&lon=` — reverse geocode

These are internal routes; the frontend calls them to avoid CORS and browser-side rate limiting.

## Design System

See `DESIGN_SYSTEM.md` for the full UI standard. Key rules:
- **Primary color**: `#046bd2` (Poltekpar blue) — use this for primary buttons and focus rings, not Tailwind `blue-*` shades
- **Icons**: Lucide React only (`w-4 h-4` inline, `w-5 h-5` standard, `w-6 h-6` stat cards)
- **Map floating elements**: always `bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200`
- **Status colors**: emerald = selesai/success, amber = diproses/warning, rose = ditolak/danger
- **Font**: Plus Jakarta Sans (matches Poltekpar branding)
- **Rounded corners**: `rounded-xl` for cards, `rounded-md` for inputs/buttons, `rounded-full` for badges

All new UI elements must follow the patterns in DESIGN_SYSTEM.md before implementation.

## Test Accounts

See `database/seeders/UserSeeder.php` for admin and dosen dummy accounts.
