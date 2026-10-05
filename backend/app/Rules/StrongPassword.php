<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Politique de mot de passe réglementaire de l'Universite ZTF : au moins 4 lettres,
 * 3 chiffres et 1 symbole — l'ordre n'a pas d'importance. 4+3+1 = 8, donc la
 * longueur minimale de 8 caractères est déjà garantie par ces trois
 * contraintes réunies ; on la vérifie quand même explicitement en premier
 * pour donner un message plus clair sur un mot de passe court plutôt que de
 * lister les trois catégories manquantes à la fois.
 *
 * Utilisée partout où un mot de passe est défini ou changé (inscription,
 * réinitialisation par e-mail, changement depuis le profil) — jamais sur la
 * connexion, qui ne doit vérifier que la correspondance avec le mot de
 * passe existant, quelle que soit sa forme.
 */
class StrongPassword implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $value = (string) $value;

        if (mb_strlen($value) < 8) {
            $fail('Le mot de passe doit contenir au moins 8 caractères.');

            return;
        }

        $letters = preg_match_all('/[A-Za-z]/', $value);
        $digits = preg_match_all('/\d/', $value);
        $symbols = preg_match_all('/[^A-Za-z0-9]/', $value);

        if ($letters < 4 || $digits < 3 || $symbols < 1) {
            $fail('Le mot de passe doit contenir au moins 4 lettres, 3 chiffres et 1 symbole (l\'ordre importe peu).');
        }
    }
}
