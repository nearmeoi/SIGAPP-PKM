<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
            $escaped = addcslashes($search, '\\%_');
            $query->where('name', 'like', "%{$escaped}%")
                ->orWhere('email', 'like', "%{$escaped}%");
        })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:superadmin,admin,dosen,masyarakat,secret_account',
            'nip' => 'required_if:role,dosen',
        ]);

        if ($request->role === 'dosen') {
            $pegawai = \App\Models\Pegawai::where('nip', $request->nip)->first();
            if (!$pegawai && !$request->boolean('force_create_pegawai')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'nip_not_found' => 'NIP tidak terdata di Data Pegawai.'
                ]);
            }
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'dosen') {
            if (isset($pegawai) && $pegawai) {
                $pegawai->update(['id_user' => $user->id_user]);
            } else {
                \App\Models\Pegawai::create([
                    'id_user' => $user->id_user,
                    'nip' => $request->nip,
                    'nama_pegawai' => $user->name,
                ]);
            }
        }

        return redirect()->back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id.',id_user',
            'role' => 'required|in:superadmin,admin,dosen,masyarakat,secret_account',
            'password' => 'nullable|string|min:8',
        ]);

        $user = User::findOrFail($id);
        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin' || $user->role === 'superadmin' || $user->role === 'secret_account') {
            $count = User::where('role', $user->role)->count();
            if ($count <= 1) {
                return redirect()->back()->with('error', 'Tidak bisa menghapus akun vital terakhir.');
            }
        }

        $user->delete();

        return redirect()->back()->with('success', 'User berhasil dihapus.');
    }
}
