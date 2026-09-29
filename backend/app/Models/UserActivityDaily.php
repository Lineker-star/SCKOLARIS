<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserActivityDaily extends Model
{
    protected $table = 'user_activity_daily';
    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'activity_date',
    ];

    protected function casts(): array
    {
        return [
            // Pas de cast 'date' sur activity_date : firstOrCreate() la
            // comparerait alors via un objet Carbon reconstruit, dont la
            // sérialisation en chaîne pour la clause WHERE diffère selon le
            // pilote (constaté : doublon silencieux évité de justesse sur
            // SQLite en test, jamais reproduit sur Postgres). Comparer une
            // simple chaîne 'Y-m-d' des deux côtés est sans ambiguïté.
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
