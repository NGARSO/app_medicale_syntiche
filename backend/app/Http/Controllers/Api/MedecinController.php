<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medecin;
use Illuminate\Http\Request;

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
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'specialite' => 'required|string|max:100',
            'email'      => 'required|email|unique:medecins',
            'telephone'  => 'required|string|max:20',
            'matricule'  => 'required|string|unique:medecins',
            'disponible' => 'boolean',
        ]);

        return response()->json(Medecin::create($validated), 201);
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
