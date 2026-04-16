<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MedecinController extends Controller
{
    public function index(Request $request)
    {
        $size = $request->get('size', 10);
        return response()->json(Medecin::with('disponibilites')->paginate($size));
    }

    public function search(Request $request)
    {
        $keyword = $request->get('keyword', '');
        $size = $request->get('size', 10);

        $medecins = Medecin::with('disponibilites')
            ->where('nom', 'LIKE', "%{$keyword}%")
            ->orWhere('prenom', 'LIKE', "%{$keyword}%")
            ->orWhere('specialite', 'LIKE', "%{$keyword}%")
            ->paginate($size);

        return response()->json($medecins);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Infos Médecin
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'specialite' => 'required|string|max:100',
            'email'      => 'required|email|unique:medecins|unique:users,email',
            'telephone'  => 'required|string|max:20',
            'matricule'  => 'nullable|string|unique:medecins',
            'disponible' => 'boolean',

            // Infos Compte (Optionnel mais recommandé)
            'username'   => 'nullable|string|unique:users',
            'password'   => 'nullable|string|min:6',
        ]);

        return DB::transaction(function () use ($validated) {
            $userId = null;

            // Création du compte si username/password fournis
            if (!empty($validated['username']) && !empty($validated['password'])) {
                $user = User::create([
                    'username' => $validated['username'],
                    'email'    => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role'     => 'MEDECIN',
                ]);
                $userId = $user->id;
            }

            // Création du médecin
            $profileData = collect($validated)->except(['username', 'password'])->toArray();
            $profileData['user_id'] = $userId;

            // Génération du matricule si non fourni
            if (empty($profileData['matricule'])) {
                $year = date('Y');
                $count = Medecin::whereYear('created_at', $year)->count() + 1;
                $profileData['matricule'] = sprintf('MED-%s-%04d', $year, $count);
                
                // Double check uniqueness (though count+1 is usually fine for small systems)
                while (Medecin::where('matricule', $profileData['matricule'])->exists()) {
                    $count++;
                    $profileData['matricule'] = sprintf('MED-%s-%04d', $year, $count);
                }
            }
            
            $medecin = Medecin::create($profileData);
            
            return response()->json($medecin, 201);
        });
    }

    public function show($id)
    {
        return response()->json(Medecin::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $medecin = Medecin::findOrFail($id);

        $validated = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'specialite' => 'required|string|max:100',
            'email'      => 'required|email|unique:medecins,email,' . $id,
            'telephone'  => 'required|string|max:20',
            'matricule'  => 'required|string|unique:medecins,matricule,' . $id,
            'disponible' => 'boolean',
        ]);

        $medecin->update($validated);
        return response()->json($medecin);
    }

    public function destroy($id)
    {
        Medecin::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
