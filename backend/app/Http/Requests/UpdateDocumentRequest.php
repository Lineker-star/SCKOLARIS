<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:150'],
            'author' => ['sometimes', 'required', 'string', 'max:100'],
            'subdomain_id' => ['sometimes', 'required', 'integer', 'exists:subdomains,id'],
            'program' => ['nullable', 'string', 'max:50'],
            'summary' => ['nullable', 'string'],
            'file' => ['sometimes', 'file', 'mimes:pdf,docx,pptx', 'max:512000'],
            'cover' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
