# SCKOLARIS — Déploiement et gestion en ligne

Comment mettre en ligne et maintenir les quatre composants du projet (backend, web, mobile, desktop) — **et pourquoi**, pas seulement quoi taper. Complète `e-biblio-brief-projet.md` (section 18, exigences de base), `api-endpoints.md`, `frontend-web.md`, `frontend-mobile.md`, `frontend-desktop.md`.

**Principe central à retenir** : les clients web, mobile et desktop sont déployés indépendamment de l'API. Le web utilise `VITE_API_URL`, le mobile utilise `EXPO_PUBLIC_API_URL`, et le desktop charge actuellement l'URL web de production dans `frontend-desktop/main.js` (avec `ELECTRON_START_URL` en développement). Aucun client ne communique directement avec la base de données.
**Pourquoi cette indépendance** : c'est le prix à payer pour que le web, le mobile et le desktop puissent être développés, buildés et distribués séparément (brief section 10 : architecture "clients / API / base de données" à trois niveaux, pas un monolithe). La contrepartie : changer l'adresse du backend implique de **reconstruire et redistribuer** chaque client qui la référence (sauf le web, simplement redéployé) — voir le tableau récapitulatif en §5.

---

## 1. Backend (Laravel + PostgreSQL)

### Hébergement
Un serveur (VPS, hébergement mutualisé compatible PHP 8.2+/PostgreSQL, ou conteneur) exposant l'API sur un nom de domaine avec **HTTPS obligatoire**.
**Pourquoi** : exigence explicite du brief (BNF02). Sans HTTPS, le jeton Sanctum (`Authorization: Bearer <token>`) circule **en clair** sur le réseau à chaque requête — n'importe qui interceptant le trafic (Wi-Fi public, proxy réseau de l'école, etc.) pourrait le voler et usurper le compte, sans même avoir besoin du mot de passe.

### Variables d'environnement clés (`.env` de production)
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.e-biblio.iu-ztf.cm        # à adapter

DB_CONNECTION=pgsql
DB_HOST=<hôte PostgreSQL>
DB_PORT=5432
DB_DATABASE=e_biblio
DB_USERNAME=<utilisateur>
DB_PASSWORD=<mot de passe>

SANCTUM_STATEFUL_DOMAINS=e-biblio.iu-ztf.cm    # domaine(s) du frontend web, séparés par virgule si plusieurs

