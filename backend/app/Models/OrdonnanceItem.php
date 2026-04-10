<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdonnanceItem extends Model
{
    protected $fillable = [
        'ordonnance_id', 'nom_medicament', 'dosage',
        'frequence', 'duree', 'instructions'
    ];

    public function ordonnance()
    {
        return $this->belongsTo(Ordonnance::class);
    }
}
