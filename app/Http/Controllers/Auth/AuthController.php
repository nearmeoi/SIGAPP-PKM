<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Pegawai;
use App\Models\Pengajuan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Redirect URL berdasarkan role user.
     */
    private function dashboardUrl(): string
    {
        return Auth::user()?->role === 'admin' ? '/admin/dashboard' : '/';
    }

    public function showLogin()
    {
        if (Auth::check()) {
            return redirect($this->dashboardUrl());
        }

        return Inertia::render('Auth/Login');
    }

    public function showLoginDosen(Request $request)
    {
        if (Auth::check()) {
            return redirect($this->dashboardUrl());
        }

        return Inertia::render('Auth/LoginDosenPortal', [
            'initialNip' => $request->query('nip'),
            'autoCheck' => $request->boolean('autocheck'),
        ]);
    }

    public function checkNip(Request $request)
    {
        $request->validate([
            'nip' => ['required', 'regex:/^\d{18}$/'],
        ], [
            'nip.regex' => 'NIP harus terdiri dari 18 digit angka.',
        ]);

        $pegawai = Pegawai::where('nip', $request->nip)->first();

        if (! $pegawai) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'NIP belum memiliki akun dosen. Silakan lengkapi data registrasi.',
            ]);
        }

        if ($pegawai->id_user) {
            $user = User::where('id_user', $pegawai->id_user)->first();

            return response()->json([
                'status' => 'registered',
                'email' => $user->email,
                'name' => $user->name,
                'message' => 'NIP sudah terdaftar. Silakan masukkan kata sandi.',
            ]);
        }

        return response()->json([
            'status' => 'claimable',
            'name' => $pegawai->nama_pegawai,
            'message' => 'NIP ditemukan. Silakan lengkapi data registrasi Anda.',
        ]);
    }

    public function showLoginMasyarakat(Request $request)
    {
        if (Auth::check()) {
            return redirect($this->dashboardUrl());
        }

        $user = $request->user();
        $pkmData = Pengajuan::with(['aktivitas.testimoni', 'timKegiatan', 'jenisPkm'])
            ->whereNotNull('latitude')
            ->get()
            ->map(fn ($pengajuan) => [
                'id' => $pengajuan->id_pengajuan,
                'nama' => $pengajuan->judul_kegiatan,
                'tahun' => $pengajuan->created_at?->year ?? date('Y'),
                'jenis_pkm' => $pengajuan->jenisPkm?->nama_jenis ?? '',
                'status' => ($pengajuan->status_pengajuan === 'selesai' || $pengajuan->aktivitas?->status_pelaksanaan === 'selesai')
                    ? 'selesai'
                    : (in_array($pengajuan->status_pengajuan, ['berlangsung', 'diterima']) ? 'berlangsung' : ($pengajuan->status_pengajuan === 'belum_diajukan' ? 'belum_mulai' : 'ada_pengajuan')),
                'deskripsi' => $pengajuan->kebutuhan ?? '',
                'thumbnail' => $pengajuan->aktivitas?->url_thumbnail ?? '',
                'provinsi' => $pengajuan->provinsi ?? '',
                'kabupaten' => $pengajuan->kota_kabupaten ?? '',
                'kecamatan' => $pengajuan->kecamatan ?? '',
                'desa' => $pengajuan->kelurahan_desa ?? '',
                'lat' => (float) ($pengajuan->latitude ?? 0),
                'lng' => (float) ($pengajuan->longitude ?? 0),
                'total_anggaran' => $pengajuan->total_anggaran ?? 0,
                'tim_kegiatan' => $pengajuan->timKegiatan->map(fn ($tim) => [
                    'nama' => $tim->nama_anggota,
                    'peran' => $tim->peran,
                ])->toArray(),
                'testimoni' => ($pengajuan->aktivitas?->testimoni ?? collect())->map(fn ($testimoni) => [
                    'nama_pemberi' => $testimoni->nama_pemberi,
                    'rating' => (int) $testimoni->rating,
                    'pesan_ulasan' => $testimoni->pesan_ulasan,
                ])->toArray(),
            ]);

        return Inertia::render('Auth/LoginMasyarakat', [
            'auth' => [
                'user' => $user
                    ? [
                        'id' => $user->id_user,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role ?? 'masyarakat',
                        'avatar' => $user->avatar ?? null,
                    ]
                    : [
                        'id' => 'preview-masyarakat',
                        'name' => 'Akun Masyarakat SIGAP',
                        'email' => 'masyarakat@poltekparmakassar.ac.id',
                        'role' => 'masyarakat',
                        'avatar' => null,
                    ],
            ],
            'pkmData' => $pkmData,
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        $loginSource = $request->input('login_source', 'general');

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if ($user->role === 'dosen' && $loginSource !== 'dosen') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()
                    ->route('login')
                    ->with('error', 'Akun dosen harus masuk melalui tombol "Akses sebagai Akun Dosen" di bawah.');
            }

            if ($user->role === 'masyarakat' && $loginSource === 'dosen') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()
                    ->route('login.dosen')
                    ->with('error', 'Akun masyarakat harus login melalui Login Umum.');
            }

            $default = $user->role === 'admin' ? '/admin/dashboard' : '/';

            return redirect()->intended($default);
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ])->onlyInput('email');
    }

    public function showRegister(Request $request)
    {
        if (Auth::check()) {
            return redirect($this->dashboardUrl());
        }

        $preferredRole = $request->query('role') === 'dosen' ? 'dosen' : 'masyarakat';

        return Inertia::render('Auth/Register', [
            'preferredRole' => $preferredRole,
        ]);
    }

    public function register(Request $request)
    {
        $preferredRole = $request->query('role') === 'dosen' ? 'dosen' : 'masyarakat';
        $portalDosenFlow = $request->query('source') === 'portal-dosen';

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'nip' => [$preferredRole === 'dosen' ? 'required' : 'nullable', 'regex:/^\d{18}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'nip.required' => 'NIP wajib diisi untuk registrasi dosen.',
            'nip.regex' => 'NIP harus terdiri dari 18 digit angka.',
        ]);

        $role = 'masyarakat';
        $pegawai = null;

        if ($request->filled('nip')) {
            $pegawai = Pegawai::where('nip', $request->nip)->first();

            if ($pegawai && $pegawai->id_user) {
                return back()->withErrors([
                    'nip' => 'NIP ini sudah terhubung ke akun dosen. Silakan login menggunakan email dan kata sandi Anda.',
                ])->withInput();
            }

            $role = 'dosen';
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
        ]);

        if ($role === 'dosen') {
            if ($pegawai) {
                $pegawai->update([
                    'id_user' => $user->id_user,
                    'nama_pegawai' => $request->name,
                ]);
            } else {
                Pegawai::create([
                    'id_user' => $user->id_user,
                    'nip' => $request->nip,
                    'nama_pegawai' => $request->name,
                    'jabatan' => 'Dosen',
                    'posisi' => 'Akun Portal Dosen',
                ]);
            }
        }

        if ($portalDosenFlow && $role === 'dosen') {
            return redirect()
                ->route('login.dosen', [
                    'nip' => $request->nip,
                    'autocheck' => 1,
                ])
                ->with('success', 'Akun dosen berhasil terdaftar. Silakan lanjut masuk dengan kata sandi yang baru dibuat.');
        }

        Auth::login($user);

        $redirectTo = $user->role === 'admin' ? '/admin/dashboard' : '/';

        return redirect($redirectTo);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
