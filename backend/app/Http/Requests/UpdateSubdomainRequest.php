<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubdomainRequest extends FormRequest
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
        $domainId = $this->input('domain_id', $this->route('subdomain')->domain_id);

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
                Rule::unique('subdomains', 'name')->where('domain_id', $domainId)->ignore($this->route('subdomain')),
            ],
            'domain_id' => ['sometimes', 'required', 'integer', 'exists:domains,id'],
        ];
    }
}
