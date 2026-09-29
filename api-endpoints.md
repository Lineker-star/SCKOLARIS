# SCKOLARIS — Endpoints API

Référence de toutes les routes exposées par `backend/routes/api.php`. Toutes les routes sont préfixées automatiquement par `/api` (voir `bootstrap/app.php`). Auth via **Laravel Sanctum**, en-tête `Authorization: Bearer <token>`.

---

## Authentification

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| POST | `/api/register` | non | — | `AccountController@register` |
| POST | `/api/login` | non | — | `AccountController@login` (jeton valable 1 jour ; marque `is_online = true`) |
| POST | `/api/contact` | non | — | `ContactController@store` (limité à 5 requêtes/minute) |
| POST | `/api/forgot-password` | non | — | `PasswordResetController@sendResetLink` |
| POST | `/api/reset-password` | non | — | `PasswordResetController@reset` |
| POST | `/api/chat` | non | — | `ChatController@message` (limité à 10 requêtes/minute) |
| GET | `/api/app-releases` | non | — | `AppReleaseController@index` |
| GET | `/api/documents/{document}/read-stream` | non | — | URL signée temporaire, 5 minutes |
| POST | `/api/logout` | oui | tout statut | `AccountController@logout` (révoque le jeton courant ; marque `is_online = false`) |
| GET | `/api/me` | oui | tout statut | `AccountController@me` |
| POST | `/api/me/password` | oui | tout statut | `AccountController@updatePassword` (champs : `current_password`, `password`, `password_confirmation`) |

## Comptes (administration)

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| GET | `/api/accounts` | oui | admin | `AccountController@index` |
| GET | `/api/accounts/pending` | oui | admin | `AccountController@pending` |
| GET | `/api/accounts/{account}` | oui | admin | `AccountController@show` |
| PATCH | `/api/accounts/{account}` | oui | admin | `AccountController@updateStatus` |
| PATCH | `/api/accounts/{account}/role` | oui | admin | `AccountController@updateRole` |
| PATCH | `/api/accounts/{account}/deactivate` | oui | admin | `AccountController@deactivate` |
| PATCH | `/api/accounts/{account}/reactivate` | oui | admin | `AccountController@reactivate` |

## Catalogue et consultation

Accessibles à tout compte authentifié, **y compris `pending`** (section 7 du brief).

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| GET | `/api/catalog` | oui | tout statut | `CatalogController@index` |
| GET | `/api/documents/{document}` | oui | tout statut | `CatalogController@show` |
| GET | `/api/documents/{document}/read` | oui | tout statut | `DocumentController@read` |
| GET | `/api/documents/{document}/read-link` | oui | tout statut | `DocumentController@readLink` |

**Paramètres de requête `/api/catalog`** (tous optionnels, filtres cumulables) :
- `title`, `author`, `program` — filtre partiel (`ilike`) sur la colonne correspondante
- `domain_id`, `subdomain_id` — filtres de taxonomie
- `search` — recherche partielle sur `title` et `author` combinés

## Taxonomie et bibliothèque

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| GET | `/api/domains` | oui | tout statut |
| POST | `/api/domains` | oui | admin |
| PUT | `/api/domains/{domain}` | oui | admin |
| DELETE | `/api/domains/{domain}` | oui | admin |
| POST | `/api/domains/{domain}/subdomains` | oui | admin |
| PUT | `/api/subdomains/{subdomain}` | oui | admin |
| DELETE | `/api/subdomains/{subdomain}` | oui | admin |
| GET | `/api/library` | oui | validated |
| DELETE | `/api/library/{document}` | oui | validated |

## Téléchargement (compte `validated` uniquement)

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| POST | `/api/documents/{document}/download` | oui | validated | `DocumentController@download` |
| GET | `/api/downloads` | oui | validated | `DocumentController@downloads` |

## Dépôts de l'enseignant

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| GET | `/api/my-uploads` | oui | teacher | `DocumentController@myUploads` |
| POST | `/api/documents/{document}/deletion-request` | oui | teacher (dépositaire) | `DeletionRequestController@store` |

## Gestion des documents

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| POST | `/api/documents` | oui | teacher ou admin | `DocumentController@store` |
| PUT | `/api/documents/{document}` | oui | teacher (dépositaire) ou admin | `DocumentController@update` |
| DELETE | `/api/documents/{document}` | oui | admin | `DocumentController@destroy` |

## Demandes de suppression (administration)

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| GET | `/api/deletion-requests` | oui | admin | `DeletionRequestController@index` |
| PATCH | `/api/deletion-requests/{deletionRequest}` | oui | admin | `DeletionRequestController@update` |

## Statistiques

| Méthode | Route | Auth | Rôle | Contrôleur |
|---|---|---|---|---|
| GET | `/api/statistics` | oui | admin | `AccountController@statistics` |

## Assistant Gemini

`POST /api/chat` reçoit une question, l'enrichit d'un contexte documentaire retrouvé par recherche lexicale dans les fichiers du projet (voir `ProjectRagService`), puis transmet une version limitée par rôle à Gemini via l'API HTTPS Google (niveau gratuit). La clé Gemini reste uniquement sur le backend; elle n'est jamais exposée au navigateur.

```json
{ "message": "Comment déposer un support de cours ?", "language": "fr" }
```

Réponse :

```json
{ "message": "Après validation de votre compte enseignant, ouvrez..." }
```

Le contexte envoyé dépend du rôle résolu côté serveur (`guest`, `student`, `teacher`, `admin`). Les fonctions d'administration ne sont donc pas décrites au chatbot d'un étudiant ou d'un enseignant.

---

## Détails de payload

