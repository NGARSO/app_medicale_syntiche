<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'nom', 'prenom', 'date_naissance', 'cin',
        'email', 'telephone', 'sexe', 'groupe_sanguin', 'antecedents', 'user_id'
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class, 'patient_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

