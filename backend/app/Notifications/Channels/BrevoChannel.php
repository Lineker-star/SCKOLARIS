<?php

namespace App\Notifications\Channels;

use App\Support\BrevoMailer;

class BrevoChannel
{
    public function __construct(private readonly BrevoMailer $mailer)
    {
    }

    public function send(mixed $notifiable, mixed $notification): void
    {
        $message = $notification->toBrevo($notifiable);

        $this->mailer->send(
            to: [[
                'email' => $notifiable->email,
                'name' => trim($notifiable->first_name.' '.$notifiable->last_name),
            ]],
            sender: [
                'email' => config('services.brevo.from_address'),
                'name' => config('services.brevo.from_name'),
            ],
            subject: $message['subject'],
            htmlContent: $message['html'],
        );
    }
}