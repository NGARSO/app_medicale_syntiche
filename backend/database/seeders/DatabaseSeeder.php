<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\RendezVous;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin
        User::create([
            'username' => 'admin',
            'email'    => 'admin@cliniquepro.com',
            'role'     => 'ADMIN',
            'password' => Hash::make('password123'),
        ]);

        // Sample Medecins
        $m1 = Medecin::create([
            'nom'        => 'Dupont',
            'prenom'     => 'Jean',
            'specialite' => 'Cardiologie',
            'email'      => 'jean.dupont@cliniquepro.com',
            'telephone'  => '0612345678',
            'matricule'  => 'MED001',
            'disponible' => true
        ]);

        $m2 = Medecin::create([
            'nom'        => 'Martin',
            'prenom'     => 'Sophie',
            'specialite' => 'Pédiatrie',
            'email'      => 'sophie.martin@cliniquepro.com',
            'telephone'  => '0687654321',
            'matricule'  => 'MED002',
            'disponible' => true
        ]);

        // Sample Patients
        $p1 = Patient::create([
            'nom'            => 'Moreau',
            'prenom'         => 'Luc',
            'date_naissance' => '1985-05-15',
            'cin'            => 'AB123456',
            'email'          => 'luc.moreau@email.com',
            'telephone'      => '0711223344',
            'sexe'           => 'M',
            'groupe_sanguin' => 'O+',
            'antecedents'    => 'Asthme'
        ]);

        $p2 = Patient::create([
            'nom'            => 'Petit',
            'prenom'         => 'Alice',
            'date_naissance' => '1992-11-20',
            'cin'            => 'CD654321',
            'email'          => 'alice.petit@email.com',
            'telephone'      => '0755667788',
            'sexe'           => 'F',
            'groupe_sanguin' => 'A-',
            'antecedents'    => 'Aucun'
        ]);

        // Sample RendezVous
        RendezVous::create([
            'date_heure' => Carbon::tomorrow()->setHour(10)->setMinute(0)->setSecond(0),
            'statut'     => 'EN_ATTENTE',
            'motif'      => 'Consultation annuelle',
            'patient_id' => $p1->id,
            'medecin_id' => $m1->id
        ]);
    }
}
