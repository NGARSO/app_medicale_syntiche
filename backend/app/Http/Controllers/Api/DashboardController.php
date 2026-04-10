<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\RendezVous;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Statistiques personnalisées par rôle :
     * - ADMIN  : voit tout (stats globales)
     * - MEDECIN : voit uniquement ses RDV, ses patients
     * - USER   : voit uniquement ses RDV à lui (en tant que patient)
     */
    public function getStats(Request $request)
    {
        $user  = auth()->user();
        $role  = $user->role;
        $today = Carbon::today();

        if ($role === 'ADMIN') {
            return response()->json($this->adminStats($today));
        }

        if ($role === 'MEDECIN') {
            return response()->json($this->medecinStats($user, $today));
        }

        // USER (patient)
        return response()->json($this->userStats($user, $today));
    }

    /**
     * ADMIN — vue globale complète
     */
    private function adminStats($today): array
    {
        return [
            'role'           => 'ADMIN',
            'totalPatients'  => Patient::count(),
            'totalMedecins'  => Medecin::count(),
            'totalRdv'       => RendezVous::count(),
            'rdvAujourdhui'  => RendezVous::whereDate('date_heure', $today)->count(),
            'rdvAVenir'      => RendezVous::where('date_heure', '>', now())->count(),
            'rdvEnAttente'   => RendezVous::where('statut', 'EN_ATTENTE')->count(),
            'rdvConfirme'    => RendezVous::where('statut', 'CONFIRME')->count(),
            'rdvAnnule'      => RendezVous::where('statut', 'ANNULE')->count(),
            'rdvTermine'     => RendezVous::where('statut', 'TERMINE')->count(),
            // Derniers RDV pour le tableau d'activité récente
            'derniersRdv'    => RendezVous::with(['patient:id,nom,prenom', 'medecin:id,nom,prenom,specialite'])
                                    ->orderBy('date_heure', 'desc')
                                    ->limit(5)
                                    ->get(),
        ];
    }

    /**
     * MEDECIN — uniquement ses propres RDV et patients
     */
    private function medecinStats($user, $today): array
    {
        $medecin = Medecin::where('user_id', $user->id)->first();

        if (!$medecin) {
            // Le user MEDECIN n'est pas encore lié à un profil médecin
            return [
                'role'           => 'MEDECIN',
                'medecinNom'     => $user->username,
                'totalPatients'  => 0,
                'totalRdv'       => 0,
                'rdvAujourdhui'  => 0,
                'rdvAVenir'      => 0,
                'rdvEnAttente'   => 0,
                'rdvConfirme'    => 0,
                'rdvAnnule'      => 0,
                'rdvTermine'     => 0,
                'derniersRdv'    => [],
                'message'        => 'Votre compte n\'est pas encore lié à un profil médecin. Contactez l\'administrateur.',
            ];
        }

        $rdvQuery = RendezVous::where('medecin_id', $medecin->id);

        // Nombre de patients distincts du médecin
        $mesPatients = RendezVous::where('medecin_id', $medecin->id)
                            ->distinct('patient_id')
                            ->count('patient_id');

        return [
            'role'           => 'MEDECIN',
            'medecinId'      => $medecin->id,
            'medecinNom'     => 'Dr. ' . $medecin->nom . ' ' . $medecin->prenom,
            'specialite'     => $medecin->specialite,
            'totalPatients'  => $mesPatients,
            'totalRdv'       => (clone $rdvQuery)->count(),
            'rdvAujourdhui'  => (clone $rdvQuery)->whereDate('date_heure', $today)->count(),
            'rdvAVenir'      => (clone $rdvQuery)->where('date_heure', '>', now())->count(),
            'rdvEnAttente'   => (clone $rdvQuery)->where('statut', 'EN_ATTENTE')->count(),
            'rdvConfirme'    => (clone $rdvQuery)->where('statut', 'CONFIRME')->count(),
            'rdvAnnule'      => (clone $rdvQuery)->where('statut', 'ANNULE')->count(),
            'rdvTermine'     => (clone $rdvQuery)->where('statut', 'TERMINE')->count(),
            // Prochains RDV du médecin
            'derniersRdv'    => RendezVous::with(['patient:id,nom,prenom'])
                                    ->where('medecin_id', $medecin->id)
                                    ->where('date_heure', '>=', now())
                                    ->orderBy('date_heure', 'asc')
                                    ->limit(5)
                                    ->get(),
        ];
    }

    /**
     * USER (Patient) — uniquement ses propres RDV
     */
    private function userStats($user, $today): array
    {
        $patient = Patient::where('user_id', $user->id)->first();

        if (!$patient) {
            return [
                'role'           => 'USER',
                'patientNom'     => $user->username,
                'totalRdv'       => 0,
                'rdvAujourdhui'  => 0,
                'rdvAVenir'      => 0,
                'rdvEnAttente'   => 0,
                'rdvConfirme'    => 0,
                'rdvAnnule'      => 0,
                'rdvTermine'     => 0,
                'derniersRdv'    => [],
                'message'        => 'Votre compte n\'est pas encore lié à un dossier patient. Contactez l\'accueil.',
            ];
        }

        $rdvQuery = RendezVous::where('patient_id', $patient->id);

        return [
            'role'           => 'USER',
            'patientId'      => $patient->id,
            'patientNom'     => $patient->nom . ' ' . $patient->prenom,
            'totalRdv'       => (clone $rdvQuery)->count(),
            'rdvAujourdhui'  => (clone $rdvQuery)->whereDate('date_heure', $today)->count(),
            'rdvAVenir'      => (clone $rdvQuery)->where('date_heure', '>', now())->count(),
            'rdvEnAttente'   => (clone $rdvQuery)->where('statut', 'EN_ATTENTE')->count(),
            'rdvConfirme'    => (clone $rdvQuery)->where('statut', 'CONFIRME')->count(),
            'rdvAnnule'      => (clone $rdvQuery)->where('statut', 'ANNULE')->count(),
            'rdvTermine'     => (clone $rdvQuery)->where('statut', 'TERMINE')->count(),
            // Prochains RDV du patient
            'derniersRdv'    => RendezVous::with(['medecin:id,nom,prenom,specialite'])
                                    ->where('patient_id', $patient->id)
                                    ->where('date_heure', '>=', now())
                                    ->orderBy('date_heure', 'asc')
                                    ->limit(5)
                                    ->get(),
        ];
    }
}
