<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150'],
            'subject' => ['required', 'string', 'max:150'],
            'message' => ['required', 'string', 'max:5000'],
            // Champ piège invisible pour un visiteur humain (masqué en CSS
            // dans le formulaire) — un robot qui remplit tout aveuglément le
            // renseigne, ce qui permet de le repérer sans CAPTCHA.
            'website' => ['prohibited'],
        ];
    }
}
