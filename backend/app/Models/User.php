<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Models\Document;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $table = 'users';
    protected $fillable = [
        'first_name',
        'last_name',
        'registration_number',
        'email',
        'secondary_email',
        'password',
        'role',
        'program',
        'domain_id',
        'study_domain',
        'account_status',
        'is_active',
        'is_online',
        'avatar_path'
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['avatar_url'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role'=>Role::class,
            'account_status'=>AccountStatus::class,
            'is_active'=>'boolean',
            'is_online'=>'boolean'
        ];
    }

    public function depositedDocuments():HasMany
    {
        return $this->hasMany(Document::class ,'uploaded_by_id');
    }

    public function downloads():HasMany
    {
        return $this->hasMany(Download::class, 'user_id');
    }

    // Bibliothèque hors-ligne synchronisée entre appareils : source de
    // vérité côté serveur de ce que cet utilisateur veut garder disponible
    // hors connexion, distincte de `downloads` (simple journal d'événements
    // à des fins de statistiques).
    public function libraryDocuments(): BelongsToMany
    {
        return $this->belongsToMany(Document::class, 'document_library', 'user_id', 'document_id')
            ->withPivot('added_at');
    }


    public function isAdmin():bool
    {
        return $this->role == Role::ADMIN;
    }

    public function isTeacher():bool
    {
        return $this->role == Role::TEACHER;
    }

    public function isStudent():bool
    {
        return $this->role == Role::STUDENT;
    }

    public function hasRole(Role $role):bool
    {
        return $this->role === $role;
    }

    public function isValidated():bool
    {
        return $this->account_status === AccountStatus::VALIDATED;
    }

    public function isPending():bool
    {
        return $this->account_status === AccountStatus::PENDING;
    }

    public function isRejected():bool
    {
        return $this->account_status === AccountStatus::REJECTED;
    }

    public function isActive():bool
    {
        return $this->is_active;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatar_path ? Storage::disk('public')->url($this->avatar_path) : null,
        );
    }
}
