<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Matricule ou e-mail — un enseignant auto-inscrit peut ne pas
            // avoir de matricule (voir RegisterRequest), voir
            // AccountController::login().
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_id' => ['required', 'string', 'size:32', 'regex:/^[a-f0-9]+$/'],
            'platform' => ['required', 'string', 'in:web,mobile,desktop'],
        ];
    }
}
