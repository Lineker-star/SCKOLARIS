<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'up'],

    'allowed_methods' => ['*'],

    // Liste d'origines séparées par des virgules dans CORS_ALLOWED_ORIGINS
    // (ex: https://e-biblio.vercel.app,https://e-biblio-iuztf.vercel.app).
    // Le frontend web (Vercel) et le backend (Railway) sont sur des
    // domaines différents : sans ça, le navigateur bloque toutes les
    // requêtes de l'app web vers l'API.
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '')))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
