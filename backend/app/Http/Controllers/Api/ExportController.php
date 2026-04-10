<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Exports\PatientsExport;
use App\Exports\MedecinsExport;
use App\Exports\RendezVousExport;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function exportPatients()
    {
        return Excel::download(new PatientsExport, 'patients_export_' . date('Y-m-d') . '.xlsx');
    }

    public function exportMedecins()
    {
        return Excel::download(new MedecinsExport, 'medecins_export_' . date('Y-m-d') . '.xlsx');
    }

    public function exportRendezVous()
    {
        return Excel::download(new RendezVousExport, 'rendez_vous_export_' . date('Y-m-d') . '.xlsx');
    }
}
