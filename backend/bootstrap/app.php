<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Railway (comme tout PaaS) termine le HTTPS à son load-balancer et
        // transmet en HTTP en interne — sans faire confiance à
        // X-Forwarded-Proto, Laravel croit que chaque requête est en HTTP et
        // génère des URLs signées en http:// ; le navigateur bloque alors
        // leur fetch() depuis la page HTTPS (contenu mixte). L'adresse du
        // proxy Railway n'est pas fixe, d'où '*'.
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckUserRole::class,
            'validated' => \App\Http\Middleware\CheckAccountValidated::class,
            'active' => \App\Http\Middleware\CheckAccountActive::class,
            'track.activity' => \App\Http\Middleware\TrackDailyActivity::class,
            'release.access' => \App\Http\Middleware\ReleaseAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
