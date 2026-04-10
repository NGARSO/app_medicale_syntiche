<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ordonnance;
use App\Models\OrdonnanceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrdonnanceController extends Controller
{
    /**
     * Liste des ordonnances filtrée
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Ordonnance::with(['patient', 'medecin', 'items']);

        if ($user->role === 'MEDECIN') {
            $query->where('medecin_id', $user->medecin->id);
        } elseif ($user->role === 'USER') {
            $query->where('patient_id', $user->patient->id);
        }

        return response()->json($query->orderBy('date_prescription', 'desc')->paginate(10));
    }

    /**
     * Création d'une ordonnance avec ses médicaments
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'patient_id' => 'required|exists:patients,id',
            'date_prescription' => 'required|date',
            'date_expiration' => 'nullable|date',
            'notes_generales' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.nom_medicament' => 'required|string',
            'items.*.dosage' => 'nullable|string',
            'items.*.frequence' => 'nullable|string',
            'items.*.duree' => 'nullable|string',
            'items.*.instructions' => 'nullable|string',
        ]);

        // Code unique pour le QR Code de certification
        $codeUnique = 'PRESC-' . strtoupper(Str::random(10));

        $ordonnance = Ordonnance::create([
            'consultation_id' => $validated['consultation_id'],
            'medecin_id' => $user->medecin->id,
            'patient_id' => $validated['patient_id'],
            'code_unique' => $codeUnique,
            'date_prescription' => $validated['date_prescription'],
            'date_expiration' => $validated['date_expiration'],
            'notes_generales' => $validated['notes_generales'],
        ]);

        // Ajout des médicaments
        foreach ($validated['items'] as $item) {
            $ordonnance->items()->create($item);
        }

        return response()->json($ordonnance->load('items'), 201);
    }

    /**
     * Détails et Données pour l'impression/vérification
     */
    public function show($id)
    {
        $user = Auth::user();
        $ordonnance = Ordonnance::with(['patient', 'medecin', 'items', 'consultation'])->findOrFail($id);

        // RBAC
        if ($user->role === 'MEDECIN' && $ordonnance->medecin_id !== $user->medecin->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        if ($user->role === 'USER' && $ordonnance->patient_id !== $user->patient->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Ajout du lien QR Code
        $ordonnance->qr_code_url = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . urlencode("http://localhost:4200/verify/" . $ordonnance->code_unique);

        return response()->json($ordonnance);
    }

    /**
     * Vérification publique d'une ordonnance via son code (Scan QR)
     */
    public function verify($code)
    {
        // Cette route n'exige pas d'authentification pour cet usage précis (pharmacien)
        $ordonnance = Ordonnance::with(['patient', 'medecin', 'items'])
            ->where('code_unique', $code)
            ->firstOrFail();

        return response()->json([
            'status' => 'CERTIFIED',
            'original_data' => $ordonnance,
            'verified_at' => now()
        ]);
    }
}
