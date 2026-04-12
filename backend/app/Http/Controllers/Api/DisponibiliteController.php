<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Disponibilite;

class DisponibiliteController extends Controller
{
    public function index(Request $request)
    {
        $medecinId = $request->get('medecin_id');
        $query = Disponibilite::with('medecin');
        if ($medecinId) $query->where('medecin_id', $medecinId);
        return response()->json($query->orderBy('jour_semaine')->orderBy('heure_debut')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medecin_id'   => 'required|exists:medecins,id',
            'jour_semaine' => 'required|integer|min:0|max:6',
            'heure_debut'  => 'required',
            'heure_fin'    => 'required|after:heure_debut',
            'actif'        => 'boolean'
        ]);

        $disp = Disponibilite::create($validated);
        return response()->json($disp, 201);
    }

    public function update(Request $request, $id)
    {
        $disp = Disponibilite::findOrFail($id);
        $validated = $request->validate([
            'jour_semaine' => 'required|integer|min:0|max:6',
            'heure_debut'  => 'required',
            'heure_fin'    => 'required|after:heure_debut',
            'actif'        => 'boolean'
        ]);

        $disp->update($validated);
        return response()->json($disp);
    }

    public function destroy($id)
    {
        Disponibilite::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
