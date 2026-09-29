<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        foreach (['first_name', 'last_name', 'program', 'domain_id', 'study_domain', 'secondary_email'] as $field) {
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
        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:50'],
            'last_name' => ['sometimes', 'required', 'string', 'max:50'],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'program' => ['nullable', 'string', 'max:50'],
            'domain_id' => ['nullable', 'integer', 'exists:domains,id'],
            'study_domain' => ['nullable', 'string', 'max:100'],
            'secondary_email' => [
                'nullable',
                'email',
                'max:100',
                Rule::unique('users', 'secondary_email')->ignore($this->user()->id),
                Rule::notIn([$this->user()->email]),
            ],
            'avatar' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
