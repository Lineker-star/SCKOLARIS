<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// L'inscription en tant qu'enseignant (voir RegisterRequest) ne demande plus
// obligatoirement un matricule — l'IU-ZTF n'attribue pas systématiquement de
// matricule "étudiant" à son personnel enseignant. La contrainte d'unicité
// est conservée (deux matricules identiques restent impossibles), mais
// plusieurs comptes peuvent maintenant n'en avoir aucun : SQL traite chaque
// valeur NULL comme distincte des autres pour une contrainte unique, donc ça
// ne bloque jamais plusieurs enseignants sans matricule à la fois.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('registration_number')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('registration_number')->nullable(false)->change();
        });
    }
};
