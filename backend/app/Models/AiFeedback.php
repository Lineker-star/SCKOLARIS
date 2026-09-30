<?php

namespace App\Models;

use App\Enums\AiFeedbackRating;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Override;

class AiFeedback extends Model
{
    use HasFactory;

    protected $table = 'ai_feedback';
    protected $fillable = [
        'message_id',
        'user_id',
        'rating',
        'reason',
    ];

    #[Override]
    protected function casts(): array
    {
        return [
            'rating' => AiFeedbackRating::class,
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiMessage::class, 'message_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
