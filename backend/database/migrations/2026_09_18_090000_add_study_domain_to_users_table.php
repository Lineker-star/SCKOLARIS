<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('domain_id')->nullable()->after('program')->constrained('domains')->nullOnDelete();
            $table->string('study_domain')->nullable()->after('domain_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['domain_id']);
            $table->dropColumn(['domain_id', 'study_domain']);
        });
    }
};