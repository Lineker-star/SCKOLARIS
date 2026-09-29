<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RagChunk extends Model
{
    protected $fillable = [
        'source_path',
        'chunk_key',
        'content',
        'content_hash',
        'indexed_at',
    ];

    protected function casts(): array
    {
        return [
            'indexed_at' => 'datetime',
        ];
    }
}