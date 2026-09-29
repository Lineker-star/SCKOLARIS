<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('subject');
            $table->foreignId('subdomain_id')->nullable()->after('author')->constrained('subdomains')->nullOnDelete();
            $table->string('cover_path')->nullable()->after('file_path');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropConstrainedForeignId('subdomain_id');
            $table->dropColumn('cover_path');
            $table->string('subject', 50)->nullable()->after('author');
        });
    }
};
