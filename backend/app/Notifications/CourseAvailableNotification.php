<?php

namespace App\Notifications;

use App\Notifications\Channels\BrevoChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class CourseAvailableNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly array $documentData)
    {
    }

    public function via(mixed $notifiable): array
    {
        return ['database', BrevoChannel::class];
    }

    public function toDatabase(): array
    {
        return [
            'kind' => 'course_available',
            'title' => $this->documentData['title'],
            'subject' => $this->documentData['subject'],
            'domain' => $this->documentData['domain'],
            'program' => $this->documentData['program'],
            'summary' => $this->documentData['summary'],
            'url' => '/documents/'.$this->documentData['id'],
        ];
    }

    /**
     * @return array{subject: string, html: string}
     */
    public function toBrevo(mixed $notifiable): array
    {
        $data = $this->toDatabase();
        $url = config('services.frontend.url').$data['url'];

        $logoUrl = config('services.frontend.url').'/logo-email.png';

        return [
            'subject' => 'SCKOLARIS — Nouveau support disponible dans votre filière',
            'html' => '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6">'
                .'<div style="text-align:center;margin-bottom:20px"><img src="'.e($logoUrl).'" alt="SCKOLARIS" style="width:88px;height:88px;border-radius:18px;display:inline-block" /></div>'
                .'<h2>SCKOLARIS Universite ZTF</h2><p>Bonjour '.e($notifiable->first_name).',</p>'
                .'<p>Un nouveau support de cours est disponible dans votre domaine d’étude et votre filière.</p>'
                .'<p><strong>Titre :</strong> '.e($data['title']).'<br>'
                .'<strong>Domaine d’étude :</strong> '.e($data['domain']).'<br>'
                .'<strong>Sous-domaine :</strong> '.e($data['subject']).'<br>'
                .'<strong>Filière :</strong> '.e($data['program']).'</p>'
                .($data['summary'] ? '<p><strong>Résumé :</strong> '.e($data['summary']).'</p>' : '')
                .'<p><a href="'.e($url).'" style="display:inline-block;background:#001c40;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">Consulter le support</a></p>'
                .'<p>Connectez-vous à SCKOLARIS pour le lire ou le télécharger.</p></body></html>',
        ];
    }
}