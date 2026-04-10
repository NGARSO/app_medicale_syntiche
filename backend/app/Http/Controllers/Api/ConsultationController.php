<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConsultationController extends Controller
{
    /**
     * Liste des consultations filtrée par rôle
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Consultation::with(['patient', 'medecin', 'ordonnance']);

        if ($user->role === 'MEDECIN') {
            $query->where('medecin_id', $user->medecin->id);
        } elseif ($user->role === 'USER') {
            $query->where('patient_id', $user->patient->id);
        }

        return response()->json($query->orderBy('date_consultation', 'desc')->paginate(10));
    }

    /**
     * Création d'une consultation
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'rendez_vous_id' => 'nullable|exists:rendez_vous,id',
            'date_consultation' => 'required|date',
            'motif' => 'required|string',
            'diagnostic' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'tension' => 'nullable|string',
            'temperature' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        // Si c'est un médecin qui crée, on force son medecin_id
        if ($user->role === 'MEDECIN') {
            $validated['medecin_id'] = $user->medecin->id;
        } else {
            $request->validate(['medecin_id' => 'required|exists:medecins,id']);
            $validated['medecin_id'] = $request->medecin_id;
        }

        $consultation = Consultation::create($validated);
        
        return response()->json($consultation->load(['patient', 'medecin']), 201);
    }

    /**
     * Détails d'une consultation
     */
    public function show($id)
    {
        $user = Auth::user();
        $consultation = Consultation::with(['patient', 'medecin', 'ordonnance.items'])->findOrFail($id);

        // Vérification des droits d'accès
        if ($user->role === 'MEDECIN' && $consultation->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        if ($user->role === 'USER' && $consultation->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        return response()->json($consultation);
    }

    /**
     * Mise à jour
     */
    public function update(Request $request, $id)
    {
        $consultation = Consultation::findOrFail($id);
        $user = Auth::user();

        if ($user->role === 'MEDECIN' && $consultation->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'diagnostic' => 'nullable|string',
            'poids' => 'nullable|numeric',
            'tension' => 'nullable|string',
            'temperature' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $consultation->update($validated);
        return response()->json($consultation);
    }
}
