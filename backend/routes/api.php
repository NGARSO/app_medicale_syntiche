<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\MedecinController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\DashboardController;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [\App\Http\Controllers\Api\ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [\App\Http\Controllers\Api\ForgotPasswordController::class, 'reset']);

// Authenticated Routes
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Profile
    Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/profile/photo', [\App\Http\Controllers\Api\ProfileController::class, 'uploadPhoto']);

    // Patients
    Route::get('/patients/search', [PatientController::class, 'search']);
    Route::apiResource('patients', PatientController::class);

    // Medecins
    Route::get('/medecins/search', [MedecinController::class, 'search']);
    Route::apiResource('medecins', MedecinController::class);

    // Rendez-vous
    Route::apiResource('rendez-vous', RendezVousController::class);

    // Dashboard
    Route::get('/stats', [DashboardController::class, 'getStats']);

    // Exports
    Route::get('/export/patients', [\App\Http\Controllers\Api\ExportController::class, 'exportPatients']);
    Route::get('/export/medecins', [\App\Http\Controllers\Api\ExportController::class, 'exportMedecins']);
    Route::get('/export/rendez-vous', [\App\Http\Controllers\Api\ExportController::class, 'exportRendezVous']);

    // Users (Admin Only)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);

    // Disponibilités (Calendrier Médecin)
    Route::apiResource('disponibilites', \App\Http\Controllers\Api\DisponibiliteController::class);

    // Module Médical (Consultations & Ordonnances)
    Route::apiResource('consultations', \App\Http\Controllers\Api\ConsultationController::class);
    Route::apiResource('ordonnances', \App\Http\Controllers\Api\OrdonnanceController::class);
});

// Route publique de vérification d'ordonnance (Scan QR Code)
Route::get('verify-prescription/{code}', [\App\Http\Controllers\Api\OrdonnanceController::class, 'verify']);
