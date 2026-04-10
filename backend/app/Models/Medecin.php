<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medecin extends Model
{
    protected $fillable = [
        'nom', 'prenom', 'specialite', 'email',
        'telephone', 'matricule', 'disponible', 'user_id'
    ];

    protected $casts = [
        'disponible' => 'boolean',
    ];

    protected $appends = ['est_disponible_maintenant'];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'medecin_id');
    }

    public function disponibilites()
    {
        return $this->hasMany(Disponibilite::class, 'medecin_id');
    }

    public function getEstDisponibleMaintenantAttribute()
    {
        $now = now();
        $jour = $now->dayOfWeek; // 0 (Dimanche) à 6 (Samedi)
        $heure = $now->format('H:i:s');

        // Utilise la collection chargée (plus rapide) au lieu d'une nouvelle requête SQL
        return $this->disponibilites
            ->where('jour_semaine', $jour)
            ->where('heure_debut', '<=', $heure)
            ->where('heure_fin', '>=', $heure)
            ->where('actif', true)
            ->count() > 0;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
