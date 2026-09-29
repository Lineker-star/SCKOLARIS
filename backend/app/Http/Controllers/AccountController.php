<?php

namespace App\Http\Controllers;

use App\Enums\AccountStatus;
use App\Enums\Role;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateAccountRoleRequest;
use App\Http\Requests\UpdateAccountStatusRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\Document;
use App\Models\Download;
use App\Models\User;
use App\Notifications\AccountStatusNotification;
use App\Support\ImageResizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AccountController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            ...$request->safe()->except(['password', 'avatar', 'role']),
            'password' => Hash::make($request->validated('password')),
            // Auto-inscription ouverte à "student" et "teacher" (jamais
            // "admin", qui reste une promotion manuelle) — voir
            // RegisterRequest::rules().
            'role' => Role::from($request->validated('role')),
            'account_status' => AccountStatus::PENDING,
            'avatar_path' => $request->hasFile('avatar')
                ? ImageResizer::resizeAndStore($request->file('avatar'), 'avatars', maxDimension: 400)
                : null,
        ]);

        return response()->json([
            'message' => 'Account created, pending validation.',
            'user' => [
                'id' => $user->id,
                'account_status' => $user->account_status,
            ],
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        // "identifier" accepte le matricule OU l'e-mail : un enseignant
        // auto-inscrit peut ne pas avoir de matricule (voir RegisterRequest),
        // il doit donc pouvoir se connecter avec son e-mail à la place. Un
        // étudiant (qui a toujours les deux) peut utiliser l'un ou l'autre.
        $identifier = $request->validated('identifier');
        $user = User::where('registration_number', $identifier)
            ->orWhere('email', $identifier)
            ->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Identifiants incorrects.'],
            ])->status(401);
        }

        if (! $user->isActive()) {
            abort(403, 'Ce compte a été désactivé.');
        }

        $deviceId = $request->validated('device_id');
        $platform = $request->validated('platform');
        $activeTokens = $user->tokens()
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();
        $deviceTokenPrefix = "api-token:{$platform}:{$deviceId}";
        $activeDeviceIds = $activeTokens
            ->map(function ($token): string {
                $parts = explode(':', $token->name, 3);

                return count($parts) === 3 && $parts[0] === 'api-token'
                    ? $parts[2]
                    : 'legacy-token';
            })
            ->unique()
            ->values();

        if (! $activeDeviceIds->contains($deviceId) && $activeDeviceIds->count() >= 2) {
            throw ValidationException::withMessages([
                'device_id' => ['Ce compte est déjà utilisé sur deux appareils. Déconnectez un appareil avant de continuer.'],
            ])->status(409);
        }

        $user->tokens()
            ->where('name', $deviceTokenPrefix)
            ->delete();

        $token = $user->createToken($deviceTokenPrefix, ['*'], now()->addDay())->plainTextToken;
        $user->update(['is_online' => true]);

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->update(['is_online' => false]);
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->except('avatar');

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            $data['avatar_path'] = ImageResizer::resizeAndStore($request->file('avatar'), 'avatars', maxDimension: 400);
        }

        $user->update($data);

        return response()->json(['user' => $user->fresh()]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->validated('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mot de passe actuel incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->validated('password'))]);

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }

    public function index(Request $request): JsonResponse
    {
        $accounts = User::query()
            ->when($request->filled('account_status'), fn ($q) => $q->where('account_status', $request->string('account_status')))
            ->when($request->filled('is_online'), fn ($q) => $q->where('is_online', $request->boolean('is_online')))
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->string('role')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search').'%';
                $q->where(function ($q) use ($term) {
                    $q->where('first_name', 'ilike', $term)
                        ->orWhere('last_name', 'ilike', $term)
                        ->orWhere('email', 'ilike', $term)
                        ->orWhere('registration_number', 'ilike', $term);
                });
            })
            ->orderBy('last_name')
            ->paginate(50);

        return response()->json($accounts);
    }

    public function pending(Request $request): JsonResponse
    {
        $accounts = User::where('account_status', AccountStatus::PENDING)
            ->orderBy('created_at')
            ->paginate(50);

        return response()->json($accounts);
    }

    public function show(User $account): JsonResponse
    {
        return response()->json([
            'account' => $account,
            'deposited_documents_count' => $account->depositedDocuments()->count(),
            'downloads_count' => $account->downloads()->count(),
        ]);
    }

    public function updateStatus(UpdateAccountStatusRequest $request, User $account): JsonResponse
    {
        // Un rejet est définitif : le compte est banni du système, jamais
        // rattrapable par une seconde validation (accidentelle ou non).
        if ($account->isRejected()) {
            abort(409, 'Ce compte a été rejeté définitivement — son statut ne peut plus être modifié.');
        }

        $account->update([
            'account_status' => $request->validated('account_status'),
        ]);
        $this->notifyStatusChange($account, $request->validated('account_status'));

        return response()->json(['account' => $account]);
    }

    public function updateRole(UpdateAccountRoleRequest $request, User $account): JsonResponse
    {
        $account->update([
            'role' => $request->validated('role'),
        ]);

        return response()->json(['account' => $account]);
    }

    public function deactivate(Request $request, User $account): JsonResponse
    {
        if ($account->id === $request->user()->id) {
            abort(403, 'Vous ne pouvez pas désactiver votre propre compte.');
        }

        $account->update(['is_active' => false]);
        $this->notifyStatusChange($account, 'deactivated');

        return response()->json(['account' => $account]);
    }

    public function reactivate(User $account): JsonResponse
    {
        $account->update(['is_active' => true]);
        $this->notifyStatusChange($account, 'reactivated');

        return response()->json(['account' => $account]);
    }

    /**
     * Envoie un e-mail (adresse principale) informant l'utilisateur d'un
     * changement de statut de son compte — jamais bloquant : un souci
     * d'envoi (fournisseur SMTP indisponible...) ne doit jamais faire
     * échouer l'action admin elle-même, qui a déjà réussi en base au
     * moment de cet appel.
     */
    private function notifyStatusChange(User $account, string $type): void
    {
        try {
            $account->notify(new AccountStatusNotification($type));
        } catch (\Throwable $e) {
            Log::error("Échec de l'envoi de la notification de statut de compte ({$type})", [
                'user_id' => $account->id,
                'exception' => $e->getMessage(),
            ]);
        }
    }

    public function statistics(): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),
            'pending_accounts' => User::where('account_status', AccountStatus::PENDING)->count(),
            'validated_accounts' => User::where('account_status', AccountStatus::VALIDATED)->count(),
            'total_documents' => Document::count(),
            'total_downloads' => Download::count(),
        ]);
    }
}
