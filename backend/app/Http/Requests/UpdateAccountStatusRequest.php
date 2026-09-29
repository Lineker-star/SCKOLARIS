<?php

namespace App\Http\Requests;

use App\Enums\AccountStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccountStatusRequest extends FormRequest
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
            'account_status' => ['required', Rule::enum(AccountStatus::class)->only([AccountStatus::VALIDATED, AccountStatus::REJECTED])],
        ];
    }
}
