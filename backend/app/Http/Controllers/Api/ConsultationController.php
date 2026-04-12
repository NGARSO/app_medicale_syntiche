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

        // Filtrage par rôle
        if ($user->role === 'MEDECIN') {
            if (!$user->medecin) {
                return response()->json(['data' => [], 'total' => 0, 'last_page' => 1]);
            }
            $query->where('medecin_id', $user->medecin->id);
        } elseif ($user->role === 'USER') {
            if (!$user->patient) {
                return response()->json(['data' => [], 'total' => 0, 'last_page' => 1]);
            }
            $query->where('patient_id', $user->patient->id);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('motif', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($pq) use ($search) {
                      $pq->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->get('size', 10);
        return response()->json($query->orderBy('date_consultation', 'desc')->paginate($perPage));
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

        // Si un RDV est lié, on le passe en "TERMINE"
        if ($consultation->rendez_vous_id) {
            $rdv = \App\Models\RendezVous::find($consultation->rendez_vous_id);
            if ($rdv) {
                $rdv->update(['statut' => 'TERMINE']);
            }
        }
        
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
