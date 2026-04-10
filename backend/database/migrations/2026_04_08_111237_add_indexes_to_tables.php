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
        Schema::table('patients', function (Blueprint $table) {
            $table->index(['nom', 'prenom']);
            $table->index('telephone');
        });

        Schema::table('medecins', function (Blueprint $table) {
            $table->index(['nom', 'prenom']);
            $table->index('specialite');
            $table->index('matricule');
        });

        Schema::table('disponibilites', function (Blueprint $table) {
            $table->index(['medecin_id', 'jour_semaine', 'actif']);
        });

        Schema::table('rendez_vous', function (Blueprint $table) {
            $table->index('date_heure');
            $table->index('statut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
