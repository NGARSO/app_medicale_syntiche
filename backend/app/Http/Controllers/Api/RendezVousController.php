<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RendezVous;
use Illuminate\Http\Request;

use App\Notifications\NewAppointmentNotification;
use Illuminate\Support\Facades\Notification;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $size    = $request->get('size', 10);
        $statut  = $request->get('statut');
        $user    = $request->user();

        $query = RendezVous::with(['patient', 'medecin']);

        // Filtrage par rôle
        if ($user->role === 'MEDECIN') {
            $query->where('medecin_id', $user->medecin->id);
        } elseif ($user->role === 'USER') {
            $query->where('patient_id', $user->patient->id);
        } elseif ($request->get('medecinId')) {
            // Un Admin peut filtrer par médecin
            $query->where('medecin_id', $request->get('medecinId'));
        }

        if ($statut) $query->where('statut', $statut);

        return response()->json($query->orderBy('date_heure', 'desc')->paginate($size));
    }

    public function show($id)
    {
        return response()->json(
            RendezVous::with(['patient', 'medecin'])->findOrFail($id)
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_heure' => 'required|date',
            'statut'     => 'required|in:EN_ATTENTE,CONFIRME,ANNULE,TERMINE',
            'motif'      => 'required|string|max:255',
            'notes'      => 'nullable|string',
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
        ]);

        $rdv = RendezVous::create($validated);
        $rdv->load(['patient', 'medecin']);

        // Notification par mail au médecin
        if ($rdv->medecin && $rdv->medecin->email) {
            try {
                // On simule un objet notifiable avec le nom du médecin
                $notifiable = (object) ['username' => 'Dr. ' . $rdv->medecin->nom, 'email' => $rdv->medecin->email];
                Notification::route('mail', $rdv->medecin->email)->notify(new NewAppointmentNotification($rdv));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erreur notification mail : " . $e->getMessage());
            }
        }

        return response()->json($rdv, 201);
    }

    public function update(Request $request, $id)
    {
        $rdv = RendezVous::findOrFail($id);

        $validated = $request->validate([
            'date_heure' => 'required|date',
            'statut'     => 'required|in:EN_ATTENTE,CONFIRME,ANNULE,TERMINE',
            'motif'      => 'required|string|max:255',
            'notes'      => 'nullable|string',
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
        ]);

        $rdv->update($validated);
        return response()->json($rdv->load(['patient', 'medecin']));
    }

    public function destroy($id)
    {
        RendezVous::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