RELEASE_UPLOAD_TOKEN=<jeton aléatoire, ex: openssl rand -hex 32>   # voir §5bis — publier un installeur sans compte admin
```
- `APP_DEBUG=false` est **impératif**. **Pourquoi** : avec `true`, la moindre erreur serveur affiche la stack trace complète (chemins de fichiers, requêtes SQL, parfois des valeurs de variables) à **n'importe quel visiteur** — une fuite d'information exploitable, pas juste un détail esthétique.
- `SANCTUM_STATEFUL_DOMAINS` doit lister le(s) domaine(s) du frontend web. **Pourquoi** : c'est ce qui permet à Sanctum de distinguer une requête "de confiance" (venant de votre propre frontend) d'une requête tierce, pour l'authentification par cookie SPA — sans cette liste correcte, l'auth web peut échouer de façon peu explicite.

### CORS
Le projet contient déjà `backend/config/cors.php`. La liste `allowed_origins` est construite depuis `CORS_ALLOWED_ORIGINS`; si cette variable est absente ou vide, aucune origine navigateur n'est autorisée. En production, définir explicitement les origines web, par exemple :
```env
CORS_ALLOWED_ORIGINS=https://e-biblio.vercel.app
```
Ajouter les éventuels domaines web légitimes en les séparant par des virgules. Le mobile React Native et le processus principal Electron ne dépendent pas de CORS comme un navigateur web classique, mais restent soumis à Sanctum ou au jeton de release et à HTTPS.
**Pourquoi seulement le web** : CORS est une protection **du navigateur pour le navigateur** — elle empêche un site X d'appeler discrètement votre API depuis le navigateur d'un visiteur. Le mobile (React Native) et le desktop (Electron, qui appelle l'API depuis son processus, pas depuis une page web classique soumise à la même politique d'origine) ne sont pas concernés par cette restriction ; les sécuriser passe par le jeton Sanctum + HTTPS, déjà en place.
**Pourquoi ne pas laisser `*` en production** : un CORS ouvert n'expose pas directement les données (le jeton reste requis), mais il permet à n'importe quel site tiers de faire effectuer à un navigateur des requêtes vers votre API avec un jeton déjà présent.

### Mise en route sur le serveur
```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link          # requis pour servir les avatars (disque "public")
php artisan config:cache
php artisan route:cache
```
- `--no-dev` : **pourquoi** — évite d'installer les dépendances de test/debug (PHPUnit, etc.) sur le serveur de production, qui n'en a pas besoin et alourdit inutilement le déploiement.
- `storage:link` : **pourquoi** — les photos de profil (`avatar_path`) sont servies depuis `storage/app/public/`, mais Laravel ne les rend accessibles par une URL publique (`/storage/...`) que via ce lien symbolique. Sans lui, toutes les images d'avatar renvoient une 404, silencieusement.
- `config:cache` / `route:cache` : **pourquoi seulement en production** — pendant le développement actif, un cache de config qui se périme silencieusement à chaque changement de `.env` ou de route est une source de bugs fantômes difficiles à diagnostiquer (décision explicite prise plus tôt dans ce projet : ne pas les activer en dev). En production, à l'inverse, la config ne change presque jamais entre deux déploiements, donc le gain de performance (config/routes déjà résolues, pas reparsées à chaque requête) l'emporte largement — à condition de relancer ces deux commandes après **chaque** changement de `.env` ou des routes, sinon l'ancien cache reste actif malgré le nouveau code.

### Cas concret : Railway

**État actuel (depuis `backend/Dockerfile`)** : Railway construit l'image à partir de ce `Dockerfile` — plus de détection automatique. `docker/entrypoint.sh` reproduit exactement la séquence de démarrage ci-dessus (migrate, seed AdminSeeder, storage:link, config:cache, route:cache), puis lance `frankenphp run --config docker/Caddyfile --adapter caddyfile` (serveur de production, contrairement à `php artisan serve`/`php artisan serve --host=0.0.0.0` : mono-thread, prévu pour le développement, tronque silencieusement les grosses réponses HTTP sous charge réelle — vécu concrètement sur ce projet avec l'échec de téléchargement d'un fichier de plusieurs Mo avant de basculer sur FrankenPHP).

**Comment on en est arrivé là** (dans l'ordre, pour ne pas répéter les mêmes essais si un problème similaire revient) :

1. **Point de départ** : Railway détectait le projet Laravel tout seul via **Railpack** (son système de build automatique, sans configuration). Railpack gère PHP/Composer/FrankenPHP correctement — un `Procfile` à la racine de `backend/` reprenait juste la main sur la **commande de démarrage** (`web: php artisan migrate --force && ... && frankenphp run --config /Caddyfile --adapter caddyfile`), Railpack générant lui-même un `Caddyfile` minimal (`root /app/public`, `php_server`, port dynamique via `:{$PORT:80}`).
2. **Le besoin d'installer R** (pour `StatsController`/`r-scripts/stats.R`, la page Statistiques du dashboard admin) a révélé la limite de cette approche : Railpack ne permet d'ajouter un paquet système supplémentaire que via un fichier `nixpacks.toml` (`[phases.setup] nixPkgs = ["R"]`) ou la variable d'environnement `NIXPACKS_PKGS=R`. **Les deux ont été essayés, et Railway a ignoré les deux** (raison non observable de l'extérieur — probablement une particularité de la version de Railpack utilisée par ce projet). Résultat vérifié en production : `Rscript` introuvable, page Statistiques en erreur.
3. **Passage à un `Dockerfile`** : seule façon d'obtenir un contrôle **total et vérifiable** sur ce qui est installé, sans dépendre d'une détection automatique qui refusait de coopérer. Base : image officielle `dunglas/frankenphp` (PHP + Caddy déjà assemblés correctement, seule vraie alternative documentée à l'installation manuelle de FrankenPHP), variante Debian `bookworm` (pas Alpine — l'installation de R via `apt` y est nettement mieux documentée). Ajouts au strict nécessaire (voir commentaires du `Dockerfile` lui-même) :
   - `pdo_pgsql`, `gd`, `mbstring` : extensions PHP absentes de l'image de base mais **indispensables** (pas des extras) — sans `pdo_pgsql` aucune connexion à Postgres n'est possible, `gd` est explicitement exigé par `composer.json` (`ext-gd`, sans quoi `composer install` échoue tout de suite), `mbstring` est utilisée par le cœur de Laravel.
   - `apt-get install r-base` : le seul vrai ajout motivant ce Dockerfile. Uniquement le paquet de base (aucun paquet CRAN) — `r-scripts/stats.R` n'utilise que des fonctions R natives (`read.csv`/`write.csv`/`lm`...), précisément pour ne dépendre d'aucune installation de paquet CRAN au moment du build.
   - Composer copié depuis l'image officielle `composer:2` (`COPY --from=composer:2 /usr/bin/composer /usr/bin/composer`) — absent de l'image FrankenPHP de base.
4. **Premier déploiement Docker : presque bon du premier coup**, mais échec sur le `Caddyfile` (`unrecognized directive: :8080`) — un bloc d'options globales ajouté par prudence (`{ frankenphp \n admin off }`) faisait échouer l'analyse du fichier par Caddy. Tout le reste (R, extensions PHP, connexion à la base, migrations, seed, cache) avait fonctionné sans erreur dès ce premier essai. Corrigé en revenant à la structure minimale strictement équivalente à ce que générait Railpack :
   ```
   :{$PORT:80} {
   	root * /app/public
   	encode zstd gzip
   	php_server
   }
   ```
5. **Conséquence à ne pas oublier** : `Procfile` et `nixpacks.toml` sont **ignorés dès qu'un `Dockerfile` existe** dans `backend/` — Railway bascule automatiquement sur un build Docker. `nixpacks.toml` a été supprimé (devenu trompeur, il n'était plus jamais lu) ; `Procfile` a été conservé avec un commentaire explicite (mémoire de la séquence de démarrage équivalente), au cas où un retour à Railpack serait un jour nécessaire.

**Pourquoi `db:seed --class=AdminSeeder`** (et pas le `DatabaseSeeder` complet, dans `docker/entrypoint.sh`) : ce seeder est **idempotent** (`User::firstOrCreate`) — il ne crée le compte admin initial (`ADMIN-0001`) que s'il n'existe pas encore, donc il peut tourner à **chaque** déploiement sans dupliquer ni écraser quoi que ce soit. Les autres seeders (`TeacherSeeder`, `StudentSeeder`, `DocumentSeeder`, `LoadTestUserSeeder`) génèrent des comptes et documents **fictifs** de démonstration/test — à ne jamais lancer sur la vraie base de production, seulement en local. `FrenchCatalogSeeder` et `GutenbergCatalogSeeder`, eux, sont du **vrai contenu de catalogue** (également idempotents) — à lancer manuellement une fois en production (`php artisan db:seed --class=... --force`), pas via le démarrage automatique (pas besoin de les rejouer à chaque déploiement).

### Planificateur de tâches (obligatoire — statut « en ligne » des comptes)
La commande `users:mark-expired-offline` (marque `is_online = false` quand le jeton d'un utilisateur a expiré, voir `routes/console.php`) ne s'exécute **que si le planificateur Laravel tourne réellement**.
**Pourquoi cette commande existe** : Sanctum ne déclenche **aucun événement** quand un jeton expire — il se contente de rejeter silencieusement la prochaine requête qui l'utilise. Sans vérification périodique, un utilisateur dont le jeton a expiré resterait affiché "En ligne" indéfiniment dans le tableau de bord admin.
**Pourquoi ce n'est pas automatique "tout seul"** : la définition de la tâche planifiée (`Schedule::command(...)` dans `routes/console.php`) fait partie du code et voyage avec lui — mais **rien dans le code ne peut forcer le système d'exploitation** à réveiller PHP périodiquement. C'est une étape d'infrastructure, à configurer **une fois, manuellement, sur chaque serveur qui hébergera le backend** :

| Environnement | Comment déclencher le planificateur | Pourquoi cette méthode |
|---|---|---|
| Développement (Windows, ce PC) | `php artisan schedule:work` dans un terminal dédié, **ou** une tâche planifiée Windows (`Register-ScheduledTask`, voir `frontend-mobile.md`/historique de conversation) | `schedule:work` est un outil de confort Laravel pour le dev — simple, mais s'arrête si le terminal se ferme et ne redémarre pas seul après un plantage |
| Production sur serveur **Linux** (cas le plus courant pour Laravel) | Une entrée cron unique, qui délègue le reste à Laravel : `* * * * * cd /chemin/vers/backend && php artisan schedule:run >> /dev/null 2>&1` | Standard historique de l'écosystème Laravel ; une seule ligne cron suffit car Laravel lui-même décide ensuite quoi exécuter et quand (toutes les 5 min pour cette commande) |
| Production sur serveur **Windows** | La même tâche planifiée Windows que ci-dessus, mais configurée **sur ce serveur-là**, pas sur le PC de dev | Windows n'a pas de cron natif ; le Planificateur de tâches en est l'équivalent fonctionnel |
| Hébergeur "managé" pour Laravel (Forge, Ploi, etc.) | Rien à faire — ces plateformes détectent un projet Laravel et configurent le cron automatiquement | Seule option où l'automatisation est vraiment intégrée dès le déploiement, sans étape manuelle |
| **Railway (notre cas, depuis `backend/Dockerfile`)** | Un **deuxième service Railway** (même dépôt/image que le service backend), avec un réglage **"Cron Schedule"** dans ses Settings + un "Custom Start Command" propre. Voir ci-dessous. | Railway n'a pas de vrai crontab système accessible ; le réglage "Cron Schedule" transforme un service normal en service relancé à intervalle donné (exécute la commande puis s'arrête) au lieu de tourner en continu |

**Configuration précise sur Railway** (l'interface actuelle n'a plus de type de service "Cron Job" séparé dans le menu **+ New** — c'est devenu un réglage à l'intérieur d'un service normal) :
1. Projet Railway → **+ New** → **GitHub Repository** → sélectionner le **même dépôt** que le service backend.
2. ⚠️ **Root Directory** (Settings → Source, ou équivalent) : mettre `backend`, **exactement comme sur le service backend principal**. Ce réglage ne se copie **jamais** automatiquement entre services d'un même dépôt monorepo (`backend/`, `frontend-web/`, etc. dans le même repo) — sans lui, Railway cherche un projet à la racine du dépôt, n'y trouve rien d'exploitable, et le build échoue immédiatement (`railpack prepare exited with an error`, observé concrètement lors de la mise en place). C'est ce réglage précis, pas le `Dockerfile`, qui a fait échouer la première tentative de service Cron Job sur ce projet.
3. **Cron Schedule** (Settings → Deploy, ou équivalent) : `*/5 * * * *` (toutes les 5 minutes — correspond exactement à `->everyFiveMinutes()` dans `routes/console.php`). C'est ce champ qui transforme un service normal (qui tournerait en continu) en tâche déclenchée à intervalle : Railway relance un conteneur à chaque échéance, exécute la commande, puis l'arrête.
4. **Custom Start Command** (même section) : `php artisan users:mark-expired-offline`
   *(`docker/entrypoint.sh` reconnaît une commande personnalisée passée en argument : il l'exécute directement, sans relancer migrate/seed/cache ni le serveur web à chaque déclenchement — voir le `if [ "$#" -gt 0 ]` en tête du script.)*
5. Variables d'environnement : copier celles du service backend (au minimum la connexion à la base, `APP_KEY`) via **Variables → Raw Editor** sur le service backend (copier tout le texte), puis **Variables → Raw Editor** sur le nouveau service (coller). Les références du type `${{Postgres.PGHOST}}` restent valables telles quelles après copie — elles pointent vers le service Postgres nommé, pas vers celui où la ligne est écrite. Copier même les variables non utilisées par cette commande précise (`BREVO_API_KEY`, `FRONTEND_URL`...) ne pose aucun problème, elles restent simplement inutilisées.

Sans planificateur actif, le statut "en ligne" reste bloqué sur `true` indéfiniment après l'expiration d'un jeton (1 jour) — l'app continue de fonctionner normalement, seul cet indicateur admin devient trompeur.

### Worker de queue (obligatoire — indexation IA des documents)
`IndexDocumentForAi` (voir `app/Jobs/`, déclenché automatiquement à chaque dépôt/remplacement de fichier dans `DocumentController`) passe par la connexion de queue `database` (déjà configurée, table `jobs` déjà migrée) — mais **rien ne consomme cette file en production** : `docker/entrypoint.sh` ne lance que le serveur web, jamais `queue:work`. Sans worker, les jobs s'accumulent dans la table `jobs` sans jamais s'exécuter : les documents restent indéfiniment au statut `pending` dans le dashboard admin IA (`/admin/ai/documents`), sans erreur visible ailleurs.

**Configuration** : exactement le même montage que le planificateur ci-dessus (nouveau service Railway, même dépôt, `Root Directory = backend`), avec :
- **Cron Schedule** : `*/5 * * * *` (toutes les 5 minutes — largement suffisant, un dépôt de document n'est pas une action urgente).
- **Custom Start Command** : `php artisan queue:work --stop-when-empty --max-time=240`
  (`--stop-when-empty` : le worker s'arrête dès que la file est vide plutôt que de tourner indéfiniment entre deux déclenchements cron ; `--max-time=240` : filet de sécurité qui l'arrête après 4 minutes même en cas de job bloqué, avant le prochain déclenchement.)
- Variables d'environnement : copier celles du service backend, comme pour le planificateur — `GEMINI_API_KEY`/`GEMINI_EMBEDDING_MODEL` sont indispensables ici (le job en a besoin pour calculer les embeddings).

**Alternative : un seul service pour les deux commandes.** Garder deux services séparés (un par commande) reste plus simple à diagnostiquer en cas de panne (logs isolés par tâche) — c'est l'approche recommandée ci-dessus. Mais un seul service Railway peut cumuler les deux, via `backend/docker/run-cron-and-queue.sh` (déjà présent dans le repo) :
- **Custom Start Command** : `sh docker/run-cron-and-queue.sh`
- **Pourquoi pas directement `cmd1 && cmd2` dans le champ Railway** : ce champ est transmis tel quel à `docker/entrypoint.sh`, qui l'exécute via `exec "$@"` — **sans shell** intermédiaire. `&&` n'y serait jamais interprété comme un opérateur, seulement comme un argument littéral passé au premier programme, qui échouerait aussitôt. Faire précéder le script de `sh` contourne complètement le problème : `entrypoint.sh` reçoit alors deux arguments (`sh` et le chemin du script), exécute `sh` avec ce script en argument, et c'est **ce** `sh`-là qui interprète correctement le `&&` à l'intérieur du fichier.
- Un seul **Cron Schedule** pour les deux tâches (`*/5 * * * *` convient aux deux).
- Le script s'arrête à la première commande en échec (`set -e`) plutôt que de lancer la seconde en silence si la première casse.

### Sauvegarde
- Base PostgreSQL : dump quotidien minimum (`pg_dump`), conservé **hors** du serveur applicatif.
- Fichiers déposés (`storage/app/documents/`, disque privé — les supports de cours) et `storage/app/public/avatars/` : sauvegarde quotidienne également.

**Pourquoi c'est explicitement exigé par le brief** (section 18) et pas optionnel : contrairement au code (versionné, reconstructible), la base de données et les fichiers déposés par les enseignants sont des données **uniques et non reconstructibles** — une panne disque ou une erreur humaine sans sauvegarde récente signifie perdre définitivement les comptes, les documents pédagogiques déposés, et l'historique des téléchargements. **Pourquoi hors du serveur applicatif** : une sauvegarde stockée sur la même machine que ce qu'elle protège ne survit pas à une panne matérielle de cette machine — elle doit être copiée ailleurs (autre serveur, stockage cloud) pour être une vraie protection.

---

## 2. Web (`frontend-web/`)

Fichiers **statiques** (brief, section 18) — pas de serveur Node en production.
**Pourquoi des fichiers statiques et pas un serveur Node qui tourne** : React/Vite ne produit que du HTML/CSS/JS destiné à s'exécuter dans le navigateur du visiteur ; il n'y a aucune logique serveur à faire tourner côté web (contrairement au backend Laravel). Un hébergement de fichiers statiques est plus simple, moins cher, et plus rapide (CDN) qu'un serveur applicatif dédié à ça.

```powershell
cd frontend-web
# .env de production : VITE_API_URL=https://api.e-biblio.iu-ztf.cm/api
npm run build
```
Déployer le contenu de `dist/` sur n'importe quel hébergement de fichiers statiques (Nginx, Apache, Netlify, Vercel, GitHub Pages avec domaine personnalisé, etc.), avec HTTPS.

Configurer un **fallback SPA** (toute route inconnue → `index.html`) côté serveur web.
**Pourquoi c'est nécessaire** : React Router gère les routes (`/documents/12`, `/tableau-de-bord`, etc.) **côté client**, en JavaScript, après le chargement de `index.html`. Un serveur web classique, lui, cherche un vrai fichier à cette adresse et ne le trouve pas — sans ce fallback, tout accès direct à une URL autre que la racine (lien partagé, favori, rafraîchissement de page) renvoie une 404, alors que l'app fonctionnerait parfaitement si on y accédait en cliquant depuis l'intérieur.

Le service worker PWA (`vite-plugin-pwa`) exige HTTPS pour s'activer (sauf `localhost`).
**Pourquoi** : c'est une restriction imposée par les navigateurs eux-mêmes (spécification des Service Workers), pas un choix du projet — un service worker a un accès puissant à intercepter toutes les requêtes réseau d'un site, ce qui serait dangereux à autoriser sur une connexion non chiffrée où ce script pourrait être altéré en transit. Cohérent avec l'obligation HTTPS déjà posée pour l'API : aucune configuration supplémentaire nécessaire au-delà d'un certificat valide.

### Mise à jour
Redéployer `dist/` après chaque `npm run build`. Les utilisateurs déjà installés en PWA reçoivent automatiquement l'invite de mise à jour (`UpdatePrompt.jsx`) au prochain chargement.
**Pourquoi c'est automatique ici et pas sur mobile/desktop** : le service worker vérifie en arrière-plan si les fichiers servis ont changé (à chaque visite) — c'est le mécanisme même du PWA. Le mobile (APK) et le desktop (.exe) n'ont pas cet équivalent : une fois installés, ce sont des exécutables figés qui ne "regardent" jamais s'il existe une version plus récente d'eux-mêmes.

---

## 3. Mobile (`frontend-mobile/`)

Pas de "déploiement" au sens serveur — génération de builds installables via **EAS Build** (cloud Expo). Détail complet dans `frontend-mobile.md` (§5-6). Résumé :

| Cible | Méthode | Compte requis |
|---|---|---|
| Android | `eas build --platform android --profile preview` → `.apk` transférable librement | Compte Expo gratuit |
| iOS | `eas build --platform ios` → TestFlight ou ad-hoc | Compte Apple Developer payant (99$/an) — obligatoire, imposé par Apple |

**Pourquoi Android peut se transférer librement mais pas iOS** : ce n'est pas un choix technique du projet — Android autorise depuis toujours l'installation d'un `.apk` obtenu par n'importe quel moyen ("source inconnue"), alors qu'Apple **interdit structurellement** l'installation d'une app en dehors de l'App Store ou d'un programme développeur payant (TestFlight/ad-hoc), pour tout le monde, sans exception possible. Aucune configuration côté SCKOLARIS ne peut contourner ça.

Avant un build destiné à d'autres utilisateurs : mettre à jour `frontend-mobile/.env` (`EXPO_PUBLIC_API_URL`) avec la vraie URL du backend (jamais `127.0.0.1` ni une IP locale).
**Pourquoi** : Expo intègre cette variable **en dur dans le code compilé** au moment du build (comme Vite pour le web) — elle n'est pas relue à l'exécution sur le téléphone de l'utilisateur final. `127.0.0.1`, sur ce téléphone, désigne le téléphone lui-même, jamais votre PC de développement.

### Mise à jour
Contrairement au web (PWA), une app installée via APK/TestFlight **ne se met pas à jour automatiquement** avec le code — il faut regénérer un nouveau build et le publier (voir §5bis). L'app installée, elle, **détecte** automatiquement qu'une nouvelle version existe (bannière au lancement, `updateCheck.js`) et propose son téléchargement — mais l'installation reste un geste manuel de l'utilisateur (ouvrir l'APK téléchargé), Android ne permettant pas à une app de s'auto-remplacer silencieusement en dehors d'un store.
**Pourquoi** : un `.apk` installé est un exécutable natif figé, sans le mécanisme service-worker du web qui vérifie les changements en continu — seule la *détection* a pu être ajoutée (requête `GET /app-releases` au lancement), pas le remplacement silencieux du binaire lui-même. Possibilité future : **EAS Update** (mises à jour "OTA" pour le code JS seul, sans passer par un nouveau build natif complet) — non mis en place pour l'instant, à évaluer si des mises à jour fréquentes sont attendues (pertinent seulement pour des changements de code JS ; un changement de dépendance native exigerait quand même un nouveau build complet).

---

## 4. Desktop (`frontend-desktop/`)

Détail complet dans `frontend-desktop.md`. Résumé :

```powershell
cd frontend-desktop
# frontend-web/.env : VITE_API_URL=https://api.e-biblio.iu-ztf.cm/api
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run dist
```
**Pourquoi `CSC_IDENTITY_AUTO_DISCOVERY = "false"`** : sans cette variable, electron-builder tente de télécharger des outils de signature de code **macOS** même pour un build Windows-only, et cette étape échoue sous Windows sans Mode développeur activé (liens symboliques) — un contournement, pas une vraie signature (voir `frontend-desktop.md` pour le détail du bug).

Résultat : `frontend-desktop/dist/e-biblio Setup <version>.exe`, à distribuer directement (partage de fichier, clé USB, intranet de l'école — pas de store nécessaire pour du Windows non signé, usage interne).
**Pourquoi pas besoin de store ici, contrairement à iOS** : Windows, comme Android, autorise l'exécution de n'importe quel `.exe` téléchargé (avec un avertissement SmartScreen "éditeur inconnu" tant que l'app n'est pas signée par un certificat reconnu — normal et sans gravité pour un usage interne).

### Mise à jour
Comme le mobile : pas de remplacement automatique du binaire. Chaque nouvelle version nécessite un nouveau build + une publication (voir §5bis) — l'app installée **détecte** ensuite automatiquement la nouvelle version au lancement (boîte de dialogue native, `main.js`) et propose d'ouvrir la page de téléchargement, mais ne se remplace jamais silencieusement.
**Pourquoi** : même raison que le mobile — un exécutable Electron installé est figé, sans mécanisme de vérification en continu comme le service worker du web ; seule la *détection* (requête `GET /app-releases` au démarrage) a été ajoutée. Electron propose un module `autoUpdater` pour automatiser le remplacement lui-même (vérifie un serveur de mise à jour au démarrage, télécharge et applique les nouvelles versions) — non mis en place, car il nécessite un serveur de mise à jour dédié à héberger et maintenir en plus ; à évaluer seulement si des mises à jour fréquentes du client desktop sont attendues dans la durée.

---

## 5bis. Publier une nouvelle version desktop/mobile sans compte admin

**Contexte** : une fois l'app livrée à l'école, la personne qui maintient réellement le code (vous) n'aura peut-être plus, ou plus durablement, un compte `admin` valide dans l'application elle-même (l'école gère ses propres comptes/rôles). Publier un nouvel installeur ne doit donc pas dépendre de ce rôle.

**Mécanisme** : `POST /api/app-releases` et `DELETE /api/app-releases/{platform}` acceptent deux voies d'accès totalement indépendantes (`ReleaseAccess`, middleware `release.access`) :
1. **Un jeton fixe**, envoyé dans l'en-tête `X-Release-Token`, comparé à la variable d'environnement `RELEASE_UPLOAD_TOKEN` (définie sur Railway — jamais dans une table `users`).
2. **À défaut**, un compte connecté avec le rôle `admin`, exactement comme avant — pour que l'école puisse aussi le faire elle-même depuis le tableau de bord si elle en a la charge un jour.

**Pourquoi un en-tête dédié (`X-Release-Token`) et pas `Authorization: Bearer`** : Sanctum (l'authentification des comptes) lit lui aussi `Authorization: Bearer` pour authentifier un utilisateur — réutiliser le même en-tête pour le jeton fixe créerait un conflit (Sanctum essaierait de le traiter comme un jeton de compte et le rejetterait). Ces deux routes vivent donc **hors** du groupe `auth:sanctum` : c'est `ReleaseAccess` qui résout lui-même, manuellement, un éventuel compte admin — seulement si le jeton est absent ou invalide.

**Pourquoi un jeton dans une variable d'environnement plutôt qu'un compte** : Railway/Vercel (l'hébergement) sont des comptes séparés de l'application elle-même — l'école peut réinitialiser tous les comptes admin de l'app sans jamais toucher à Railway. Tant que vous gardez la main sur l'hébergement, ce jeton reste valable indéfiniment.

**Mise en route (une seule fois)** :
1. Générer un jeton long et aléatoire : `openssl rand -hex 32`.
2. Railway → service backend → Variables → ajouter `RELEASE_UPLOAD_TOKEN=<jeton généré>`.
3. Garder une copie du jeton dans un gestionnaire de mots de passe personnel — il ne vit nulle part ailleurs.

**Publier une version** (après avoir généré le nouvel installeur) :
```powershell
cd backend/scripts
$env:RELEASE_UPLOAD_TOKEN = "<jeton>"
./publish-release.ps1 -Platform windows -Version 1.2.0 -File "C:\dist\e-biblio-setup-1.2.0.exe"
./publish-release.ps1 -Platform android -Version 1.2.0 -File "C:\dist\e-biblio-1.2.0.apk"
```
Le script appelle `curl.exe` en multipart avec l'en-tête `X-Release-Token`, valide l'extension du fichier selon la plateforme, et confirme le succès (`HTTP 201`). Les appareils déjà installés détectent la nouvelle version à leur prochain lancement, sans aucune autre action.

---

## 5. Vue d'ensemble — que refaire quand ?

| Changement | Backend | Web | Mobile | Desktop |
|---|---|---|---|---|
| Modification du code backend (routes, logique) | Redéployer le serveur | rien (appelle l'API à l'exécution) | rien | rien |
| Changement de l'URL du backend (nouveau serveur/domaine) | — | reconstruire `dist/` et redéployer | reconstruire l'APK/build iOS et redistribuer | reconstruire le `.exe` et redistribuer |
| Modification du code frontend-web | — | reconstruire + redéployer (PWA se met à jour seule côté utilisateur) | — | reconstruire aussi le desktop (il embarque le build web) |
| Modification du code frontend-mobile | — | — | reconstruire + redistribuer | — |

**Pourquoi cette asymétrie** (le backend n'a jamais besoin d'être retouché quand un client change, mais l'inverse n'est pas vrai) : c'est la conséquence directe du principe d'indépendance posé en introduction — le backend ne connaît l'existence d'aucun client, il expose juste une API ; les clients, eux, embarquent une adresse de backend figée au moment de leur construction.

---

## 6. Checklist avant une vraie mise en production

- [ ] Backend : `APP_DEBUG=false`, `APP_ENV=production`, HTTPS actif, `SANCTUM_STATEFUL_DOMAINS` correct. *(sécurité — voir §1)*
- [ ] CORS restreint aux domaines réels. *(sécurité — voir §1)*
- [ ] Sauvegarde automatisée (base + fichiers) configurée **et testée en restauration** — une sauvegarde jamais restaurée n'est qu'une hypothèse. *(données non reconstructibles — voir §1)*
- [ ] `VITE_API_URL` (web + desktop) et `EXPO_PUBLIC_API_URL` (mobile) pointent vers la vraie URL du backend, pas `127.0.0.1`. *(ces valeurs sont figées au build — voir §3/§4)*
- [ ] Icônes réelles du projet sur mobile (`frontend-mobile/assets/icon.png` etc.) et desktop (`frontend-desktop/build/icon.png`, déjà fait) — pas les icônes par défaut d'Expo/Electron. *(crédibilité de l'app auprès des utilisateurs finaux)*
- [ ] Compte Apple Developer créé si distribution iOS prévue. *(imposé par Apple, aucune alternative — voir §3)*
- [ ] Envoi d'e-mails Brevo configuré par API HTTPS : créer une clé dans **Paramètres → SMTP & API → API Keys** puis ajouter sur Railway `BREVO_API_KEY`, `MAIL_FROM_ADDRESS` (expéditeur vérifié), `MAIL_FROM_NAME=SCKOLARIS`, `CONTACT_EMAIL` et `FRONTEND_URL`. Le backend appelle `https://api.brevo.com/v3/smtp/email` sur HTTPS/443; les variables SMTP (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`) ne sont plus utilisées pour les notifications et le formulaire backend, car Railway ne peut pas joindre les ports SMTP Brevo dans cet environnement.
- [ ] Assistant Gemini configuré : créer une clé gratuite dans Google AI Studio (aistudio.google.com/apikey), puis ajouter uniquement sur Railway `GEMINI_API_KEY=<clé>` et `GEMINI_MODEL=gemini-3.6-flash`. Ne jamais préfixer cette clé par `VITE_` et ne jamais la mettre dans le frontend. Le frontend appelle `/api/chat`; Laravel filtre le contexte par rôle avant l'appel Gemini. Vérifier le quota gratuit (limite de requêtes par minute/jour) et ajouter une facturation ou une limite plus stricte avant une ouverture à grande échelle.
- [ ] Délivrabilité Brevo configurée : dans Brevo → **Senders & IP** → **Domains**, ajouter `iu-ztf.cm` et recopier dans le DNS de ce domaine les enregistrements SPF et DKIM fournis par Brevo. Ajouter aussi un enregistrement DMARC progressivement, par exemple `v=DMARC1; p=none; rua=mailto:dmarc@iu-ztf.cm`, vérifier les rapports, puis passer à `p=quarantine` et enfin `p=reject` quand tous les expéditeurs légitimes sont alignés. Ne pas inventer les valeurs SPF/DKIM : elles sont propres au domaine et doivent être copiées depuis Brevo. Utiliser une adresse `MAIL_FROM_ADDRESS` appartenant au domaine authentifié; ne pas utiliser une adresse Gmail/Yahoo comme expéditeur technique. SPF, DKIM et DMARC améliorent fortement la réputation mais ne garantissent pas à eux seuls l'absence de spam : conserver un expéditeur stable, envoyer uniquement aux utilisateurs concernés, éviter les liens et objets trompeurs, et traiter les désinscriptions ou plaintes si des e-mails marketing sont ajoutés.
  - *Historique* : Resend a d'abord été mis en place et testé avec succès en réel (lien de réinitialisation reçu) en mode sandbox (`MAIL_FROM_ADDRESS=onboarding@resend.dev`) — mais passer en production aurait exigé de vérifier un domaine d'envoi (DNS chez l'hébergeur), une étape jugée superflue une fois Brevo identifié comme envoyant nativement sans cette contrainte.
  - Formulaire de contact (`Contact.jsx`) : `ContactController`/`Mail::` existent côté backend et sont prêts (testés), mais **volontairement pas utilisés pour l'instant** — décision explicite de rester sur formsubmit.co → `davidjosiassampa@gmail.com` en attendant. Pour basculer plus tard : remplacer l'appel `fetch('https://formsubmit.co/...')` de `Contact.jsx` par `sendContactMessage()` (`services/contact.js`, déjà écrit), et définir `CONTACT_EMAIL` sur Railway.
- [ ] R installé sur le serveur backend (`Rscript --version` doit répondre) — voir §1 "Cas concret : Railway" pour l'historique complet (deux mécanismes Railpack essayés et ignorés, remplacés par `backend/Dockerfile`). **Confirmé fonctionnel en production** : R, `pdo_pgsql` et `gd` ont tous démarré correctement dès le premier déploiement Docker ; seule une erreur de syntaxe dans `docker/Caddyfile` (corrigée depuis) a empêché le serveur web de démarrer au tout premier essai. *(sans R, la page Statistiques du dashboard admin renvoie une erreur claire plutôt qu'un plantage, mais reste inutilisable — voir StatsController)*
- [ ] Planificateur de tâches Railway (service Cron Job) : vérifier que son **Root Directory** est bien réglé sur `backend` (ne se copie pas automatiquement depuis le service backend — a fait échouer la première tentative avec `railpack prepare exited with an error`) et que ses variables d'environnement sont à jour (copiées depuis le service backend via Variables → Raw Editor). *(voir §1 pour la procédure complète)*
- [ ] Worker de queue Railway configuré pour l'indexation IA (`IndexDocumentForAi`) — même montage que le planificateur ci-dessus, `Custom Start Command = php artisan queue:work --stop-when-empty --max-time=240`, `Cron Schedule = */5 * * * *`. Sans lui, les documents déposés restent indéfiniment au statut `pending` dans `/administration-ia`, sans erreur visible ailleurs. *(voir §1 « Worker de queue »)*
