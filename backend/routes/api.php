<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AiAdministrationController;
use App\Http\Controllers\AiConversationController;
use App\Http\Controllers\AiFeedbackController;
use App\Http\Controllers\AppReleaseController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DeletionRequestController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\SubdomainController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AccountController::class, 'register']);
Route::post('login', [AccountController::class, 'login']);

// Public (pas besoin de compte pour écrire) — limité pour éviter qu'un
// script n'inonde la boîte mail officielle.
Route::post('contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

// Publiques (on ne peut pas être connecté sans mot de passe) — limitées
// pour éviter qu'un script ne déclenche des envois en boucle.
Route::post('forgot-password', [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:5,1');
Route::post('reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1');
Route::post('chat', [ChatController::class, 'message'])->middleware('throttle:10,1');

// Cible d'URL signée (voir DocumentController::readLink) — volontairement
// hors du groupe auth:sanctum, protégée par la signature elle-même.
Route::get('documents/{document}/read-stream', [DocumentController::class, 'readStream'])
    ->name('documents.read-stream')
    ->middleware('signed');

// Publique et volontairement sans authentification : l'app desktop
// (processus principal Electron, pas de jeton disponible) et l'app mobile
// doivent pouvoir vérifier une nouvelle version dès le lancement, avant
// même une éventuelle connexion. Contenu non sensible (URLs/numéros de
// version des installeurs).
Route::get('app-releases', [AppReleaseController::class, 'index']);
Route::get('app-releases/{platform}/download', [AppReleaseController::class, 'download'])
    ->name('app-releases.download');

// Dépôt/retrait d'un installeur — volontairement hors du groupe
// auth:sanctum ci-dessous : ReleaseAccess accepte soit un jeton fixe
// (indépendant de tout compte, voir sa docblock), soit un compte admin
// connecté, et doit donc pouvoir s'exécuter même sans jeton Sanctum valide.
Route::middleware('release.access')->group(function () {
    Route::post('app-releases', [AppReleaseController::class, 'store']);
    Route::delete('app-releases/{platform}', [AppReleaseController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'active', 'track.activity'])->group(function () {
    Route::get('me', [AccountController::class, 'me']);
    Route::post('me', [AccountController::class, 'updateProfile']);
    Route::post('me/password', [AccountController::class, 'updatePassword']);
    Route::post('logout', [AccountController::class, 'logout']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);

    // Comptes (admin)
    Route::get('accounts', [AccountController::class, 'index'])
        ->middleware('role:admin');
    Route::get('accounts/pending', [AccountController::class, 'pending'])
        ->middleware('role:admin');
    Route::get('accounts/{account}', [AccountController::class, 'show'])
        ->middleware('role:admin');
    Route::patch('accounts/{account}', [AccountController::class, 'updateStatus'])
        ->middleware('role:admin');
    Route::patch('accounts/{account}/role', [AccountController::class, 'updateRole'])
        ->middleware('role:admin');
    Route::patch('accounts/{account}/deactivate', [AccountController::class, 'deactivate'])
        ->middleware('role:admin');
    Route::patch('accounts/{account}/reactivate', [AccountController::class, 'reactivate'])
        ->middleware('role:admin');

    // Catalogue et consultation (tout statut, y compris pending)
    Route::get('catalog', [CatalogController::class, 'index']);
    Route::get('documents/{document}', [CatalogController::class, 'show']);
    Route::get('documents/{document}/read', [DocumentController::class, 'read']);
    Route::get('documents/{document}/read-link', [DocumentController::class, 'readLink']);

    // Taxonomie (domaines / sous-domaines) — lecture ouverte à tout statut (comme /catalog),
    // gestion réservée à l'admin
    Route::get('domains', [DomainController::class, 'index']);
    Route::post('domains', [DomainController::class, 'store'])
        ->middleware('role:admin');
    Route::put('domains/{domain}', [DomainController::class, 'update'])
        ->middleware('role:admin');
    Route::delete('domains/{domain}', [DomainController::class, 'destroy'])
        ->middleware('role:admin');
    Route::post('domains/{domain}/subdomains', [SubdomainController::class, 'store'])
        ->middleware('role:admin');
    Route::put('subdomains/{subdomain}', [SubdomainController::class, 'update'])
        ->middleware('role:admin');
    Route::delete('subdomains/{subdomain}', [SubdomainController::class, 'destroy'])
        ->middleware('role:admin');

    // Téléchargement (compte validé uniquement)
    Route::post('documents/{document}/download', [DocumentController::class, 'download'])
        ->middleware('validated');
    Route::get('downloads', [DocumentController::class, 'downloads'])
        ->middleware('validated');

    // Bibliothèque hors-ligne (synchronisée entre appareils)
    Route::get('library', [LibraryController::class, 'index'])
        ->middleware('validated');
    Route::delete('library/{document}', [LibraryController::class, 'destroy'])
        ->middleware('validated');

    // Dépôts (enseignant ou admin) — "validated" en plus du rôle : un
    // enseignant auto-inscrit (voir RegisterRequest) reste "pending" comme
    // un étudiant tant qu'un admin ne l'a pas validé, et ne doit donc pas
    // pouvoir déposer/gérer de documents avant cette étape, même si son
    // rôle "teacher" est déjà attribué dès l'inscription.
    Route::get('my-uploads', [DocumentController::class, 'myUploads'])
        ->middleware(['role:teacher,admin', 'validated']);
    Route::post('documents/{document}/deletion-request', [DeletionRequestController::class, 'store'])
        ->middleware(['role:teacher', 'validated']);

    // Gestion des documents (enseignant ou admin ; propriété vérifiée en contrôleur pour l'enseignant)
    Route::post('documents', [DocumentController::class, 'store'])
        ->middleware(['role:teacher,admin', 'validated']);
    Route::put('documents/{document}', [DocumentController::class, 'update'])
        ->middleware(['role:teacher,admin', 'validated']);
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])
        ->middleware('role:admin');

    // Demandes de suppression (admin)
    Route::get('deletion-requests', [DeletionRequestController::class, 'index'])
        ->middleware('role:admin');
    Route::patch('deletion-requests/{deletionRequest}', [DeletionRequestController::class, 'update'])
        ->middleware('role:admin');

    // Statistiques (admin)
    Route::get('statistics', [AccountController::class, 'statistics'])
        ->middleware('role:admin');
    // Statistiques détaillées (courbes, calculées en R) — voir StatsController
    Route::get('analytics', [StatsController::class, 'index'])
        ->middleware('role:admin');

    // Historique des conversations IA (Sckolaris AI) — réservé aux comptes
    // authentifiés, propriété vérifiée en contrôleur.
    Route::middleware('throttle:30,1')->group(function () {
        Route::get('ai/conversations', [AiConversationController::class, 'index']);
        Route::get('ai/conversations/{conversation}', [AiConversationController::class, 'show']);
        Route::delete('ai/conversations/{conversation}', [AiConversationController::class, 'destroy']);
        Route::post('ai/feedback', [AiFeedbackController::class, 'store']);
    });

    // Administration de l'IA (indexation, usage) — voir DocumentRagService
    Route::middleware('role:admin')->group(function () {
        Route::get('admin/ai/documents', [AiAdministrationController::class, 'documents']);
        Route::post('admin/ai/documents/{document}/index', [AiAdministrationController::class, 'index']);
        Route::get('admin/ai/usage', [AiAdministrationController::class, 'usage']);
    });

});
