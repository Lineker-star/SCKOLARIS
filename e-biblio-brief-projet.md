# SCKOLARIS — Brief de projet complet

> Ce document consolide le cahier des charges, le document de conception et les spécifications techniques de SCKOLARIS en une seule référence. Il sert de contexte pour tout assistant IA participant au développement, afin qu'il n'ait pas à redécouvrir ou deviner des décisions déjà prises.

---

## 1. Vue d'ensemble

**SCKOLARIS** est une bibliothèque numérique privée pour l'**Institut Universitaire ZTF (IU-ZTF)**, à Bertoua, Cameroun. Elle remplace une bibliothèque physique jusqu'ici consultable uniquement sur place. Le projet est **entièrement numérique** : il n'existe aucun livre physique, aucune réservation, aucun emprunt physique dans ce système — toute cette dimension a été retirée en cours de conception.

La plateforme est **multiplateforme** : web, mobile, desktop, à partir d'une seule API. L'accès est **strictement réservé** à la communauté de l'IU-ZTF : chaque inscription est validée manuellement par un administrateur avant d'obtenir tous les droits.

Objectif général : offrir aux étudiants et enseignants un moyen simple et sécurisé de consulter et télécharger les ressources documentaires numériques de l'école, à distance, avec un accès réservé aux membres légitimes.

---

## 2. Contexte et problématique

La bibliothèque actuelle de l'IU-ZTF n'est accessible que sur place, aux heures d'ouverture, avec une gestion entièrement manuelle. Aucun moyen de consultation à distance n'existe. Cela impose des déplacements inutiles et limite l'usage du fonds documentaire par la communauté.

**Problématique** : comment permettre aux étudiants et enseignants de l'IU-ZTF de consulter, rechercher et accéder aux ressources documentaires numériques de l'école à distance — y compris hors connexion — tout en garantissant un accès strictement réservé à la communauté de l'établissement ?

---

## 3. Objectifs spécifiques

