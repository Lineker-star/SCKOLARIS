<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Filet de sécurité en plus de trustProxies() (bootstrap/app.php) :
        // si jamais X-Forwarded-Proto n'était pas transmis correctement par
        // Railway, les URLs signées (lecture en ligne) seraient générées en
        // http:// et bloquées par le navigateur en contenu mixte sur le
        // site HTTPS. APP_URL vaut https://... uniquement en production.
        if (str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }
}
