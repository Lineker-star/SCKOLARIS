<?php

use App\Enums\AiIndexStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->enum('ai_index_status', array_column(AiIndexStatus::cases(), 'value'))
                ->default(AiIndexStatus::PENDING->value)
                ->after('source_url');
            $table->timestampTz('ai_indexed_at')->nullable()->after('ai_index_status');
            $table->text('ai_index_error')->nullable()->after('ai_indexed_at');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['ai_index_status', 'ai_indexed_at', 'ai_index_error']);
        });
    }
};
