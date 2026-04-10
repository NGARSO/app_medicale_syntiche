<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ordonnance extends Model
{
    protected $fillable = [
        'consultation_id', 'medecin_id', 'patient_id',
        'code_unique', 'date_prescription', 'date_expiration', 'notes_generales'
    ];

    protected $casts = [
        'date_prescription' => 'date',
        'date_expiration' => 'date'
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function medecin()
    {
        return $this->belongsTo(Medecin::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function items()
    {
        return $this->hasMany(OrdonnanceItem::class);
    }
}
