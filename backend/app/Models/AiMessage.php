<?php

namespace App\Models;

use App\Enums\AiMessageRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Override;

class AiMessage extends Model
{
    use HasFactory;

    protected $table = 'ai_messages';
    protected $fillable = [
        'conversation_id',
        'role',
        'content',
    ];

    #[Override]
    protected function casts(): array
    {
        return [
            'role' => AiMessageRole::class,
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    public function citations(): HasMany
    {
        return $this->hasMany(AiMessageCitation::class, 'message_id');
    }

    public function feedback(): HasMany
    {
        return $this->hasMany(AiFeedback::class, 'message_id');
    }
}
