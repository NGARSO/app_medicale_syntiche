<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $size = $request->get('size', 10);
        $sortBy = $request->get('sortBy', 'nom');
        return response()->json(Patient::orderBy($sortBy)->paginate($size));
    }

    public function search(Request $request)
    {
        $keyword = $request->get('keyword', '');
        $size = $request->get('size', 10);

        $patients = Patient::where('nom', 'LIKE', "%{$keyword}%")
            ->orWhere('prenom', 'LIKE', "%{$keyword}%")
            ->orWhere('cin', 'LIKE', "%{$keyword}%")
            ->orWhere('email', 'LIKE', "%{$keyword}%")
            ->paginate($size);

        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Infos Patient
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'cin'            => 'required|string|unique:patients',
            'email'          => 'nullable|email|unique:patients|unique:users,email',
            'telephone'      => 'required|string|max:20',
            'sexe'           => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|string|max:5',
            'antecedents'    => 'nullable|string',
            
            // Infos Compte (Optionnel mais recommandé)
            'username'       => 'nullable|string|unique:users',
            'password'       => 'nullable|string|min:6',
        ]);

        return DB::transaction(function () use ($validated) {
            $userId = null;

            // Création du compte si username/password fournis
            if (!empty($validated['username']) && !empty($validated['password'])) {
                $user = User::create([
                    'username' => $validated['username'],
                    'email'    => $validated['email'] ?? ($validated['username'] . '@patient.local'),
                    'password' => Hash::make($validated['password']),
                    'role'     => 'USER',
                ]);
                $userId = $user->id;
            }

            // Création du patient
            $profileData = collect($validated)->except(['username', 'password'])->toArray();
            $profileData['user_id'] = $userId;
            
            $patient = Patient::create($profileData);
            
            return response()->json($patient, 201);
        });
    }

    public function show($id)
    {
        return response()->json(Patient::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'cin'            => 'required|string|unique:patients,cin,' . $id,
            'email'          => 'nullable|email|unique:patients,email,' . $id,
            'telephone'      => 'required|string|max:20',
            'sexe'           => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|string|max:5',
            'antecedents'    => 'nullable|string',
        ]);

        $patient->update($validated);
        return response()->json($patient);
    }

    public function destroy($id)
    {
        Patient::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
