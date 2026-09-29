<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppReleaseRequest extends FormRequest
{
    private const EXTENSIONS = [
        'windows' => 'exe',
        'android' => 'apk',
    ];

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
            'platform' => ['required', Rule::in(array_keys(self::EXTENSIONS))],
            'version' => ['required', 'string', 'max:20', 'regex:/^\d+\.\d+\.\d+$/'],
            'file' => [
                'required',
                'file',
                'max:512000',
                function (string $attribute, $value, \Closure $fail): void {
                    $expected = self::EXTENSIONS[$this->input('platform')] ?? null;
                    if ($expected && strtolower($value->getClientOriginalExtension()) !== $expected) {
                        $fail("Le fichier doit être un .{$expected} pour cette plateforme.");
                    }
                },
            ],
        ];
    }
}
