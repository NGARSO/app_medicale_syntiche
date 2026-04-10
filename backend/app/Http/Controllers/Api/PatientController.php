<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

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
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'cin'            => 'required|string|unique:patients',
            'email'          => 'nullable|email|unique:patients',
            'telephone'      => 'required|string|max:20',
            'sexe'           => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|string|max:5',
            'antecedents'    => 'nullable|string',
        ]);

        return response()->json(Patient::create($validated), 201);
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
