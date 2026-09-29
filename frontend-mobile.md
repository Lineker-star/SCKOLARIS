# SCKOLARIS — Application mobile (`frontend-mobile/`)

Journal de développement de l'application mobile : ce qui a été fait, avec quels outils, les problèmes rencontrés et corrigés, et ce qu'il reste à faire pour un déploiement complet (Android + iOS). Sert de complément à `e-biblio-brief-projet.md` (spécifications) et `api-endpoints.md` (contrat API).

---

## 1. Stack technique

| Brique | Outil | Pourquoi |
|---|---|---|
| Framework | **React Native + Expo (SDK 57)** | Imposé par le brief (section 10/16) : réutilise la logique du web, build simplifié via EAS |
| Style | **NativeWind v4** | Réutilise directement les classes et tokens Tailwind du web (`bg-primary`, `text-on-surface`, etc.) — voir `tailwind.config.js`, portage exact de `frontend-web/src/index.css` |
| Navigation | **React Navigation** (`@react-navigation/native` + `native-stack`) | Un unique `Stack.Navigator` plat (voir §4) |
| Auth | **expo-secure-store** (natif) / **AsyncStorage** (web, fallback) | Jeton Sanctum stocké de façon sécurisée sur appareil |
| Stockage hors-ligne | **AsyncStorage** (métadonnées) + **expo-file-system** (fichiers) | Équivalent mobile d'IndexedDB (web) — fichiers réellement sur disque, jamais dans le dossier Téléchargements public |
| Icônes | **react-native-svg** | Portage à l'identique des 44 icônes SVG du web (mêmes tracés) |
| Sélection de fichiers | **expo-document-picker** (dépôt de cours), **expo-image-picker** (photo de profil) | |
| Ouverture de fichiers | **expo-sharing** | Ouvre un PDF téléchargé avec le lecteur natif de l'appareil |
| Build/déploiement | **EAS Build** (Expo Application Services) | Génère l'APK Android / build iOS dans le cloud Expo |

Node.js n'est utilisé que comme outil de build (aucun serveur ne tourne côté utilisateur final), conformément au brief.

---

## 2. Historique des phases

