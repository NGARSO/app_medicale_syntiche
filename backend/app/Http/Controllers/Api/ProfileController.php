<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => 'required|string|unique:users,username,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6',
        ]);

        $user->username = $validated['username'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['message' => 'Profil mis à jour', 'user' => $user]);
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo_profil && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->photo_profil)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->photo_profil);
            }

            $path = $request->file('photo')->store('profiles', 'public');
            $user->photo_profil = $path;
            $user->save();

            return response()->json([
                'message' => 'Photo téléchargée avec succès',
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'Aucun fichier trouvé'], 400);
    }
}
