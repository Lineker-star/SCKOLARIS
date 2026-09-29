# Publier une nouvelle version desktop/mobile (sans compte admin)

Aide-mémoire des commandes — le détail et le "pourquoi" complet sont dans `deploiement.md` (§5bis).

## 1. Générer le jeton (une seule fois, à la création du système)

Le jeton (`RELEASE_UPLOAD_TOKEN`) est une longue chaîne aléatoire qui remplace le besoin d'un compte admin pour publier un installeur. À générer **une seule fois**, puis à conserver dans un gestionnaire de mots de passe.

**PowerShell (marche toujours, aucune dépendance)** :
```powershell
-join ((1..32) | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
```

**Avec OpenSSL, si disponible** (vérifier d'abord avec `Get-Command openssl -ErrorAction SilentlyContinue`) :
```powershell
openssl rand -hex 32
```

Les deux donnent un résultat équivalent : une chaîne hexadécimale de 64 caractères, imprévisible.

## 2. Configurer le jeton sur Railway (une seule fois)

1. Railway → projet → service backend → onglet **Variables**.
2. Ajouter une variable : `RELEASE_UPLOAD_TOKEN` = *(la chaîne générée à l'étape 1)*.
3. Railway redéploie automatiquement le service pour prendre la variable en compte.

## 3. Publier une nouvelle version (à chaque nouvel installeur)

Depuis PowerShell, à la racine du dépôt :

```powershell
cd backend\scripts

# Une fois par session PowerShell (évite de le retaper à chaque commande) :
$env:RELEASE_UPLOAD_TOKEN = "<colle le jeton ici>"

# Windows (.exe) :
.\publish-release.ps1 -Platform windows -Version 1.2.0 -File "C:\chemin\vers\e-biblio Setup 1.2.0.exe"

# Android (.apk) :
.\publish-release.ps1 -Platform android -Version 1.2.0 -File "C:\chemin\vers\e-biblio-1.2.0.apk"
```

- `-Platform` : `windows` ou `android` uniquement.
- `-Version` : format `X.Y.Z` obligatoire (ex: `1.2.0`) — refusé sinon par le serveur.
- `-File` : chemin complet vers le fichier `.exe`/`.apk` fraîchement compilé.

Le script confirme avec `OK — publié` (code HTTP `201`) si tout s'est bien passé, ou affiche l'erreur du serveur sinon (jeton invalide, extension incorrecte, version mal formée...).

## 4. Vérifier que c'est bien en ligne (optionnel)

```powershell
Invoke-RestMethod -Uri "https://e-biblio-app-hybride-production.up.railway.app/api/app-releases"
```

Doit renvoyer la nouvelle version et son URL de téléchargement pour la plateforme publiée.

## 5. Retirer un installeur publié par erreur (optionnel)

```powershell
curl.exe -X DELETE "https://e-biblio-app-hybride-production.up.railway.app/api/app-releases/windows" `
  -H "X-Release-Token: $env:RELEASE_UPLOAD_TOKEN"
```

Remplacer `windows` par `android` selon la plateforme à retirer.

## Et ensuite ?

Rien d'autre à faire : les appareils déjà installés (desktop et mobile) vérifient automatiquement l'existence d'une nouvelle version à chaque lancement et proposent la mise à jour à l'utilisateur — aucune action supplémentaire de ta part.
