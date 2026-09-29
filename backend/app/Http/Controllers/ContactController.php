<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Support\BrevoMailer;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(private readonly BrevoMailer $mailer)
    {
    }

    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $name = $request->validated('name');
        $senderEmail = $request->validated('email');
        $topic = $request->validated('subject');
        $body = $request->validated('message');

        $this->mailer->send(
            to: [['email' => config('services.contact.address')]],
            sender: [
                'email' => config('services.brevo.from_address'),
                'name' => config('services.brevo.from_name'),
            ],
            subject: 'SCKOLARIS — '.$topic,
            htmlContent: '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a">'
                .'<h2>Nouveau message — formulaire de contact SCKOLARIS</h2>'
                .'<p><strong>Nom :</strong> '.e($name).'</p>'
                .'<p><strong>E-mail :</strong> '.e($senderEmail).'</p>'
                .'<p><strong>Sujet :</strong> '.e($topic).'</p>'
                .'<p style="white-space:pre-wrap">'.e($body).'</p></body></html>',
            replyTo: ['email' => $senderEmail, 'name' => $name],
        );

        return response()->json(['message' => 'Message envoyé.'], 201);
    }
}