### Phase 0 — Socle du projet
- Scaffold Expo (`create-expo-app`), configuration NativeWind (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`).
- Portage des tokens de couleur clair/sombre de `frontend-web/src/index.css` (suffixe `-night` pour les valeurs sombres, ex. `bg-primary dark:bg-primary-night`).
- `AuthContext.jsx` et `ThemeContext.jsx` portés (SecureStore/AsyncStorage au lieu de `localStorage`).
- `.env` / `.env.example` pour `EXPO_PUBLIC_API_URL`.

### Phase 1 — Composants partagés
`icons.jsx` (44 icônes), `Logo`, `TextField` (avec bascule visibilité mot de passe), `Modal`, `InfoCallout`, `StatusBadge`, `DocumentCard`, `Avatar` — portage direct des équivalents web.

### Phase 2 — Écrans publics
`HomeScreen`, `AboutScreen`, `ContactScreen` (formulaire formsubmit.co inclus, carte Google Maps via `react-native-webview`).

### Phase 3 — Authentification
`LoginScreen`, `RegisterScreen`, `ForgotPasswordScreen`, `PendingAccountScreen` (compte de l'utilisateur courant en attente), `AccessDeniedScreen`, `AuthLayout`. Navigation racine pilotée par le statut du compte (voir §4).

### Phase 4 — Catalogue & lecture
`CatalogScreen` (recherche + pagination), `DocumentDetailScreen` (lecture en ligne + téléchargement natif), `MyLibraryScreen` (bibliothèque hors-ligne).

### Phase 5 — Tableaux de bord par rôle
`StudentDashboardScreen`, `TeacherDashboardScreen`, `AdminDashboardScreen`, `ProfileScreen` (avec photo de profil), `MyDepositsScreen`, `DepositCourseScreen`, `EditDepositScreen`.

### Phase 6 — Gestion administrateur
`UsersScreen`, `UserDetailScreen`, `PendingAccountsScreen` (comptes à valider par l'admin), `PendingDeletionRequestsScreen`, `DeletionRequestDetailScreen`.

### Refonte navigation (post-Phase 6)
Demande explicite : une barre d'onglets **persistante partout** (Accueil / À propos / Contact, + Catalogue / Profil une fois connecté), et un menu-burger (accessible une fois connecté) ouvrant le tiroir de navigation par rôle (équivalent de la barre latérale `DashboardLayout` du web). A remplacé l'architecture initiale (un `PublicTabs` séparé + en-têtes différents par écran) par :
- `AppShell.jsx` — coquille commune à **tous** les écrans (en-tête + contenu + barre d'onglets).
- `BottomTabBar.jsx` — barre d'onglets custom (pas un vrai `Tab.Navigator` de React Navigation, pour éviter 3 niveaux d'imbrication).
- `NavDrawer.jsx` — tiroir latéral (Modal), contenu identique à l'ancien `DashboardShell`.
- Suppression de `PublicHeader.jsx`, `AppHeader.jsx`, `DashboardShell.jsx`, `PublicTabs.jsx` (remplacés).
- Suppression du `Footer.jsx` mobile (demande explicite : pas de pied de page comme sur le web, la barre d'onglets fait déjà office de navigation persistante).

### Alignement actuel avec le frontend web

- `AppShell` affiche dans tous les espaces authentifiés un rappel profil défilant tant que les informations requises ne sont pas complètes; il disparaît après `refreshUser()` lorsque le profil est à jour.
- Les notifications persistantes du backend sont chargées dans `AppShell`, affichées dans le tableau de bord et marquées comme lues au toucher.
- `Chatbot` appelle désormais `POST /api/chat`; la clé Gemini reste côté backend Railway et le contexte est filtré par rôle côté Laravel.
- `GuideScreen` est accessible depuis le tiroir pour chaque rôle. Il affiche les fonctions communes, puis uniquement les sections étudiant/enseignant/admin autorisées par le rôle courant.
- La détection des releases est commune à tous les écrans: contrôle périodique, retour au premier plan et bannière visible même dans un tableau de bord.

---

## 3. Bugs rencontrés et corrigés

Utile pour ne pas les réintroduire en continuant le développement.

| Symptôme | Cause | Correctif |
|---|---|---|
| `styleq: width typeof 64 is not "string" or "null"` (web) | `style={{width, height}}` mêlé à un `className` géré par `cssInterop` sur le même `<Image>` (`Logo.jsx`) | Ne jamais mélanger `style` littéral et `className` NativeWind sur un même élément à taille dynamique |
| `Unexpected text node: . A text node cannot be a child of a <View>` | `{error && (<Text>...)}` quand `error` vaut `''` — JS renvoie l'opérande de gauche (`''`), pas `false` | Toujours `{error ? (<Text>...) : null}` pour les états initialisés à chaîne vide (`useState('')`) |
| Même erreur, cause différente | `contentContainerClassName` sur `<ScrollView>` (prop spécifique NativeWind) | Remplacé par une `<View>` interne classique avec les mêmes classes |
| Après connexion/inscription, l'app reste sur l'écran précédent au lieu de naviguer vers le bon écran (web) | `key={state}` sur `Stack.Navigator` pour forcer un remontage : sur le web, React Navigation restaure l'état de navigation depuis l'URL du navigateur au moment du remontage | Remplacé par une navigation impérative via `navigationRef.reset()` (voir `RootNavigator.jsx`) |
| `expo-file-system.downloadAsync is not available on web` | `expo-file-system` (téléchargement/lecture de fichier) et `expo-sharing` (ouverture) sont des modules **natifs**, indisponibles dans l'aperçu `--web` | Comportement normal — nécessite un test sur appareil réel ou émulateur (voir §5) |
| `Method downloadAsync ... is deprecated` | SDK 57 a introduit de nouvelles classes `File`/`Directory`, dépréciant l'ancienne API `expo-file-system` | Import explicite depuis `expo-file-system/legacy` (même comportement, toujours supporté) dans `services/documents.js` et `services/offlineStore.js` |
| Installations npm qui restent bloquées indéfiniment | Le sandbox utilisé pour développer perd parfois l'accès réseau vers `registry.npmjs.org` et vers `127.0.0.1` (backend local de l'utilisateur), sans rapport avec le code | Les installs de paquets natifs (`expo install ...`) doivent être lancées **par l'utilisateur, dans son propre terminal** |
| Disque `S:` plein pendant l'installation d'`expo-image` | Partition `S:` très réduite (~20 Go), déjà quasi pleine avant même ce projet | Espace libéré manuellement par l'utilisateur ; à surveiller à chaque nouvelle dépendance native lourde |

---

## 4. Architecture de navigation actuelle

Un seul `Stack.Navigator` plat (`src/navigation/RootNavigator.jsx`) contient **tous** les écrans (comme les routes React Router du web). L'écran de démarrage dépend du statut du compte :

| État | Écran de démarrage |
|---|---|
| Non connecté | `Home` |
| `account_status = pending` | `PendingAccount` |
| `account_status = rejected` | `AccessDenied` |
| `account_status = validated` | `Dashboard` (résolu dynamiquement vers l'écran du rôle : étudiant/enseignant/admin) |

Le changement d'écran de départ (ex. juste après connexion) est appliqué via `navigationRef.reset()` dans un `useEffect`, pas via un remontage de composant (voir bug correspondant en §3).

Chaque écran est enveloppé dans `<AppShell title="...">` qui fournit :
- un en-tête (logo, sélecteur de thème, boutons Se connecter/S'inscrire si déconnecté, menu-burger si connecté) ;
- la **barre d'onglets persistante** en bas (`BottomTabBar`) ;
- le tiroir de navigation (`NavDrawer`, ouvert par le menu-burger) listant les écrans propres au rôle (Tableau de bord, Mes dépôts, Utilisateurs, etc. — voir `src/navigation/dashboardNav.js`).

---

## 5. Ce qu'il reste à faire

### Bloquant / à diagnostiquer
- **"Le téléchargement a échoué"** signalé par l'utilisateur — un `console.error('[handleDownload] échec :', err)` a été ajouté dans `DocumentDetailScreen.jsx` pour capturer la cause exacte au prochain essai (403 ? erreur réseau vers le backend ? autre ?). À relire dans les logs Metro/Expo Go lors du prochain test.
- Aucune fonctionnalité de téléchargement/lecture/partage de fichier (`expo-file-system`, `expo-sharing`) n'a pu être testée en conditions réelles : ces modules sont **indisponibles sur le web** (voir §3). Un test sur appareil réel ou émulateur est indispensable avant de considérer BF11/BF12/BF13 comme validés.

### Fonctionnalités désormais branchées côté backend
- Réinitialisation de mot de passe (BF06) : les routes `/api/forgot-password` et `/api/reset-password` existent; le parcours mobile ouvre la page web pour saisir le nouveau mot de passe.
- Changement de mot de passe depuis le profil : passe par `/api/me/password` après vérification du mot de passe actuel.

### Finitions avant un build "présentable"
- **Icône de l'app** : encore l'icône par défaut d'Expo (`assets/icon.png`, `android-icon-*.png`), pas le vrai logo SCKOLARIS. À remplacer avant un build destiné à être montré/distribué.
- Écran de démarrage (splash screen) : idem, valeurs par défaut.
- Nettoyage de l'avertissement d'accessibilité `aria-hidden`/focus visible dans la console web (bénin, n'apparaît pas sur l'app native — voir §3, basse priorité).

### Build / déploiement (EAS)
- `eas.json` créé avec un profil `preview` (APK Android direct) et un profil `production` (AAB, pour un futur Play Store).
- `app.json` complété avec `android.package` et `ios.bundleIdentifier` (`cm.iuztf.ebiblio`), requis par EAS.
- **Android** : build testable dès maintenant (voir procédure §6). Résultat = fichier `.apk` transférable librement entre téléphones (Bluetooth, câble, cloud...), à condition d'autoriser "Installer depuis une source inconnue" sur l'appareil qui le reçoit.
- **iOS** : nécessite un compte Apple Developer payant (99$/an) — aucun moyen de contourner cette exigence (imposée par Apple, pas par Expo). Sans ce compte, seul le test via l'app **Expo Go** (scan du QR code) est possible, ce n'est pas une app installée de façon autonome.

### Tests de bout en bout restant à réaliser
- Flux complet d'authentification, catalogue, téléchargement, tableau de bord **sur un vrai appareil** (le sandbox de développement ne peut tester que l'aperçu web, qui ne couvre pas les fonctionnalités natives).
- Vérifier que `EXPO_PUBLIC_API_URL` pointe vers l'IP locale du PC (pas `127.0.0.1`) pour un test sur téléphone physique via Expo Go — voir `.env.example` pour les différents cas (émulateur Android, appareil physique).

---

## 6. Procédures

### Lancer l'app en développement
```powershell
cd S:\E-BIBLIO\frontend-mobile
npx expo start --web       # aperçu rapide dans le navigateur (fonctionnalités natives indisponibles)
npx expo start             # affiche un QR code à scanner avec l'app Expo Go (Android/iOS) — test complet
```
Pour tester sur un téléphone physique via Expo Go, le téléphone doit être sur le **même réseau Wi-Fi** que le PC, et `.env` doit pointer vers l'IP locale du PC (pas `127.0.0.1`).

### Installer une nouvelle dépendance native
Toujours utiliser `expo install` (pas `npm install`) pour les paquets natifs, afin d'obtenir la version compatible avec le SDK :
```powershell
npx expo install <nom-du-paquet>
```

### Générer un APK Android installable
```powershell
npm install -g eas-cli      # une seule fois
eas login                   # compte Expo gratuit
eas build --platform android --profile preview
```
Le build tourne dans le cloud Expo (~10-15 min) ; un lien de téléchargement `.apk` est fourni à la fin. Ce fichier se transfère librement entre téléphones Android.

### Générer un build iOS (nécessite un compte Apple Developer payant)
```powershell
eas build --platform ios
```
Distribution ensuite via TestFlight (jusqu'à 10 000 testeurs externes) ou ad-hoc (appareils enregistrés par UDID).

---

## 7. Correspondance des écrans mobile ↔ web

| Web (`frontend-web/src/pages/`) | Mobile (`frontend-mobile/src/screens/`) |
|---|---|
| `Home.jsx` | `HomeScreen.jsx` |
| `About.jsx` | `AboutScreen.jsx` |
| `Contact.jsx` | `ContactScreen.jsx` |
| `Login.jsx` | `LoginScreen.jsx` |
| `Register.jsx` | `RegisterScreen.jsx` |
| `ForgotPassword.jsx` | `ForgotPasswordScreen.jsx` |
| `PendingAccount.jsx` | `PendingAccountScreen.jsx` |
| `AccessDenied.jsx` | `AccessDeniedScreen.jsx` |
| `Catalog.jsx` | `CatalogScreen.jsx` |
| `DocumentDetail.jsx` | `DocumentDetailScreen.jsx` |
| `MyLibrary.jsx` | `MyLibraryScreen.jsx` |
| `dashboard/StudentDashboard.jsx` | `dashboard/StudentDashboardScreen.jsx` |
| `dashboard/TeacherDashboard.jsx` | `dashboard/TeacherDashboardScreen.jsx` |
| `dashboard/AdminDashboard.jsx` | `dashboard/AdminDashboardScreen.jsx` |
| `Profile.jsx` | `ProfileScreen.jsx` |
| `MyDeposits.jsx` | `MyDepositsScreen.jsx` |
| `DepositCourse.jsx` | `DepositCourseScreen.jsx` |
| `EditDeposit.jsx` | `EditDepositScreen.jsx` |
| `Users.jsx` | `UsersScreen.jsx` |
| `UserDetail.jsx` | `UserDetailScreen.jsx` |
| `PendingAccounts.jsx` | `PendingAccountsScreen.jsx` |
| `PendingDeletionRequests.jsx` | `PendingDeletionRequestsScreen.jsx` |
| `DeletionRequestDetail.jsx` | `DeletionRequestDetailScreen.jsx` |
| `DashboardLayout.jsx` (sidebar) | `AppShell.jsx` + `NavDrawer.jsx` + `BottomTabBar.jsx` |
| `Navbar.jsx` / `AuthLayout.jsx` (en-tête) | `AppShell.jsx` (en-tête) / `AuthLayout.jsx` |
| `Footer.jsx` | *(supprimé côté mobile, sur demande explicite)* |
