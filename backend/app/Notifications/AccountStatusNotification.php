<?php

namespace App\Notifications;

use App\Support\EmailBranding;

use App\Enums\Role;
use App\Notifications\Channels\BrevoChannel;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Un seul type de notification pour les quatre changements de statut de
 * compte qu'un admin peut déclencher (validation, rejet, désactivation,
 * réactivation) — leur contenu est étroitement lié (même sujet : "que
 * devient mon compte ?"), regrouper évite quatre classes quasi identiques.
 * Toujours envoyée à l'e-mail principal (Notifiable::routeNotificationFor
 * utilise User::$email par défaut, jamais secondary_email).
 *
 * Le contenu tient compte du rôle choisi par le destinataire à
 * l'inscription (étudiant/enseignant) — jamais de mention générique du
 * genre "si vous êtes enseignant" qui n'aurait aucun sens pour un étudiant
 * qui reçoit ce même e-mail. Toutes les validations passent par un
 * administrateur uniquement (voir routes/api.php,
 * PATCH /accounts/{account} est en role:admin, jamais accessible à un
 * enseignant) — jamais "un enseignant ou un administrateur".
 */
class AccountStatusNotification extends Notification
{
    public function __construct(private readonly string $type)
    {
    }

    public function type(): string
    {
        return $this->type;
    }

    /**
     * @return array<int, string>
     */
    public function via(mixed $notifiable): array
    {
        return [BrevoChannel::class];
    }

    /**
     * @return array{subject: string, html: string}
     */
    private function contentFor(mixed $notifiable): array
    {
        $loginUrl = config('services.frontend.url').'/connexion';
        $isTeacher = $notifiable->role === Role::TEACHER;
        $roleLabel = $isTeacher ? 'enseignant' : 'étudiant';

        return match ($this->type) {
            'validated' => [
                'subject' => 'SCKOLARIS — Votre compte a été validé',
                'lines' => [
                    "Bonne nouvelle : votre compte {$roleLabel} SCKOLARIS a été validé par un administrateur de l'Universite ZTF.",
                    'Bienvenue dans la bibliothèque numérique de l\'Universite ZTF ! Nous sommes heureux de vous compter parmi notre communauté.',
                    $isTeacher
                        ? 'Vous avez maintenant accès aux téléchargements et au dépôt de vos supports de cours.'
                        : 'Vous avez maintenant accès aux téléchargements et à votre bibliothèque personnelle.',
                ],
                'action' => ['label' => 'Me connecter', 'url' => $loginUrl],
            ],
            'rejected' => [
                'subject' => "SCKOLARIS — Votre demande d'inscription n'a pas été retenue",
                'lines' => [
                    "Votre demande de création de compte {$roleLabel} SCKOLARIS n'a pas été validée par un administrateur.",
                    'Cette décision est définitive.',
                    "Pour toute question, contactez-nous à ".config('services.contact.address').'.',
                ],
                'action' => null,
            ],
            'deactivated' => [
                'subject' => 'SCKOLARIS — Votre compte a été désactivé',
                'lines' => [
                    "Votre compte {$roleLabel} SCKOLARIS a été désactivé par un administrateur.",
                    "Veuillez vous rapprocher de l'administration pour savoir plus sur la résolution du problème actuel.",
                    $isTeacher
                        ? "Vous ne pouvez plus vous connecter, télécharger ni déposer de support tant qu'il n'aura pas été réactivé."
                        : "Vous ne pouvez plus vous connecter ni télécharger tant qu'il n'aura pas été réactivé.",
                ],
                'action' => null,
            ],
            'reactivated' => [
                'subject' => 'SCKOLARIS — Votre compte a été réactivé',
                'lines' => [
                    "Votre compte {$roleLabel} SCKOLARIS a été réactivé par un administrateur.",
                    $isTeacher
                        ? 'Vous pouvez de nouveau vous connecter, télécharger et déposer vos supports.'
                        : 'Vous pouvez de nouveau vous connecter et télécharger des documents.',
                ],
                'action' => ['label' => 'Me connecter', 'url' => $loginUrl],
            ],
            default => [
                'subject' => 'SCKOLARIS — Mise à jour de votre compte',
                'lines' => [],
                'action' => null,
            ],
        };
    }

    public function toMail(mixed $notifiable): MailMessage
    {
        $content = $this->contentFor($notifiable);

        $mail = (new MailMessage)
            ->subject($content['subject'])
            ->greeting('Bonjour '.e($notifiable->first_name).' !');

        foreach ($content['lines'] as $line) {
            $mail->line($line);
        }

        if ($content['action']) {
            $mail->action($content['action']['label'], $content['action']['url']);
        }

        return $mail;
    }

    public function toBrevo(mixed $notifiable): array
    {
        $content = $this->contentFor($notifiable);        $html = '<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6">'
            .EmailBranding::logoHtml()
            .'<h2>SCKOLARIS Universite ZTF</h2><p>Bonjour '.e($notifiable->first_name).',</p>';
        foreach ($content['lines'] as $line) {
            $html .= '<p>'.e($line).'</p>';
        }
        if ($content['action']) {
            $html .= '<p><a href="'.e($content['action']['url']).'" style="display:inline-block;background:#001c40;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">'.e($content['action']['label']).'</a></p>';
        }
        $html .= '</body></html>';

        return ['subject' => $content['subject'], 'html' => $html];
    }
}
