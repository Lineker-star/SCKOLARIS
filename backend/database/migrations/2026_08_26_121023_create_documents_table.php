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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title',250);
            $table->string('author',150);
            $table->string('subject',50);
            $table->string('program',50)->nullable();
            $table->text('summary')->nullable();
            $table->string('file_path');
            $table->timestampTz('uploaded_at')->useCurrent();
            $table->foreignId('uploaded_by_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
