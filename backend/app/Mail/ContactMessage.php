<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Alternative à formsubmit.co (service tiers gratuit, contourne
 * complètement le backend, exige une confirmation manuelle "Activate Form"
 * avant de relayer le premier message, et envoie vers une adresse Gmail
 * personnelle codée en dur dans le frontend) — prête si un jour rebranchée
 * (voir ContactController), via le mailer SMTP configuré dans .env (Brevo
 * en production), vers l'adresse officielle configurée dans
 * services.contact.address. Non utilisée actuellement : Contact.jsx
 * continue volontairement d'appeler formsubmit.co directement.
 */
class ContactMessage extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $senderEmail,
        public string $topic,
        public string $body,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "SCKOLARIS — {$this->topic}",
            replyTo: [$this->senderEmail],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.contact');
    }
}
