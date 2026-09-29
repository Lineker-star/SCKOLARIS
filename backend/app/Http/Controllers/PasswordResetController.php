<?php

namespace App\Http\Controllers;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        // Même message que l'adresse existe ou non — sinon ce formulaire
        // deviendrait un moyen de vérifier quelles adresses sont inscrites
        // sur SCKOLARIS.
        return response()->json([
            'message' => "Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé (valable 24h).",
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();

                // Le scénario type d'une réinitialisation est un mot de
                // passe compromis — toute session déjà ouverte ailleurs
                // avec l'ancien mot de passe doit être révoquée.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            abort(422, 'Ce lien de réinitialisation est invalide ou a expiré. Demandez-en un nouveau depuis la page de connexion.');
        }

        return response()->json(['message' => 'Mot de passe réinitialisé — vous pouvez maintenant vous connecter.']);
    }
}
