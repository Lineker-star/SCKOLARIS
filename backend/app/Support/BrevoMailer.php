<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

class BrevoMailer
{
    /**
     * @param array<int, array{email: string, name?: string}> $to
     * @param array{email: string, name?: string} $sender
     */
    public function send(
        array $to,
        array $sender,
        string $subject,
        string $htmlContent,
        ?array $replyTo = null,
    ): void {
        $payload = [
            'sender' => $sender,
            'to' => $to,
            'subject' => $subject,
            'htmlContent' => $htmlContent,
        ];

        if ($replyTo !== null) {
            $payload['replyTo'] = $replyTo;
        }

        Http::withHeaders([
            'accept' => 'application/json',
            'api-key' => config('services.brevo.api_key'),
            'content-type' => 'application/json',
        ])
            ->timeout(20)
            ->post('https://api.brevo.com/v3/smtp/email', $payload)
            ->throw();
    }
}