### POST /api/register
```json
{
  "last_name": "Fotso",
  "first_name": "Awa",
  "role": "student",
  "registration_number": "26SWE118",
  "email": "awa.fotso@etu.iu-ztf.cm",
  "password": "********",
  "program": "Informatique",
  "avatar": "<fichier image>"
}
```
Le champ `role` accepte `student` ou `teacher`; `admin` est attribué uniquement par un administrateur. Le matricule est obligatoire pour un étudiant et facultatif pour un enseignant. La photo d'identité est obligatoire. Tout compte créé démarre `pending`.

Réponse `201` :
```json
{ "message": "Account created, pending validation.", "user": { "id": 42, "account_status": "pending" } }
```

### POST /api/login
```json
{ "identifier": "26SWE118", "password": "********" }
```
Réponse `200` :
```json
{ "token": "1|a1b2c3...", "user": { "id": 42, "first_name": "Awa", "last_name": "Fotso", "registration_number": "26SWE118", "email": "...", "role": "student", "account_status": "pending", "program": "Informatique", "is_active": true } }
```
`identifier` accepte le matricule ou l'e-mail. Erreur `401` si identifiants incorrects, `403` si compte désactivé. L'objet `user` complet (moins `password`) est renvoyé pour que le frontend n'ait pas à refaire d'appel juste après connexion.

### GET /api/me
Renvoie `{ "user": { ... } }` — le profil complet de l'utilisateur authentifié (même forme que ci-dessus). Utile pour rafraîchir les données après une modification côté admin (ex. validation de compte).

### POST /api/me (multipart/form-data)
Met à jour son propre profil. Tous les champs sont optionnels (`sometimes`). Pour un domaine existant, envoyer `domain_id`; pour « Autre », laisser `domain_id` vide et envoyer le nom dans `study_domain`.
| Champ | Type | Contrainte |
|---|---|---|
| first_name | string | max 50 |
| last_name | string | max 50 |
| program | string | nullable, max 50 |
| domain_id | entier | nullable, doit exister dans `domains` |
| study_domain | string | nullable, max 100 — nom libre lorsque « Autre » est choisi |
| secondary_email | string | nullable, email valide, max 100, unique, différent de l'email principal |
| avatar | fichier image | jpg/jpeg/png/webp, max 2 Mo, facultatif |

`registration_number` et `email` (l'email principal, saisi à l'inscription) ne sont pas modifiables via cette route. Renvoie `{ "user": { ..., "avatar_url": "http://.../storage/avatars/xxx.jpg" } }` — `avatar_url` est `null` tant qu'aucune photo n'a été déposée. Les photos sont servies publiquement (disque `public`, contrairement aux documents de cours qui restent sur le disque privé).

### GET /api/accounts/{account}
Renvoie `{ "account": { ... }, "deposited_documents_count": 3, "downloads_count": 12 }` — profil complet d'un utilisateur donné, plus deux compteurs d'activité, pour la page de détail admin.

### PATCH /api/accounts/{account}
```json
{ "account_status": "validated" }
```
`account_status` limité à `validated` ou `rejected`.

### PATCH /api/accounts/{account}/role
```json
{ "role": "teacher" }
```
`role` accepte `student`, `teacher` ou `admin` — l'admin peut promouvoir n'importe quel utilisateur vers n'importe quel rôle, y compris `admin`.

### PATCH /api/accounts/{account}/deactivate
Aucun corps requis. Désactive le compte (`is_active = false`) — il reste en base mais ne peut plus se connecter ni utiliser un token déjà émis. Un admin ne peut pas désactiver son propre compte (`403`).

### PATCH /api/accounts/{account}/reactivate
Aucun corps requis. Réactive le compte (`is_active = true`).

### POST /api/documents (multipart/form-data)
| Champ | Type | Contrainte |
|---|---|---|
| title | string | requis, max 150 |
| author | string | requis, max 100 |
| subdomain_id | entier | requis, doit exister dans `subdomains` |
| program | string | facultatif, max 50 |
| summary | string | facultatif |
| file | fichier | requis, pdf/docx/pptx, max 512000 Ko (environ 500 Mo) |
| cover | fichier image | facultatif, jpg/jpeg/png/webp, max 2 Mo |

### PUT /api/documents/{document} (multipart/form-data)
Mêmes champs que `POST /api/documents`, tous optionnels (`sometimes`). Réservé au dépositaire (enseignant) ou à l'admin.

### POST /api/documents/{document}/deletion-request
```json
{ "justification": "Contenu obsolète, remplacé par une version 2026." }
```
Réponse `201` :
```json
{ "deletion_request": { "id": 14, "status": "pending" } }
```
Erreur `403` si le document n'appartient pas à l'enseignant, `409` si une demande est déjà en attente pour ce document.

### PATCH /api/deletion-requests/{deletionRequest}
```json
{ "decision": "approved" }
```
`decision` : `approved` ou `rejected`. Si `approved`, le document et son fichier sont supprimés définitivement.

### Releases

`POST /api/app-releases` et `DELETE /api/app-releases/{platform}` sont protégés par `X-Release-Token` (`RELEASE_UPLOAD_TOKEN`) ou par un compte admin actif. Ces routes sont volontairement hors du groupe `auth:sanctum`.

---

## Codes d'erreur courants

| Code | Signification |
|---|---|
| 401 | Identifiants incorrects / non authentifié |
| 403 | Rôle insuffisant, compte non validé, ou document n'appartenant pas à l'utilisateur |
| 404 | Ressource introuvable |
| 409 | Conflit (numéro d'inscription déjà utilisé, demande de suppression déjà en attente) |
| 422 | Validation échouée (Form Request) |

---

*Généré à partir de `backend/routes/api.php` — à tenir à jour si les routes évoluent.*
