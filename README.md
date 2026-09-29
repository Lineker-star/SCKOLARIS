# SCKOLARIS

Bibliothèque numérique privée de l'**Institut Universitaire ZTF (IU-ZTF)**, à Bertoua, Cameroun. Elle remplace la bibliothèque physique — consultable jusqu'ici uniquement sur place — par une plateforme numérique accessible à distance, web comme mobile, avec un accès strictement réservé à la communauté de l'école (étudiants, enseignants, administration).

Aucun livre physique, aucun emprunt, aucune réservation : le système gère exclusivement des documents numériques (supports de cours, ressources documentaires) consultables en ligne ou téléchargeables pour une lecture hors connexion.

## Fonctionnalités principales

- **Comptes et rôles** — étudiant, enseignant, administrateur, avec validation manuelle des inscriptions par un administrateur avant accès complet (statuts `pending` / `validated` / `rejected`).
- **Catalogue** — recherche et filtrage par titre, auteur, matière, filière ; fiche détaillée par document.
- **Lecture et téléchargement** — lecture en ligne accessible dès l'inscription (même en attente de validation), téléchargement réservé aux comptes validés, lecture hors connexion des documents téléchargés.
- **Dépôt de supports de cours** — un enseignant dépose ses propres documents, les modifie, ou demande leur suppression (justification obligatoire, soumise à l'approbation d'un administrateur).
- **Administration** — validation des comptes, gestion du catalogue, traitement des demandes de suppression, statistiques d'usage, suivi des utilisateurs en ligne/hors ligne.
- **Sécurité** — authentification par jeton (Sanctum, validité 24h), mots de passe hachés, accès conditionné au rôle et au statut du compte sur chaque fonctionnalité.

## Architecture

Une seule API Laravel dessert quatre applications clientes :

```
SCKOLARIS/
├── backend/            API Laravel 12 (PHP 8.2+, Sanctum, PostgreSQL)
├── frontend-web/        Application web — React 18, Vite, Tailwind CSS v4
├── frontend-mobile/     Application mobile — React Native, Expo (Android/iOS)
├── frontend-desktop/    Application de bureau — Electron (Windows/macOS/Linux)
├── api-endpoints.md     Référence complète des routes de l'API
├── deploiement.md       Guide de déploiement et d'exploitation en production
├── frontend-web.md      Documentation du frontend web
├── frontend-mobile.md   Documentation du frontend mobile
├── frontend-desktop.md  Documentation du frontend desktop
└── e-biblio-brief-projet.md   Cahier des charges et spécifications complètes
```

## Stack technique

| Composant | Technologies |
|---|---|
| Backend | Laravel 12, PHP 8.2+, Laravel Sanctum (auth par jeton), PostgreSQL |
| Frontend web | React 18, Vite, Tailwind CSS v4, React Router |
| Frontend mobile | React Native, Expo SDK 57, NativeWind v4, React Navigation |
| Frontend desktop | Electron, electron-builder |

## Démarrage rapide

Chaque application dispose de sa propre documentation détaillée (installation, configuration, scripts) :

- **Backend** — voir [backend/README.md](backend/README.md) et [api-endpoints.md](api-endpoints.md)
- **Web** — voir [frontend-web.md](frontend-web.md)
- **Mobile** — voir [frontend-mobile.md](frontend-mobile.md)
- **Desktop** — voir [frontend-desktop.md](frontend-desktop.md)
- **Déploiement en production** — voir [deploiement.md](deploiement.md)

## Documentation du projet

Le document [e-biblio-brief-projet.md](e-biblio-brief-projet.md) consolide le cahier des charges, la conception et les spécifications techniques : acteurs, besoins fonctionnels et non fonctionnels, règles de gestion.
