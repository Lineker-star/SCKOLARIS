<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Les jetons Sanctum expirés ne déclenchent aucun événement — on rattrape
// ça avec une vérification périodique (voir MarkExpiredSessionsOffline).
// Nécessite que le planificateur tourne réellement : `php artisan
// schedule:work` en dev, ou une entrée cron `* * * * * php artisan
// schedule:run` en production (voir deploiement.md).
Schedule::command('users:mark-expired-offline')->everyFiveMinutes();
