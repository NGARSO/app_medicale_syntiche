<?php

namespace App\Exports;

use App\Models\Patient;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class PatientsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Patient::all();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nom',
            'Prénom',
            'Date de Naissance',
            'Sexe',
            'Téléphone',
            'Adresse',
            'Créé le',
        ];
    }

    public function map($patient): array
    {
        return [
            $patient->id,
            $patient->nom,
            $patient->prenom,
            $patient->date_naissance,
            $patient->sexe,
            $patient->telephone,
            $patient->adresse,
            $patient->created_at->format('d/m/Y H:i'),
        ];
    }
}