1. Centraliser le catalogue (documents numériques dans un catalogue unique consultable en ligne).
2. Faciliter la recherche (par titre, auteur, matière).
3. Donner accès à des ressources numériques téléchargeables (lecture hors connexion).
4. Simplifier la gestion de la bibliothèque (gestion informatisée du catalogue et des comptes).
5. Garantir un accès réservé (matricule + validation d'inscription).

---

## 4. Acteurs

| Acteur | Description |
|---|---|
| **Utilisateur** | Socle commun à l'Étudiant et à l'Enseignant : recherche, lecture, téléchargement. Détient un numéro d'inscription IU-ZTF. Statut de compte : `pending`, `validated`, ou `rejected`. |
| **Enseignant** | Un Utilisateur qui peut en plus déposer ses propres supports de cours et gérer ses dépôts (modifier, demander leur suppression). |
| **Administrateur** | Équipe bibliothécaire. Valide/refuse les inscriptions, gère le catalogue, traite les demandes de suppression, consulte les statistiques. Ne partage aucune fonctionnalité avec les deux autres acteurs. |

Le rôle **Administrateur n'est pas une classe/entité séparée** : c'est une valeur du champ `role` de la table `users` (avec `student` et `teacher`).

Un compte au statut **« pending »** peut déjà se connecter, consulter le catalogue et lire les documents en ligne — seul le téléchargement lui est fermé jusqu'à validation.

---

## 5. Besoins fonctionnels (BF01–BF22)

**Comptes et authentification**
- BF01 — Créer un compte avec un numéro d'inscription IU-ZTF.
- BF02 — Statut initial automatique : « pending ».
- BF03 — Un administrateur valide ou refuse un compte en attente.
- BF04 — Connexion possible quel que soit le statut du compte.
- BF05 — Consulter/modifier ses informations personnelles.
- BF06 — Réinitialiser son mot de passe.

**Consultation et recherche du catalogue**
- BF07 — Consulter le catalogue, même en attente de validation.
- BF08 — Rechercher par titre, auteur, matière.
- BF09 — Filtrer par filière, matière.
- BF10 — Consulter la fiche détaillée d'un document.

**Lecture et téléchargement**
- BF11 — Lire un document en ligne, même en attente.
- BF12 — Télécharger un document (compte validé uniquement).
- BF13 — Lecture hors connexion des documents téléchargés.
- BF14 — Consulter sa bibliothèque personnelle (téléchargements).

**Dépôt de supports de cours**
- BF15 — Un enseignant dépose un document numérique.
- BF16 — Le document déposé est associé à une matière/filière et apparaît dans les résultats de recherche du catalogue au même titre que les autres documents.

**Gestion de ses dépôts (Enseignant)**
- BF17 — Consulter la liste de ses propres dépôts.
- BF18 — Modifier un document qu'il a déposé.
- BF19 — Demander la suppression d'un document déposé, avec justification obligatoire ; ne retire pas immédiatement le document, soumis à approbation admin.

**Administration**
- BF20 — Un administrateur ajoute/modifie/retire un document.
- BF21 — Un administrateur consulte les demandes de suppression en attente (avec justification) et les approuve/refuse.
- BF22 — Un administrateur consulte les statistiques d'usage.

---

## 6. Besoins non fonctionnels (BNF01–BNF10)

**Sécurité**
- BNF01 — Mots de passe hachés, jamais en clair.
- BNF02 — Échanges en HTTPS uniquement.
- BNF03 — Chaque fonctionnalité vérifie rôle + statut de compte.
- BNF04 — Seules les personnes avec un numéro d'inscription IU-ZTF peuvent obtenir un compte.

**Compatibilité et disponibilité**
- BNF05 — Fonctionne sur web, mobile, desktop à partir d'une seule API.
- BNF06 — Utilisable avec une connexion internet modeste.
- BNF07 — Disponible en continu, indépendamment des horaires de la bibliothèque physique.

**Ergonomie**
- BNF08 — Utilisable sans formation préalable.
- BNF09 — Lecture hors ligne transparente, sans manipulation technique.

**Conformité**
- BNF10 — Seuls les documents autorisés (école ou auteurs) sont mis en téléchargement.

---

## 7. Règles de gestion

- Un compte « pending » : connexion, catalogue, lecture en ligne OK ; téléchargement refusé.
- Seul un compte « validated » peut télécharger.
- Seul un administrateur change le statut d'un compte.
- Un document déposé par un enseignant suit les mêmes règles de consultation/lecture/téléchargement/recherche que tout autre document.
- Un enseignant ne peut modifier/demander la suppression que de ses **propres** documents.
- **La suppression d'un document n'est jamais immédiate** : justification écrite de l'enseignant → approbation d'un administrateur. Le document reste visible tant que la demande est « pending ».

---

## 8. Cas d'utilisation

| Cas d'utilisation | Acteur(s) |
|---|---|
| S'inscrire | Utilisateur |
| Gérer son compte | Utilisateur |
| Consulter le catalogue | Utilisateur |
| Lire un document en ligne | Utilisateur |
| Télécharger un document | Utilisateur (validé) |
| Déposer un support de cours | Enseignant |
| Gérer ses dépôts | Enseignant |
| Valider une inscription | Administrateur |
| Gérer le catalogue | Administrateur |
| Traiter les demandes de suppression | Administrateur |
| Consulter les statistiques | Administrateur |

---

## 9. Modèle de données

Le modèle actuel ne contient **pas d'entité `Exemplaire` ni `Emprunt`**. Il conserve les quatre entités métier initiales et ajoute la taxonomie, les lectures, la bibliothèque synchronisée, les avatars et les releases. Tables, modèles et colonnes sont en anglais.

### Utilisateur → table `users` (celle générée par défaut par Laravel, modifiée)
| Colonne | Type | Contrainte |
|---|---|---|
| id | entier | clé primaire |
| last_name, first_name | chaîne | obligatoire |
| registration_number | chaîne(20) | unique; obligatoire pour `student`, facultatif pour `teacher` |
| email | chaîne(100) | obligatoire, unique |
| secondary_email | chaîne(100) | facultatif, unique |
| password | chaîne(255) | haché, jamais en clair |
| role | enum | student / teacher / admin |
| program | chaîne(50) | facultatif |
| account_status | enum | pending / validated / rejected |
| is_active | booléen | défaut `true` — désactivation/réactivation par un admin (distinct de `account_status`, voir section 21) |
| is_online | booléen | présence approximative, mis à jour à la connexion et par l'activité |
| avatar_path | chaîne | photo d'identité/profil, stockée sur le disque public |
| created_at | date | auto |

### Document → table `documents`
| Colonne | Type | Contrainte |
|---|---|---|
| id | entier | clé primaire |
| title, author | chaîne | obligatoire |
| subdomain_id | entier | clé étrangère → subdomains, obligatoire |
| program | chaîne(50) | facultatif — filière associée au document (BF09) |
| summary | texte | facultatif |
| file_path | chaîne(255) | facultatif pour les sources externes, rempli après mise en cache |
| cover_path | chaîne(255) | couverture facultative |
| source_url | chaîne(255) | source externe facultative, mise en cache au premier accès |
| uploaded_at | date | auto |
| uploaded_by_id | entier | clé étrangère → users |

### DemandeSuppression → table `deletion_requests`
| Colonne | Type | Contrainte |
|---|---|---|
| id | entier | clé primaire |
| document_id | entier | clé étrangère → documents, nullable, `ON DELETE SET NULL` (voir note ci-dessous) |
| justification | texte | obligatoire |
| status | enum | pending / approved / rejected |
| requested_at | date | auto |
| processed_at | date | facultatif |

### Telechargement → table `downloads`
| Colonne | Type | Contrainte |
|---|---|---|
| id | entier | clé primaire |
| user_id | entier | clé étrangère → users |
| document_id | entier | clé étrangère → documents |
| downloaded_at | date | auto |

### Entités ajoutées

- `domains` 1—0..* `subdomains`, administrables et utilisés par le catalogue.
- `reads` journalise les lectures d'un utilisateur sur un document.
- `document_library` associe un utilisateur aux documents conservés hors ligne; elle est distincte de `downloads`, qui reste un journal d'événements.
- `app_releases` conserve la dernière release publiée par plateforme (`windows` ou `android`).

**Relations** : Utilisateur 1—0..* Document (dépositaire) · Utilisateur 1—0..* Telechargement · Utilisateur 1—0..* Read · Utilisateur *—* Document (bibliothèque) · Document 1—0..* DemandeSuppression.

**Note (ajoutée après tests)** : `deletion_requests.document_id` est en `ON DELETE SET NULL` et non `CASCADE` comme initialement écrit en section 12. Testé en conditions réelles : avec `CASCADE`, approuver une demande de suppression supprime le document *et*, par cascade, la ligne `deletion_requests` qui vient d'être marquée « approved » — l'historique de la décision disparaît instantanément, ce qui contredit BF21/BF22 (traçabilité des décisions admin, statistiques). `SET NULL` préserve la ligne (`status`, `justification`, `processed_at`) avec `document_id` à `null` une fois le document effacé.

---

## 10. Architecture générale

Architecture à **trois niveaux** :
1. **Clients** (web React, mobile React Native, desktop Electron) — affichent les données, transmettent les actions.
2. **API** (Laravel) — applique toutes les règles de gestion, seul point d'accès à la base.
3. **Base de données** (PostgreSQL).

Les trois clients ne communiquent **jamais** directement entre eux ni avec la base — tout passe par l'API.

### Diagramme de déploiement (5 nœuds)
- Poste client web (navigateur) → app React (build statique) — HTTPS → Serveur d'application
- Smartphone (Android/iOS) → app React Native (Expo) — HTTPS → Serveur d'application
- Poste de bureau → app Electron — HTTPS → Serveur d'application
- Serveur d'application → API Laravel 12 + Sanctum — PostgreSQL (TCP/IP) → Serveur de base de données
- Serveur de base de données → PostgreSQL

(Serveur d'application et serveur de BD peuvent être la même machine ou deux machines distinctes selon la capacité d'hébergement.)

---

## 11. Stack technique (avec justification)

| Composant | Choix | Pourquoi |
|---|---|---|
| Backend | **PHP 8.2+ / Laravel 12** | Version minimale exigée par Laravel 12 ; Laravel 12 = cycle de support long |
| Base de données | **PostgreSQL** | Respect strict des standards SQL, licence open source sans restriction, types avancés (JSON) |
| Admin BD | **pgAdmin** | Équivalent PostgreSQL de MySQL Workbench |
| Auth API | **Laravel Sanctum** | Authentification légère adaptée à plusieurs clients (web/mobile/desktop) |
| Web | **React 18 + Vite** | Écosystème large ; Vite plus rapide que Create React App (déprécié) |
| Mobile | **React Native + Expo** | Réutilise la logique du web ; Expo simplifie build et tests |
| Desktop | **Electron** | Enrobe l'app web existante, pas de réécriture |
| Compilation | **Node.js 20/22 LTS** | **Outil de build UNIQUEMENT** — ne fait tourner aucun serveur ; Laravel est le seul serveur de l'architecture |

**Important** : Node.js n'est utilisé que sur la machine de développement pour compiler React/React Native/Electron. Rien ne tourne côté utilisateur final avec Node.js.

---

## 12. Schéma de base de données (PostgreSQL)

Noms de tables, de types, et de **colonnes** en anglais. La table `users` est celle générée par défaut par Laravel, modifiée par les migrations du projet. Le SQL ci-dessous résume le noyau métier; les migrations présentes dans `backend/database/migrations/` sont la source de vérité pour les colonnes additionnelles (`domains`, `subdomains`, `reads`, `document_library`, `app_releases`, avatars et taxonomie).

```sql
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
CREATE TYPE account_status_type AS ENUM ('pending', 'validated', 'rejected');
CREATE TYPE deletion_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    program VARCHAR(50),
    account_status account_status_type NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    program VARCHAR(50),
    summary TEXT,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE deletion_requests (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    justification TEXT NOT NULL,
    status deletion_request_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

CREATE TABLE downloads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 13. API REST — toutes les routes

Chemins **et** corps de requête/réponse (clés JSON) désormais en **anglais**, reflétant les colonnes.

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| POST | `/api/register` | non | — |
| POST | `/api/login` | non | — |
| GET | `/api/accounts` | oui | admin |
| GET | `/api/accounts/pending` | oui | admin |
| GET | `/api/accounts/{id}` | oui | admin |
| PATCH | `/api/accounts/{id}` | oui | admin |
| PATCH | `/api/accounts/{id}/role` | oui | admin |
| PATCH | `/api/accounts/{id}/deactivate` | oui | admin |
| PATCH | `/api/accounts/{id}/reactivate` | oui | admin |
| GET | `/api/catalog` | oui | tout statut |
| GET | `/api/documents/{id}` | oui | tout statut |
| GET | `/api/documents/{id}/read` | oui | tout statut (même en attente) |
| POST | `/api/documents/{id}/download` | oui | compte validé |
| GET | `/api/downloads` | oui | compte validé |
| GET | `/api/my-uploads` | oui | teacher |
| PUT | `/api/documents/{id}` | oui | teacher (dépositaire) ou admin |
| POST | `/api/documents/{id}/deletion-request` | oui | teacher (dépositaire) |
| POST | `/api/documents` | oui | teacher ou admin |
| DELETE | `/api/documents/{id}` | oui | admin |
| GET | `/api/deletion-requests` | oui | admin |
| PATCH | `/api/deletion-requests/{id}` | oui | admin |
| GET | `/api/statistics` | oui | admin |

### Exemples clés

**POST /api/register**
```json
// Requête
{ "last_name": "Fotso", "first_name": "Awa",
  "registration_number": "26SWE118",
  "email": "awa.fotso@etu.iu-ztf.cm", "password": "********" }
// Réponse 201
{ "message": "Account created, pending validation.",
  "user": { "id": 42, "account_status": "pending" } }
```

**POST /api/login**
```json
// Requête
{ "registration_number": "26SWE118", "password": "********" }
// Réponse 200
{ "token": "1|a1b2c3...", "user": { "id": 42, "role": "student" } }
```
Connexion par **matricule**, pas par email (confirmé par la maquette `connexion_e_biblio`). L'inscription ne demande pas de rôle : tout compte créé via `/api/register` démarre `student` ; la promotion `teacher`/`admin` se fait uniquement via `PATCH /api/accounts/{id}/role` (admin).

**POST /api/documents/{id}/deletion-request**
```json
// Requête
{ "justification": "Contenu obsolete, remplace par une version 2026." }
// Réponse 201
{ "deletion_request": { "id": 14, "status": "pending" } }
```

**PATCH /api/deletion-requests/{id}**
```json
// Requête
{ "decision": "approved" }  // ou "rejected"
// Si approved : le document est retiré du catalogue.
// Si rejected : le document reste, status de la demande = rejected.
```

Codes d'erreur courants : `401` identifiants incorrects, `403` rôle/permission insuffisante, `404` introuvable, `409` conflit (ex. numéro d'inscription déjà utilisé, demande déjà en attente), `422` validation échouée.

---

## 14. Authentification et sécurité

- **Laravel Sanctum** : jeton délivré à la connexion, transmis via l'en-tête `Authorization: Bearer <token>`.
- Middleware `auth:sanctum` sur toutes les routes protégées.
- Middleware `role:xxx` pour restreindre par rôle, middleware dédié pour restreindre aux comptes validés.
- Mots de passe : `Hash::make()` / `Hash::check()` (Bcrypt) sur la colonne `password` (convention Laravel standard), jamais stockés ni renvoyés en clair.
- HTTPS obligatoire (configuré au niveau du serveur web).
- Validation des entrées via les classes `FormRequest` de Laravel.

---

## 15. Gestion des fichiers numériques

- Stockage via `Storage` Laravel, disque dédié **hors du dossier public** (accès uniquement via la route de téléchargement contrôlée).
- Nom de fichier généré (UUID), jamais le nom d'origine.
- Formats acceptés : PDF principalement, DOCX/PPTX à la marge.
- Taille max : 20 Mo par fichier (ajustable).
- Téléchargement = copie locale côté client (navigateur/appareil), la base ne garde que la référence (table `downloads`).

---

## 16. Conventions de codage

**Backend (Laravel) — tout en anglais, code et données**
- Modèles : `User` (celui par défaut, modifié), `Document`, `DeletionRequest`, `Download`.
- Tables et colonnes : `users`, `documents`, `deletion_requests`, `downloads` — voir section 12 pour le détail des colonnes.
- Contrôleurs : `AccountController`, `CatalogController`, `DocumentController`, `DeletionRequestController`.
- Middlewares : `CheckUserRole`, `CheckAccountValidated`.
- Form Requests : `RegisterRequest`, etc.
- Méthodes de modèle : `isValidated()`, `hasRole()`, `isOwnedBy()`, `isPending()`, `depositedDocuments()`, `depositor()`.
- Migrations nommées explicitement avec date.
- **Tout le projet Laravel — fichiers, classes, méthodes, colonnes de base de données, clés JSON de l'API — est en anglais.** Seul le texte destiné à être lu par un humain (messages d'erreur, contenu des documents, etc.) reste en français, cohérent avec le reste du projet.

**Frontend (React / React Native)**
- Composants : `PascalCase.jsx`.
- Fonctions/variables : `camelCase`.
- Appels API centralisés dans `services/`.
- État d'authentification centralisé dans un contexte React unique.

**Général**
- Une branche Git par fonctionnalité : `feature/nom-de-la-fonctionnalite`.

---

## 17. Structure des projets

```
backend/
|-- app/
|   |-- Models/  (User, Document, DeletionRequest, Download)
|   |-- Http/
|   |   |-- Controllers/  (AccountController, CatalogController,
|   |   |                  DocumentController, DeletionRequestController)
|   |   |-- Middleware/  (CheckUserRole, CheckAccountValidated)
|   |   `-- Requests/  (RegisterRequest, ...)
|-- database/migrations/
|-- routes/api.php
`-- storage/app/documents/

frontend-web/ (et frontend-mobile/ en miroir)
|-- src/
|   |-- components/
|   |-- pages/ (ou screens/ pour mobile)
|   |-- services/  (api.js, accounts.js, catalog.js, uploads.js)
|   |-- context/AuthContext.js
|   `-- App.jsx

frontend-desktop/
|-- main.js (Electron)
|-- preload.js
`-- app/ (build de frontend-web)
```

---

## 18. Déploiement

Variables `.env` clés :
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=e_biblio
SANCTUM_STATEFUL_DOMAINS=e-biblio.iu-ztf.cm
```
- API + PostgreSQL : un ou deux serveurs, HTTPS obligatoire.
- Web React : fichiers statiques.
- Mobile : stores ou installation directe (usage interne école).
- Desktop : installateur généré par Electron.
- Sauvegarde quotidienne minimum (base + fichiers déposés).
- CORS configuré pour autoriser les domaines des trois interfaces.

---

## 19. Stratégie de tests

- Backend : PHPUnit/Pest, un test de succès + un test d'échec par route.
- Frontend : React Testing Library sur les composants critiques (inscription, recherche, dépôt).
- Tests manuels avant mise en production : parcours inscription+validation, demande+traitement de suppression, comportement en connexion dégradée, compte en attente ne peut pas télécharger.

---

## 20. État d'avancement actuel

✅ Cahier des charges et documentation technique disponibles.
✅ API Laravel 12 fonctionnelle dans `backend/`, avec Sanctum, PostgreSQL en production et SQLite pour les tests.
✅ Modèles, migrations, contrôleurs, Form Requests, middlewares, seeders et tests backend présents.
✅ Frontend web React/Vite fonctionnel : authentification, catalogue, lecture, téléchargement, bibliothèque hors ligne, dépôts, administration, statistiques et pages légales.
✅ Frontend mobile React Native/Expo fonctionnel, avec navigation par rôle, stockage sécurisé du jeton et stockage hors ligne natif.
✅ Client desktop Electron fonctionnel : il charge le frontend web déployé et vérifie les nouvelles releases.
✅ Les fonctionnalités BF01 à BF22 sont couvertes par l'API et les clients, avec les réserves de test indiquées dans les documentations web et mobile.
✅ Sckolaris AI (recherche sémantique dans le contenu des documents, « Ask this book », recommandations, historique de conversation, feedback, dashboard admin d'indexation) — voir section 22. Le worker de queue doit être configuré en production (déploiement, checklist).

### Extensions du modèle actuel

Le modèle réellement utilisé est plus riche que le modèle initial de la section 9 :

- `users` contient aussi `secondary_email`, `avatar_path`, `is_online` et `is_active`.
- `documents` utilise `subdomain_id` au lieu du champ libre `subject`, et peut contenir `cover_path` et `source_url`.
- `domains` et `subdomains` fournissent la taxonomie administrable du catalogue.
- `document_library` représente la bibliothèque hors ligne synchronisée, distincte du journal `downloads`.
- `reads` journalise les lectures et alimente les statistiques.
- `app_releases` publie les installeurs Windows et Android.
- `document_chunks`, `ai_conversations`, `ai_messages`, `ai_message_citations`, `ai_feedback`, `ai_usage` — voir section 22 (Sckolaris AI).

### Limites et vérifications restantes

- Les tests automatisés couvrent principalement le backend; il n'existe pas encore de couverture équivalente pour les frontends.
- Les fonctions natives mobiles de téléchargement, partage et lecture doivent être validées sur appareil ou émulateur réel, pas seulement dans l'aperçu web Expo.
- Le smoke test et le load test doivent être réalignés sur le contrat actuel (`identifier`, `subdomain_id`).
- Le mot de passe initial créé par `AdminSeeder` doit être remplacé immédiatement en production.
- La décision d'une demande de suppression devrait être rendue idempotente et transactionnelle avant exposition à une charge concurrente.
- Les diagrammes visuels restent gérés dans l'outil externe prévu; ils ne doivent pas être recréés automatiquement.

---

## 21. Décisions actuelles et points ouverts

- **Changement de rôle d'un utilisateur** — ✅ tranché et implémenté. `PATCH /api/accounts/{account}/role`, admin-only, action directe et immédiate (pas de workflow demande/justification, contrairement à la suppression de document). L'admin peut promouvoir **n'importe quel utilisateur vers n'importe quel rôle, y compris `admin`** (choix explicite de l'utilisateur du projet — pas de restriction sur la promotion admin malgré le risque théorique d'élévation de privilège, jugé acceptable ici).
- **Suppression d'un compte utilisateur** — ✅ tranché et implémenté, mais reformulé en **désactivation** plutôt que suppression réelle : le compte reste en base (historique des dépôts/téléchargements préservé) mais devient inutilisable. Colonne `users.is_active` (booléen, défaut `true`), distincte de `account_status`. `PATCH /api/accounts/{id}/deactivate` et `PATCH /api/accounts/{id}/reactivate`, admin-only. Un compte désactivé ne peut plus se connecter (`login` renvoie `403`) et toute requête authentifiée avec un token déjà émis est rejetée immédiatement (middleware `active` appliqué globalement à toutes les routes authentifiées). Un admin ne peut pas désactiver son propre compte.
- **Traduction du contrat de données** : le cahier des charges, le document de conception et les spécifications techniques (fichiers `.tex`) utilisent encore les noms français d'origine (`utilisateurs`, `nom`, `matricule`, `mot_de_passe`, etc.) — ils n'ont pas encore été alignés sur cette traduction anglaise. Ce brief reflète l'état le plus récent (anglais) ; en cas de divergence, **ce brief fait foi**, mais il serait utile de mettre aussi les documents `.tex` à jour pour éviter toute confusion future.
- **Inscription** — le code accepte `student` et `teacher`, exige un avatar, rend le matricule obligatoire pour un étudiant et facultatif pour un enseignant. Le compte reste `pending` jusqu'à validation.
- **Connexion** — le champ API est `identifier` et accepte le matricule ou l'e-mail.
- **Documents** — `subdomain_id` est obligatoire à la création; la validation actuelle autorise des fichiers jusqu'à 512000 Ko, soit environ 500 Mo. Cette limite doit être confirmée ou réduite pour rester cohérente avec l'exploitation.
- **Lecture** — `/read-link` produit une URL signée valable cinq minutes. La lecture est comptée au moment de la génération du lien, avant l'ouverture effective du fichier.
- **Releases** — `POST /api/app-releases` et `DELETE /api/app-releases/{platform}` acceptent soit `X-Release-Token`, soit un compte admin actif.

---

## 22. Sckolaris AI — recherche sémantique et assistant documentaire

Au-delà de l'assistant plateforme initial (section 13, qui répond aux questions « comment utiliser Sckolaris » à partir du code/de la doc du projet, inchangé), `POST /api/chat` route désormais **trois** sources de contexte selon l'intention détectée (`App\Services\Ai\IntentRouter`, classification déterministe par mots-clés — pas d'appel LLM pour router) :

| Intention | Déclencheur | Source |
|---|---|---|
| `book_question` | `document_id` fourni dans la requête | Contenu du document lui-même (recherche sémantique dans ses chunks) — **« Ask this book »**, compte authentifié requis |
| `catalog_search_or_recommend` | mots-clés type « trouve/recommande/livre/problème/objectif » | Recherche sémantique dans tous les documents indexés |
| `platform_help` | tout le reste (défaut, inchangé) | `ProjectRagService`, comme avant |

**Pipeline d'indexation** (`App\Jobs\IndexDocumentForAi`, premier job en file d'attente de l'app, déclenché automatiquement à chaque dépôt/remplacement de fichier) : extraction du texte PDF page par page (`smalot/pdfparser`) → découpage en chunks (~1500 caractères, jamais à cheval sur deux pages, pour préserver la citabilité) → embedding (Gemini `gemini-embedding-001`, même clé que le chat) → stockage dans `document_chunks` (colonne `embedding` en JSON). Idempotent via `content_hash` : une ré-indexation ne recalcule que les chunks dont le contenu a changé.

**Recherche** : similarité cosinus calculée en PHP (`App\Services\Ai\DocumentRagService`), pas de vector DB dédié (pgvector envisagé mais écarté pour cette version — évite une dépendance à une extension Postgres à activer manuellement sur Railway, et le volume d'une bibliothèque universitaire reste largement dans les capacités d'un calcul en PHP).

**Formats pris en charge** : PDF uniquement pour l'instant. DOCX/PPTX et PDF scannés (sans texte extractible) sont marqués `unsupported_format` de façon explicite (`documents.ai_index_status`, visible dans `/administration-ia`), jamais indexés silencieusement à moitié. Un fichier au-delà de `AI_MAX_INDEXABLE_FILE_MB` (défaut 100 Mo, sur les 500 Mo autorisés à l'upload) est marqué `too_large` sans tentative d'extraction, pour protéger le worker de la mémoire.

**Sécurité** : le contrôle d'accès (qui peut lire quel document) est vérifié **avant** tout appel au LLM, jamais délégué au prompt — aujourd'hui, cela revient à « authentifié et actif », sans palier restreint (identique à la règle de lecture existante, section 5/BF11). Le contenu récupéré est systématiquement traité comme donnée non fiable dans le prompt système (instruction explicite de ne jamais exécuter d'instruction qui s'y trouverait) — testé structurellement (`DocumentAskAiControllerTest::test_prompt_treats_retrieved_content_as_untrusted_data`). Aucune citation (page, titre) n'est générée par le LLM : elles viennent uniquement des métadonnées extraites, jamais inventées.

**Historique et feedback** : pour un compte authentifié, chaque échange (`/api/chat`, quelle que soit l'intention) est conservé (`ai_conversations`/`ai_messages`/`ai_message_citations`) et consultable via `/api/ai/conversations`. Un utilisateur invité obtient les mêmes réponses mais rien n'est enregistré. `/api/ai/feedback` (👍/👎) est disponible sur chaque réponse.

**Déploiement** : `IndexDocumentForAi` passe par la queue `database` — **nécessite un worker** (`php artisan queue:work`), qui ne tourne pas par défaut en production (voir `deploiement.md`, section « Worker de queue »). Sans lui, les documents restent indéfiniment `pending` dans `/administration-ia`, sans erreur visible ailleurs — c'est le premier point à vérifier si l'indexation semble ne jamais aboutir.

**Ce qui n'est volontairement pas fait dans cette version** : OCR des PDF scannés, extraction DOCX/PPTX, réponses en streaming, abstraction multi-fournisseur LLM (un seul fournisseur réellement utilisé : Gemini), MCP, dashboard avec graphiques (l'endpoint `/api/admin/ai/usage` renvoie des agrégats JSON bruts).
