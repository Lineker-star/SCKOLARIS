<?php

namespace App\Models;

use App\Enums\DeletionRequestStatus;
use App\Models\Document;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

class DeletionRequest extends Model
{
    use HasFactory;

    protected $table = 'deletion_requests';
    public $timestamps = false ;
    protected $fillable = [
        'document_id',
        'justification',
        'status',
        'processed_at'
    ];

    #[Override]
    protected function casts():array
    {
        return [
            'status' => DeletionRequestStatus::class,
            'requested_at'=>'datetime',
            'processed_at'=>'datetime'
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    public function isPending(): bool
    {
        return $this->status === DeletionRequestStatus::PENDING;
    }
}
