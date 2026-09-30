<?php

return [

    'gemini' => [
        // Assistant chat (ChatController), niveau gratuit — voir aussi
        // ProjectRagService pour la recherche documentaire plateforme (ne
        // dépend d'aucune clé API) et DocumentRagService pour la recherche
        // sémantique dans le contenu des documents (embeddings, utilise
        // cette même clé).
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.6-flash'),
        'embedding_model' => env('GEMINI_EMBEDDING_MODEL', 'gemini-embedding-001'),
    ],

    'ai' => [
        // Taille maximale (Mo) d'un document indexé pour la recherche
        // sémantique — au-delà, DocumentRagService marque le document
        // "too_large" sans tenter l'extraction (protège le worker de queue
        // contre l'OOM sur les très gros PDF, jusqu'à 500 Mo autorisés à
        // l'upload).
        'max_indexable_file_mb' => env('AI_MAX_INDEXABLE_FILE_MB', 100),
    ],

    'brevo' => [
        'api_key' => env('BREVO_API_KEY'),
        'from_address' => env('MAIL_FROM_ADDRESS'),
        'from_name' => env('MAIL_FROM_NAME', env('APP_NAME', 'SCKOLARIS')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'contact' => [
        // Destination du formulaire de contact (ContactController) —
        // séparé de MAIL_FROM_ADDRESS (l'expéditeur technique, souvent une
        // adresse sur un domaine vérifié chez le fournisseur d'envoi) car ce
        // n'est pas forcément la même adresse.
        'address' => env('CONTACT_EMAIL', 'biblio@iu-ztf.cm'),
    ],

    'frontend' => [
        // Base du site web (pas mobile/desktop) — sert à construire le lien
        // cliquable envoyé par e-mail lors d'une réinitialisation de mot de
        // passe (ResetPasswordNotification). Le lien ouvre toujours le
        // navigateur, quelle que soit l'app depuis laquelle la demande a été
        // faite : c'est la seule cible qui a du sens pour un clic dans un
        // e-mail.
        'url' => env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'releases' => [
        // Jeton fixe permettant de déposer/retirer un installeur desktop ou
        // mobile sans passer par un compte utilisateur admin (voir
        // ReleaseAccess) — pensé pour rester valable même si les comptes
        // admin de l'application sont un jour gérés entièrement par l'école.
        'token' => env('RELEASE_UPLOAD_TOKEN'),
    ],

    'r' => [
        // Chemin vers l'exécutable Rscript (StatsController) — 'Rscript' tout
        // court suffit quand il est sur le PATH (cas attendu en production
        // via nixpacks.toml), mais certains environnements locaux (Laravel
        // Herd notamment) démarrent PHP depuis un service en arrière-plan qui
        // ne reprend pas un PATH modifié après coup, même dans un nouveau
        // terminal — un chemin absolu dans RSCRIPT_BIN contourne ce problème
        // sans dépendre du PATH du tout.
        'script_bin' => env('RSCRIPT_BIN', 'Rscript'),
    ],

];
