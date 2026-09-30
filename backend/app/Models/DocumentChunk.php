<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

class DocumentChunk extends Model
{
    use HasFactory;

    protected $table = 'document_chunks';
    protected $fillable = [
        'document_id',
        'chunk_index',
        'content',
        'page_number',
        'embedding',
        'content_hash',
    ];

    #[Override]
    protected function casts(): array
    {
        return [
            'embedding' => 'array',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }
}
