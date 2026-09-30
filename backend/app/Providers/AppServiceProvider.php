<?php

namespace App\Providers;

use App\Services\Ai\Contracts\TextExtractorInterface;
use App\Services\Ai\PdfTextExtractor;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Seul format pris en charge pour l'instant par l'indexation IA —
        // voir DocumentRagService, qui marque les autres formats
        // "unsupported_format" avant même d'atteindre cette classe.
        $this->app->bind(TextExtractorInterface::class, PdfTextExtractor::class);
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
