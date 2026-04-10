<?php

namespace App\Exports;

use App\Models\RendezVous;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RendezVousExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return RendezVous::with(['patient', 'medecin'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Patient',
            'Médecin',
            'Date & Heure',
            'Motif',
            'Statut',
            'Créé le',
        ];
    }

    public function map($rdv): array
    {
        return [
            $rdv->id,
            $rdv->patient->nom . ' ' . $rdv->patient->prenom,
            $rdv->medecin->nom . ' ' . $rdv->medecin->prenom,
            $rdv->date_heure,
            $rdv->motif,
            $rdv->statut,
            $rdv->created_at->format('d/m/Y H:i'),
        ];
    }
}
