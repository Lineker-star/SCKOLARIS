<?php

namespace App\Models;

use App\Enums\AiIndexStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Override;

class Document extends Model
{
    use HasFactory;

    protected $table = 'documents';
    protected $fillable = [
        'title',
        'author',
        'subdomain_id',
        'program',
        'summary',
        'file_path',
        'cover_path',
        'source_url',
        'uploaded_by_id'
    ];

    protected $appends = ['cover_url'];

    #[Override]
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts():array
    {
        return [
            'uploaded_at' => 'datetime',
            'ai_index_status' => AiIndexStatus::class,
            'ai_indexed_at' => 'datetime',
        ];
    }

    protected function coverUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null,
        );
    }

    public function depositor():BelongsTo
    {
        return $this->belongsTo(User::class,'uploaded_by_id');
    }

    public function subdomain(): BelongsTo
    {
        return $this->belongsTo(Subdomain::class);
    }

    public function deletionRequests(): HasMany
    {
        return $this->hasMany(DeletionRequest::class, 'document_id');
    }

    public function downloads(): HasMany
    {
        return $this->hasMany(Download::class, 'document_id');
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(DocumentChunk::class);
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->uploaded_by_id === $user->id;
    }
}
