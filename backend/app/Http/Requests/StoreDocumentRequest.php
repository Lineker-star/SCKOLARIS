<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:150'],
            'author' => ['required', 'string', 'max:100'],
            'subdomain_id' => ['required', 'integer', 'exists:subdomains,id'],
            'program' => [Rule::requiredIf(fn () => $this->user()?->isTeacher()), 'nullable', 'string', 'max:50'],
            'summary' => ['nullable', 'string'],
            'file' => ['required', 'file', 'mimes:pdf,docx,pptx', 'max:512000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

}
