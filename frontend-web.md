# SCKOLARIS — Application web (`frontend-web/`)

Journal de développement de l'application web : ce qui a été fait, avec quels outils, et ce qu'il reste à faire. Complète `e-biblio-brief-projet.md` (spécifications), `api-endpoints.md` (contrat API), `frontend-mobile.md` et `frontend-desktop.md` (autres clients).

---

## 1. Stack technique

| Brique | Outil | Pourquoi |
|---|---|---|
| Framework | **React 18 + Vite** | Imposé par le brief (section 16) — écosystème large, build rapide |
| Routage | **react-router-dom v7** | Standard pour une SPA React |
| Style | **Tailwind CSS v4** (`@tailwindcss/vite`) | Tokens de design définis dans `src/index.css` (`@theme`), palette Navy/Or (voir `academic_excellence_system/DESIGN.md`), pas de `tailwind.config.js` (config v4 native en CSS) |
| Auth | **Laravel Sanctum** (jeton Bearer) | Un seul contexte React (`AuthContext`) centralise session + jeton |
| PWA | **vite-plugin-pwa** (Workbox) | Installation, fonctionnement hors-ligne de l'interface, invite de mise à jour (`registerType: 'prompt'`) |
| Stockage hors-ligne des documents | **IndexedDB** natif (`services/offlineStore.js`) | Les documents téléchargés restent "dans le compte" (BF13), jamais dans le dossier Téléchargements du système — cloisonné par utilisateur (clé composite `userId:documentId`) |
| HTTP | **axios** | Centralisé dans `services/api.js`, intercepteur d'authentification unique |

---

## 2. Grandes étapes de développement

Résumé chronologique (voir l'historique de conversation pour le détail complet — ce fichier retient l'essentiel utile pour continuer le travail).

1. **Backend d'abord** : corrections de bugs initiales, modèle `Download`, méthodes `User`, Sanctum, middlewares, Form Requests, contrôleurs, routes, migrations, tests PHPUnit — construit avant le frontend, validé étape par étape.
2. **Ajustements de règles métier** en cours de route : champ `program` (filière) sur les documents, promotion/rétrogradation de rôle par l'admin, désactivation/réactivation de compte (sans suppression), seeders (`AdminSeeder`, `TeacherSeeder`, `StudentSeeder`, `DocumentSeeder` avec vrais PDF factices).
3. **Construction complète des maquettes** : toutes les pages publiques + les 3 tableaux de bord (étudiant/enseignant/admin) + toutes les sous-pages, à partir de captures d'écran de maquette Figma-like. Logo fidélisé partout, responsive mobile (menu burger), sidebar rétractable en tiroir sur mobile pour les dashboards.
4. **Cohérence UI** : logo présent sur toutes les pages d'auth, nav mobile complète, lien "retour à l'accueil" sous les formulaires.
5. **Yeux de visibilité mot de passe** intégrés directement dans le composant `TextField` partagé (inscription, connexion, profil).
6. **PWA + bibliothèque hors-ligne** : lien "Voir le site" dans les 3 dashboards ; téléchargement d'un document → reste dans le compte (IndexedDB), accessible hors-ligne, jamais dans le stockage système (PC/Android/iOS) ; option "Ma bibliothèque" ajoutée aussi pour l'admin ; `UpdatePrompt.jsx` (via `virtual:pwa-register/react`) propose la mise à jour de l'app quand une nouvelle version est déployée.
7. **Correctifs de robustesse** : chargement plus rapide des données ; bug important corrigé — le store hors-ligne n'était pas cloisonné par utilisateur (un compte voyait les téléchargements d'un autre) + bug de version de schéma IndexedDB (index `userId` jamais créé chez les navigateurs déjà en v1) → `DB_VERSION` incrémenté, store recréé proprement.
8. **Détail utilisateur admin** : `GET /api/accounts/{account}` (avec compteurs dépôts/téléchargements) + page `UserDetail.jsx`.
9. **Profil utilisateur réel** : modification effective des infos perso (`POST /api/me`), photo de profil facultative (`avatar_path`, disque `public`, composant `Avatar.jsx` réutilisé partout où un utilisateur est affiché), et changement du mot de passe authentifié.
10. **Favicon** = vrai logo du projet (corrigé après un premier oubli).
11. **Email secondaire** : `secondary_email` ajouté au modèle, formulaire d'inscription clarifié ("email principal"), champ facultatif dans le profil.
12. **Tentative d'internationalisation FR/EN** (`react-i18next`) — **entièrement annulée** sur demande explicite de l'utilisateur ("supprime les trucs de traduction"). Ne pas la réintroduire sans qu'elle soit redemandée.
13. **Thème clair/sombre** : `ThemeContext.jsx`, tokens dupliqués clair/sombre dans `src/index.css` (`:root[data-theme='dark']`), `ThemeSwitcher.jsx` (icônes soleil/lune).
14. **Refonte du pied de page** (`Footer.jsx`) : design multi-colonnes (logo, navigation, contact, légal), palette **fixe** (`--color-footer*`, indépendante du thème clair/sombre — un pied de page qui s'inverserait en bleu clair vif dans le thème sombre était jugé inconfortable), compacté après un premier retour "trop grand". Lien "Se connecter"/"Tableau de bord" dynamique selon l'état de connexion.
15. **Formulaire de contact** : la page utilise actuellement `formsubmit.co` (service gratuit, sans backend nécessaire), tandis que l'endpoint Laravel `/api/contact` et `services/contact.js` restent disponibles pour un futur basculement. ⚠️ Le premier envoi formsubmit.co nécessite l'activation par le lien reçu par e-mail.
16. **Admin login / debug session** : plusieurs allers-retours de diagnostic autour de jetons Sanctum invalidés après réinitialisation de la base — résolu côté utilisateur (reconnexion), pas un bug de code.

---

## 3. État actuel des fonctionnalités (correspondance avec le brief)

Les fonctionnalités **BF01 à BF22** sont couvertes côté web : inscription/validation, connexion par matricule ou e-mail, catalogue taxonomique, lecture, téléchargement validé, bibliothèque hors ligne, dépôts, demandes de suppression, gestion des comptes et rôles, statistiques et releases.

La réinitialisation de mot de passe passe par `/api/forgot-password` et `/api/reset-password`; le changement de mot de passe connecté passe par `/api/me/password`. Ces parcours dépendent de la configuration SMTP de production.

---

## 4. Procédures

### Développement
```powershell
cd S:\E-BIBLIO\frontend-web
npm install
npm run dev          # serveur Vite, http://localhost:5173 (ou port suivant si occupé)
```
`.env` doit contenir `VITE_API_URL` pointant vers l'API Laravel (`http://127.0.0.1:8000/api` en local).

### Build de production
```powershell
npm run build         # sortie dans dist/
npm run preview       # sert le build localement pour vérification
```
Le fichier `dist/` généré est ce qui doit être déployé sur un hébergement statique (voir `deploiement.md`). Le client desktop charge actuellement le site web déployé, et n'embarque donc pas ce dossier dans son installeur.

### Lint
```powershell
npm run lint    # oxlint
```
