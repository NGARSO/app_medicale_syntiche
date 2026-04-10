<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table des Consultations
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medecin_id')->constrained('medecins')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('rendez_vous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            
            $table->date('date_consultation');
            $table->text('motif');
            $table->text('diagnostic')->nullable();
            
            // Constantes vitale
            $table->decimal('poids', 5, 2)->nullable();
            $table->string('tension', 10)->nullable();
            $table->decimal('temperature', 4, 1)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Table des Ordonnances
        Schema::create('ordonnances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations')->onDelete('cascade');
            $table->foreignId('medecin_id')->constrained('medecins')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            
            $table->string('code_unique')->unique(); // Pour le QR Code
            $table->date('date_prescription');
            $table->date('date_expiration')->nullable();
            $table->text('notes_generales')->nullable();
            $table->timestamps();
        });

        // 3. Table des Médicaments de l'ordonnance
        Schema::create('ordonnance_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ordonnance_id')->constrained('ordonnances')->onDelete('cascade');
            $table->string('nom_medicament');
            $table->string('dosage')->nullable(); // ex: 500mg
            $table->string('frequence')->nullable(); // ex: 3 fois par jour
            $table->string('duree')->nullable(); // ex: 7 jours
            $table->text('instructions')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ordonnance_items');
        Schema::dropIfExists('ordonnances');
        Schema::dropIfExists('consultations');
    }
};
