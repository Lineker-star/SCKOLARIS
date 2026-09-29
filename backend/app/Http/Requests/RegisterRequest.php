<?php

namespace App\Http\Requests;

use App\Rules\StrongPassword;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Un champ HTML/FormData laissé vide arrive comme une chaîne vide, pas
     * comme une valeur absente — sans cette normalisation, la règle "nullable"
     * ci-dessous ne suffit pas à elle seule à passer outre le "regex" pour un
     * enseignant sans matricule (une chaîne vide n'est pas "null").
     */
    protected function prepareForValidation(): void
    {
        foreach (['registration_number', 'program', 'domain_id', 'study_domain', 'secondary_email'] as $field) {
            if ($this->input($field) === '') {
                $this->merge([$field => null]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        // Auto-inscription ouverte à deux rôles seulement (jamais admin,
        // qui reste une promotion manuelle depuis "Utilisateurs") — l'un
        // comme l'autre reste "pending" jusqu'à validation par un
        // enseignant/admin, exactement comme avant pour les étudiants (voir
        // AccountController::register et le middleware "validated" sur les
        // routes de dépôt).
        $isStudent = $this->input('role') === 'student';

        return [
            'last_name' => ['required', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:50'],
            'role' => ['required', Rule::in(['student', 'teacher'])],
            // Format réglementaire IU-ZTF : 2 chiffres (année d'inscription)
            // + 3 lettres (code filière, ex: SWE) + 3 chiffres (numéro
            // séquentiel) — ex: 26SWE001. La filière n'est pas limitée à une
            // liste fermée ici (l'institut peut en ouvrir de nouvelles sans
            // que le code ait besoin d'être mis à jour), seule la forme est
            // vérifiée.
            // Obligatoire pour un étudiant ; facultatif pour un enseignant
            // (l'IU-ZTF n'attribue pas systématiquement de matricule
            // "étudiant" à son personnel enseignant) — mais toujours vérifié
            // dans sa forme et son unicité s'il est quand même fourni.
            'registration_number' => [
                $isStudent ? 'required' : 'nullable',
                'string',
                'regex:/^\d{2}[A-Z]{3}\d{3}$/',
                'unique:users,registration_number',
            ],
            'email' => ['required', 'email', 'max:100', 'unique:users,email'],
            'password' => ['required', 'string', new StrongPassword()],
            'program' => ['nullable', 'string', 'max:50'],
            'domain_id' => ['nullable', 'integer', 'exists:domains,id'],
            'study_domain' => ['nullable', 'string', 'max:100'],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'registration_number.required' => 'Le matricule est obligatoire pour une inscription étudiante.',
            'registration_number.regex' => "Le matricule doit suivre le format réglementaire de l'IU-ZTF : 2 chiffres (année) + 3 lettres (filière) + 3 chiffres (numéro), ex: 26SWE001.",
        ];
    }
}
