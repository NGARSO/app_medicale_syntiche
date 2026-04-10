<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Gate;

class UserController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if ($request->user()->role !== 'ADMIN') {
            abort(403, 'Accès interdit. Seul un administrateur peut effectuer cette action.');
        }
    }

    public function index(Request $request)
    {
        $this->checkAdmin($request);
        return response()->json(User::orderBy('id', 'desc')->paginate(10));
    }

    public function store(Request $request)
    {
        $this->checkAdmin($request);
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:ADMIN,USER,MEDECIN',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        return response()->json($user, 201);
    }

    public function show(Request $request, $id)
    {
        $this->checkAdmin($request);
        return response()->json(User::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $this->checkAdmin($request);
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'username' => 'required|string|unique:users,username,' . $id,
            'email'    => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role'     => 'required|in:ADMIN,USER,MEDECIN',
        ]);

        $user->username = $validated['username'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        return response()->json($user);
    }

    public function destroy(Request $request, $id)
    {
        $this->checkAdmin($request);
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 400);
        }

        $user->delete();
        return response()->json(null, 204);
    }
}
