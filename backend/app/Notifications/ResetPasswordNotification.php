<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordBase;
use App\Notifications\Channels\BrevoChannel;

/**
 * Remplace le contenu par défaut (en anglais, et pointant vers une route web
 * du backend qui n'existe pas dans cette architecture API+SPA) de la
 * notification native `Illuminate\Auth\Notifications\ResetPassword` — voir
 * User::sendPasswordResetNotification(). Le lien ouvre une page du site web
 * (frontend-web), qui appelle ensuite POST /reset-password.
 */
class ResetPasswordNotification extends ResetPasswordBase
{
    public function via(mixed $notifiable): array
    {
        return [BrevoChannel::class];
    }

    /**
     * @return array{subject: string, html: string}
     */
    public function toBrevo(mixed $notifiable): array
    {
        $url = config('services.frontend.url')
            .'/reinitialiser-mot-de-passe?token='.$this->token
            .'&email='.urlencode($notifiable->getEmailForPasswordReset());

        $safeUrl = e($url);

        $logoUrl = config('services.frontend.url').'/logo-email.png';

        return [
            'subject' => 'SCKOLARIS — Réinitialisation de votre mot de passe',
            'html' => '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6">'
                .'<div style="text-align:center;margin-bottom:20px"><img src="'.e($logoUrl).'" alt="SCKOLARIS" style="width:88px;height:88px;border-radius:18px;display:inline-block" /></div>'
                .'<h2>SCKOLARIS Universite ZTF</h2><p>Bonjour,</p>'
                .'<p>Vous recevez cet e-mail car une demande de réinitialisation de mot de passe a été effectuée pour votre compte SCKOLARIS.</p>'
                .'<p><a href="'.$safeUrl.'" style="display:inline-block;background:#001c40;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">Réinitialiser mon mot de passe</a></p>'
                .'<p>Ce lien expirera dans 24 heures.</p>'
                .'<p>Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p></body></html>',
        ];
    }
}
