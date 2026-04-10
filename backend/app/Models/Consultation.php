<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = [
        'medecin_id', 'patient_id', 'rendez_vous_id',
        'date_consultation', 'motif', 'diagnostic',
        'poids', 'tension', 'temperature', 'notes'
    ];

    protected $casts = [
        'date_consultation' => 'date',
        'poids' => 'decimal:2',
        'temperature' => 'decimal:1'
    ];

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function rendezVous()
    {
        return $this->belongsTo(RendezVous::class);
    }

    public function ordonnance()
    {
        return $this->hasOne(Ordonnance::class);
    }
}
