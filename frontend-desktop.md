# SCKOLARIS — Application desktop (`frontend-desktop/`)

Journal de développement du client desktop. Complète `e-biblio-brief-projet.md`, `frontend-web.md` (l'app qu'il enrobe) et `frontend-mobile.md`.

---

## 1. Principe

Conforme au brief (section 17) : le desktop **enrobe l'app web existante, sans réécriture**. `frontend-desktop/` ne contient aucune logique métier — juste une coquille Electron qui charge le build compilé de `frontend-web`.

```
frontend-desktop/
|-- main.js             (processus principal Electron)
|-- preload.js          (pont sécurisé, actuellement vide)
|-- build/icon.png      (source de l'icône)
`-- package.json        (scripts Electron et electron-builder)
```

Le client charge directement `https://e-biblio.vercel.app` en production. Il n'embarque pas de copie locale de `frontend-web` et ne contient aucune logique métier. En développement, `ELECTRON_START_URL` permet de charger le serveur Vite local.

## 2. Outils

| Brique | Outil | Pourquoi |
|---|---|---|
| Shell desktop | **Electron** | Imposé par le brief |
| Empaquetage / installeur | **electron-builder** | Génère un `.exe` NSIS (Windows) avec assistant d'installation, raccourci bureau, désinstalleur |
| Site chargé | **Frontend web déployé** | Les mises à jour web sont visibles sans reconstruire l'installeur desktop; le premier lancement nécessite internet |

## 3. Bugs rencontrés et corrigés

| Symptôme | Cause | Correctif |
|---|---|---|
| Fenêtre Electron qui s'ouvre mais reste **blanche** | L'ancien chargement par `file://` bloquait les modules ES du build Vite | Le correctif actuel charge l'URL web de production via `win.loadURL()`; aucun serveur HTTP local n'est nécessaire |
| Chemins d'assets cassés dans le build (`/assets/...` non trouvés) | Vite utilise par défaut des chemins **absolus**, invalides hors d'un serveur web à la racine `/` | `base: './'` ajouté dans `frontend-web/vite.config.js` (n'affecte pas un hébergement web classique) |
| `npm run dist` échoue : `ERROR: Cannot create symbolic link : Le client ne dispose pas d'un privilège nécessaire` en téléchargeant `winCodeSign` | electron-builder télécharge par défaut des outils de signature **macOS** (contenant des liens symboliques `.dylib`) même pour un build Windows-only ; Windows refuse de créer des liens symboliques sans élévation/Mode développeur | `$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"` avant `npm run dist` (on ne signe pas l'app) — évite complètement ce téléchargement. Solution de secours si besoin : activer le Mode développeur Windows (Paramètres → Confidentialité et sécurité → Pour les développeurs), qui autorise les liens symboliques sans droits admin. |
| `description is missed` / `author is missed` (avertissements, pas des erreurs) | Champs absents de `package.json` | Ajoutés (`description`, `author`) |
| Icône par défaut d'Electron sur le premier build | Aucune icône fournie | `build/icon.png` (1024×1024, logo du projet) ajouté + déclaré dans `package.json` (`build.icon`, `build.win.icon`) — electron-builder génère automatiquement le `.ico` |

## 4. ⚠️ Point d'attention : l'URL de l'API est figée au build

`frontend-web` lit `VITE_API_URL` **au moment du build** (Vite l'intègre en dur dans le JS compilé — ce n'est pas lu à l'exécution). Tant que `frontend-web/.env` contient :
```
VITE_API_URL=http://127.0.0.1:8000/api
```
l'exécutable produit ne fonctionne que **sur la machine où tourne aussi le backend Laravel local**. Pour distribuer l'app à d'autres utilisateurs/postes, il faut :
1. Héberger le backend quelque part d'accessible (voir `deploiement.md`).
2. Mettre à jour `.env` avec la vraie URL du serveur.
3. Relancer `npm run dist` pour reconstruire avec cette URL intégrée.

## 5. Ce qu'il reste à faire

- Vérifier l'affichage et l'ouverture des fenêtres PDF sur les postes cibles.
- Vérifier l'icône sur le raccourci, la barre des tâches et l'installateur.
- Décider si le chargement direct du site distant reste acceptable ou si une copie web embarquée doit être réintroduite pour un fonctionnement sans internet au premier lancement.
- Build macOS (`.dmg`) et Linux (`.AppImage`/`.deb`) : non testés, non prioritaires selon le brief (poste Windows utilisé pour le développement), mais `electron-builder` les supporte nativement si besoin (`--mac`, `--linux`).
- Signature de code Windows (actuellement l'app n'est pas signée — Windows SmartScreen peut afficher un avertissement "éditeur inconnu" à l'installation ; normal pour un usage interne, à corriger seulement si distribution large envisagée).

## 6. Procédures

### Lancer en développement (hot reload, contre le serveur Vite)
```powershell
cd S:\E-BIBLIO\frontend-web
npm run dev                          # laisser tourner
```
Dans un second terminal :
```powershell
cd S:\E-BIBLIO\frontend-desktop
$env:ELECTRON_START_URL = "http://localhost:5173"   # adapter le port si différent
npm start
```

### Générer l'installateur Windows
```powershell
cd S:\E-BIBLIO\frontend-desktop
npm install                          # une seule fois
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
npm run dist
```
Résultat dans `frontend-desktop/dist/` : `SCKOLARIS Setup <version>.exe`. Après génération, publier le fichier avec `backend/scripts/publish-release.ps1` et la route `/api/app-releases` si la détection de mise à jour doit le proposer aux utilisateurs.

### Mettre à jour l'icône ou le logo
Remplacer `frontend-desktop/build/icon.png` (image carrée, 1024×1024 recommandé), puis relancer `npm run dist`.
