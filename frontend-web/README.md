# SCKOLARIS web

Application web React/Vite de la bibliothèque numérique de l'IU-ZTF. Elle consomme exclusivement l'API Laravel du dossier `backend/` et fournit le catalogue, la lecture, les téléchargements validés, la bibliothèque hors ligne, les dépôts enseignants et les écrans d'administration.

## Développement

```powershell
cd S:\E-BIBLIO\frontend-web
npm install
npm run dev
```

Configurer `VITE_API_URL` dans `.env`, par exemple `http://127.0.0.1:8000/api` en local. Les jetons sont gérés par `AuthContext`; les appels HTTP sont centralisés dans `src/services/`.

## Build et contrôle

```powershell
npm run build
npm run preview
npm run lint
```

Le contenu de `dist/` est déployé sur un hébergement statique avec fallback vers `index.html` pour React Router. Le client Electron actuel charge le site web déployé directement; il n'embarque pas ce dossier.

## Hors ligne

L'interface est installable comme PWA. Les documents téléchargés sont conservés dans IndexedDB, cloisonnés par utilisateur, et la bibliothèque est synchronisée avec l'API via `/api/library`.
