<?php

namespace App\Exports;

use App\Models\Medecin;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MedecinsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Medecin::all();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nom',
            'Prénom',
            'Spécialité',
            'Téléphone',
            'Email',
            'Disponibilité',
            'Créé le',
        ];
    }

    public function map($medecin): array
    {
        return [
            $medecin->id,
            $medecin->nom,
            $medecin->prenom,
            $medecin->specialite,
            $medecin->telephone,
            $medecin->email,
            $medecin->disponibilite,
            $medecin->created_at->format('d/m/Y H:i'),
        ];
    }
}
