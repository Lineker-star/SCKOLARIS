<?php

namespace App\Notifications;

use App\Notifications\Channels\BrevoChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DeletionRequestDecisionNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly string $documentTitle,
        private readonly string $subject,
        private readonly string $program,
        private readonly string $decision,
    ) {
    }

    public function via(mixed $notifiable): array
    {
        return ['database', BrevoChannel::class];
    }

    public function toDatabase(): array
    {
        return [
            'kind' => 'deletion_request_decision',
            'title' => $this->documentTitle,
            'subject' => $this->subject,
            'program' => $this->program,
            'decision' => $this->decision,
            'url' => '/mes-depots',
        ];
    }

    /**
     * @return array{subject: string, html: string}
     */
    public function toBrevo(mixed $notifiable): array
    {
        $approved = $this->decision === 'approved';
        $decisionLabel = $approved ? 'approuvée' : 'refusée';
        $message = $approved
            ? 'Votre support a été retiré définitivement du catalogue.'
            : 'Votre support reste disponible dans le catalogue.';

        $logoUrl = config('services.frontend.url').'/logo-email.png';

        return [
            'subject' => 'SCKOLARIS — Demande de suppression '.$decisionLabel,
            'html' => '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6">'
                .'<div style="text-align:center;margin-bottom:20px"><img src="'.e($logoUrl).'" alt="SCKOLARIS" style="width:88px;height:88px;border-radius:18px;display:inline-block" /></div>'
                .'<h2>SCKOLARIS Universite ZTF</h2><p>Bonjour '.e($notifiable->first_name).',</p>'
                .'<p>Votre demande de suppression concernant le support <strong>'.e($this->documentTitle).'</strong> a été <strong>'.e($decisionLabel).'</strong> par un administrateur.</p>'
                .'<p>'.e($message).'</p>'
                .'<p><a href="'.e(config('services.frontend.url').'/mes-depots').'" style="display:inline-block;background:#001c40;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">Voir mes dépôts</a></p>'
                .'</body></html>',
        ];
    }
}