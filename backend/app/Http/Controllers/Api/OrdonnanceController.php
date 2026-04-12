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

        // RBAC
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
                $q->where('code_unique', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($pq) use ($search) {
                      $pq->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        $perPage = $request->get('size', 10);
        return response()->json($query->orderBy('date_prescription', 'desc')->paginate($perPage));
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

        // Détermination du médecin prescripteur
        $medecinId = null;
        
        // 1. Priorité au médecin de la consultation liée
        $consultation = \App\Models\Consultation::find($validated['consultation_id']);
        if ($consultation) {
            $medecinId = $consultation->medecin_id;
        }
        
        // 2. Fallback sur le médecin connecté si celui de la consultation est introuvable
        if (!$medecinId && $user->medecin) {
            $medecinId = $user->medecin->id;
        }

        // 3. Si toujours rien (ex: Admin sans profil médecin), on bloque avec un message clair
        if (!$medecinId) {
            return response()->json([
                'message' => "Impossible d'identifier le médecin prescripteur. Veuillez vérifier le dossier médical."
            ], 403);
        }

        // Code unique pour le QR Code de certification
        $codeUnique = 'PRESC-' . strtoupper(Str::random(10));

        $ordonnance = Ordonnance::create([
            'consultation_id' => $validated['consultation_id'],
            'medecin_id' => $medecinId,
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
