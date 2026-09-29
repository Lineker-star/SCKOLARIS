// Base de connaissance française de l'assistant SCKOLARIS — voir
// chatbotKnowledge.js pour le fonctionnement général (correspondance par
// mots-clés, deux passes, réponses par rôle).
export const knowledgeBase = [
  // --- Salutations / méta ---
  {
    keywords: [['bonjour'], ['salut'], ['bonsoir'], ['coucou']],
    answer:
      "Bonjour ! Je suis l'assistant SCKOLARIS, la bibliothèque numérique de l'Universite ZTF. Je peux vous expliquer en détail comment chercher, lire et télécharger un document, gérer votre compte, ou (selon votre rôle) déposer un support ou administrer la plateforme. Posez votre question.",
  },
  {
    keywords: [['merci']],
    answer: "Avec plaisir ! N'hésitez pas si vous avez une autre question, même sur un détail.",
  },
  {
    keywords: [['qui', 'es', 'tu'], ['que', 'peux', 'tu', 'faire'], ['a', 'quoi', 'sers'], ['assistant']],
    answer:
      "Je suis l'assistant intégré à SCKOLARIS. Je réponds à partir d'une liste de sujets connus sur le fonctionnement de la plateforme — recherche, lecture, téléchargement, compte, dépôt de supports, administration selon votre rôle. Je ne suis pas une intelligence artificielle générale : pour tout ce qui sort de SCKOLARIS, ou pour un problème précis non couvert, la page Contact (biblio@iu-ztf.cm) vous mettra en relation avec une vraie personne.",
  },

  // --- Recherche / catalogue ---
  {
    keywords: [
      ['chercher', 'livre'],
      ['trouver', 'livre'],
      ['recherche', 'document'],
      ['catalogue'],
      ['comment', 'chercher'],
      ['filtrer'],
    ],
    answer:
      "Pour chercher un document : ouvrez « Catalogue » dans le menu, tapez un mot du titre ou du nom de l'auteur dans la barre de recherche, puis affinez si besoin avec les deux menus déroulants Domaine et Sous-domaine (le second se remplit une fois un domaine choisi). Cliquez sur un résultat pour ouvrir sa fiche complète : résumé, auteur, domaine, et les boutons « Lire en ligne » / « Télécharger ».",
  },
  {
    keywords: [['domaine'], ['sous-domaine'], ['classer', 'matiere'], ['categorie', 'document']],
    answer:
      "Chaque document appartient à un sous-domaine, lui-même rattaché à un domaine (par exemple : domaine « Sciences de la Santé » › sous-domaine « Médecine Générale »). Cette organisation à deux niveaux sert à filtrer le catalogue. Elle est gérée par les administrateurs depuis la page « Domaines » — création, renommage ou suppression, uniquement possible si le sous-domaine ne contient plus aucun document.",
  },

  // --- Lecture ---
  {
    keywords: [
      ['lire', 'ligne'],
      ['lecture', 'ligne'],
      ['ouvrir', 'livre'],
      ['comment', 'lire'],
      ['consulter', 'document'],
    ],
    answer:
      "Sur la fiche d'un document, le bouton « Lire en ligne » l'ouvre directement dans la page, sans le télécharger sur votre appareil et sans exiger que vous l'ayez déjà dans votre bibliothèque — vous voyez le document tel qu'il a été publié, mise en page et images d'origine incluses (pas un simple texte reformaté). Une connexion internet est nécessaire pour cette lecture en direct, sauf si le document a déjà été téléchargé dans « Ma bibliothèque », auquel cas il reste lisible hors connexion.",
  },
  {
    keywords: [['page', 'blanche'], ['ne', 'charge', 'pas'], ['erreur', 'lecture'], ['impossible', 'charger']],
    answer:
      "Si un document ne s'affiche pas : vérifiez d'abord votre connexion internet (la lecture en ligne d'un document non téléchargé en a besoin). Si le problème persiste sur plusieurs documents, essayez de recharger la page ; si un seul document précis pose systématiquement problème, signalez-le via la page Contact avec son titre — il peut s'agir d'un souci propre à ce fichier.",
  },

  // --- Téléchargement / bibliothèque hors ligne ---
  {
    keywords: [['telecharger', 'document'], ['telechargement'], ['comment', 'telecharger']],
    answer:
      "Le bouton « Télécharger » sur la fiche d'un document l'enregistre dans « Ma bibliothèque » et le rend disponible hors connexion sur cet appareil. Le téléchargement nécessite un compte validé (pas seulement en attente) — sinon le bouton renvoie une erreur expliquant qu'une validation est requise.",
  },
  {
    keywords: [
      ['hors', 'ligne'],
      ['sans', 'connexion'],
      ['offline'],
      ['synchron'],
      ['plusieurs', 'appareil'],
      ['meme', 'compte', 'autre'],
    ],
    answer:
      "Les documents téléchargés dans « Ma bibliothèque » restent lisibles sans connexion internet sur l'appareil où ils ont été téléchargés. Votre bibliothèque se synchronise automatiquement entre tous vos appareils connectés au même compte (site web, application mobile, application PC) : ce que vous téléchargez sur l'un apparaît sur les autres dès qu'ils se reconnectent, et ce que vous retirez d'un côté disparaît aussi des autres.",
  },
  {
    keywords: [['ma', 'bibliotheque'], ['retirer', 'bibliotheque'], ['supprimer', 'telechargement']],
    answer:
      "« Ma bibliothèque » liste tous les documents que vous avez téléchargés, avec un accès hors connexion. Vous pouvez en retirer un à tout moment depuis cet écran — il sera aussi retiré de vos autres appareils à leur prochaine synchronisation.",
  },

  // --- Compte : inscription, connexion, mot de passe ---
  {
    keywords: [['creer', 'compte'], ['inscription'], ["s'inscrire"], ['inscrire'], ['nouveau', 'compte']],
    answer:
      "Depuis la page d'accueil, cliquez sur « S'inscrire ». Un menu « S'inscrire en tant que » propose Étudiant ou Enseignant — ce choix change un détail du formulaire : le matricule reste obligatoire pour un étudiant, mais devient facultatif pour un enseignant (l'Universite ZTF n'en attribue pas systématiquement à son personnel enseignant). Le reste (nom, prénom, e-mail, mot de passe, photo d'identité) est identique pour les deux. Une connexion internet est nécessaire pour créer un compte. Votre compte est ensuite créé avec le statut « en attente » — même pour un enseignant, voir plus bas pour la suite.",
  },
  {
    keywords: [
      ['compte', 'attente'],
      ['validation', 'compte'],
      ['valider', 'compte'],
      ['combien', 'temps', 'compte'],
      ['pourquoi', 'attente'],
    ],
    answer: "Un compte nouvellement créé (étudiant comme enseignant) reste « en attente » jusqu'à sa validation par un administrateur de l'Universite ZTF. Pendant cette attente, vous pouvez consulter le catalogue, mais le téléchargement et le dépôt de documents restent bloqués.",
    roles: {
      teacher:
        "Les nouveaux comptes (étudiants comme enseignants) restent « en attente » jusqu'à validation par un administrateur — en tant qu'enseignant, vous ne pouvez pas valider ou rejeter de compte vous-même, cette action est réservée aux administrateurs.",
      admin:
        "Les nouveaux comptes (étudiants comme enseignants) restent « en attente » jusqu'à validation. Depuis « Comptes en attente », vous pouvez les valider ou les rejeter. Un rejet est définitif et irréversible — le compte est alors banni du système, aucune nouvelle validation n'est possible même plus tard. Vous pouvez aussi gérer tous les comptes (y compris changer un rôle, désactiver/réactiver) depuis « Utilisateurs ». Dans tous les cas (validation, rejet, désactivation, réactivation), l'utilisateur reçoit automatiquement un e-mail à son adresse principale l'informant du changement.",
    },
  },
  {
    keywords: [['se', 'connecter'], ['comment', 'connexion'], ['identifiant', 'connexion'], ['login']],
    answer:
      "La connexion se fait avec votre mot de passe et soit votre matricule, soit votre adresse e-mail — les deux fonctionnent indifféremment. C'est surtout utile pour un enseignant sans matricule (facultatif à l'inscription) : il se connecte alors avec son e-mail.",
  },
  {
    keywords: [['mot', 'passe', 'oublie'], ['mot', 'passe', 'perdu'], ['reinitialiser', 'mot', 'passe']],
    answer: "Sur l'écran de connexion, le lien « Mot de passe oublié » vous permet de le réinitialiser par courriel.",
  },
  {
    keywords: [['changer', 'mot', 'passe'], ['modifier', 'profil'], ['photo', 'profil'], ['avatar'], ['email', 'secondaire']],
    answer:
      "Depuis « Profil » dans le menu, vous pouvez modifier votre nom, votre filière, ajouter un email secondaire, changer votre photo de profil, et mettre à jour votre mot de passe.",
  },
  {
    keywords: [['compte', 'desactive'], ['compte', 'bloque'], ['pourquoi', 'bloque']],
    answer: "Un compte désactivé par un administrateur ne peut plus se connecter ni effectuer aucune action nécessitant un compte validé (téléchargement, dépôt...) tant qu'il n'est pas réactivé.",
    roles: {
      teacher:
        "Un compte désactivé ne peut plus rien faire nécessitant un compte validé. En tant qu'enseignant, vous ne gérez pas la désactivation des comptes — c'est réservé aux administrateurs, via « Utilisateurs ».",
      admin:
        "Vous pouvez désactiver ou réactiver un compte depuis sa fiche dans « Utilisateurs » (impossible de désactiver votre propre compte). Une fois désactivé, l'utilisateur est bloqué dès sa prochaine action — même s'il était déjà connecté — jusqu'à réactivation. Contrairement au rejet, une désactivation est réversible.",
    },
  },
  {
    keywords: [['role'], ['etudiant', 'enseignant'], ['difference', 'compte'], ['permission'], ['droit', 'compte']],
    answer:
      "Trois rôles existent sur SCKOLARIS : étudiant (consulter le catalogue, lire et télécharger, gérer sa bibliothèque personnelle), enseignant (en plus, déposer des supports de cours et gérer ses propres dépôts, valider/rejeter les comptes en attente), et administrateur (en plus, gérer tous les comptes et leurs rôles, gérer les domaines/sous-domaines, modérer tout le catalogue, consulter les statistiques).",
  },
  {
    keywords: [['format', 'matricule'], ['numero', 'etudiant'], ['matricule', 'invalide'], ['matricule', 'exemple']],
    answer:
      "Le matricule suit un format réglementaire fixe : 2 chiffres (année d'inscription) + 3 lettres (code filière) + 3 chiffres (numéro séquentiel), par exemple « 26SWE001 ». Un matricule qui ne suit pas exactement cette forme est refusé à l'inscription — le message d'erreur affiché sous le champ indique précisément ce qui ne va pas. Obligatoire pour un étudiant ; facultatif pour un enseignant, mais toujours vérifié dans ce format s'il est quand même fourni.",
  },
  {
    keywords: [['regle', 'mot', 'passe'], ['securite', 'mot', 'passe'], ['mot', 'passe', 'invalide'], ['format', 'mot', 'passe'], ['mot', 'passe', 'refuse']],
    answer:
      "Un mot de passe doit contenir au moins 4 lettres, 3 chiffres et 1 symbole (un caractère qui n'est ni une lettre ni un chiffre, comme « ! » ou « - ») — l'ordre n'a pas d'importance. Ces trois minimums cumulés imposent naturellement une longueur d'au moins 8 caractères. Cette règle s'applique à l'inscription, à la réinitialisation par e-mail, et au changement de mot de passe depuis le profil.",
  },
  {
    keywords: [['photo', 'identite'], ['photo', 'obligatoire'], ['photo', '4x4'], ['photo', 'inscription'], ['sans', 'photo']],
    answer:
      "Une photo d'identité (format 4x4, comme pour une pièce officielle) est obligatoire pour créer un compte — l'inscription est bloquée tant qu'aucune photo n'est fournie. Sur mobile, deux façons de la fournir : « Prendre une photo » (ouvre l'appareil photo) ou « Depuis la galerie » (choisit une image déjà sur l'appareil) ; sur le web, le sélecteur de fichier du navigateur propose ce même choix. Cette photo devient directement la photo de profil du compte, modifiable ensuite depuis « Profil ». Taille maximale : 2 Mo.",
  },
  {
    keywords: [['changer', 'langue'], ['anglais'], ['francais', 'anglais'], ['language'], ['traduction']],
    answer:
      "SCKOLARIS est disponible en français et en anglais. L'icône en forme de globe (en haut du site, ou dans le menu latéral une fois connecté) ouvre un menu pour choisir la langue — tout le texte de l'interface change instantanément, sans recharger la page. Le choix est mémorisé sur l'appareil.",
  },
  {
    keywords: [['mode', 'sombre'], ['mode', 'clair'], ['theme'], ['apparence', 'site'], ['dark', 'mode']],
    answer:
      "Un bouton (souvent à côté du sélecteur de langue) bascule entre l'apparence claire et sombre du site. Le choix est mémorisé sur l'appareil et repris à chaque visite.",
  },
  {
    keywords: [['guide', 'utilisation'], ['tutoriel'], ['comment', 'utiliser'], ['mode', 'emploi'], ['manuel', 'utilisateur']],
    answer:
      "Un guide d'utilisation détaillé, avec des aperçus fidèles de chaque écran, est disponible depuis « Guide d'utilisation » dans le menu — il explique pas à pas toutes les fonctionnalités, avec une section dédiée à l'administration de la plateforme.",
  },

  // --- Dépôt de contenu (enseignant / admin) ---
  {
    keywords: [['deposer'], ['depot', 'support'], ['deposer', 'cours'], ['ajouter', 'document'], ['publier', 'document']],
    answer:
      "Le dépôt de supports est réservé aux enseignants et administrateurs — un compte étudiant ne voit pas cette option.",
    roles: {
      student:
        "Le dépôt de documents est réservé aux enseignants et administrateurs. En tant qu'étudiant, vous ne pouvez pas déposer de support, mais vous pouvez signaler un document manquant ou problématique via la page Contact.",
      teacher:
        "Depuis « Déposer un support », renseignez le titre, choisissez le sous-domaine, ajoutez un résumé, sélectionnez le fichier (PDF, jusqu'à 500 Mo) et, si vous le souhaitez, une image de couverture. Vous restez responsable du contenu déposé, y compris des droits d'auteur. Vous retrouvez ensuite tous vos dépôts dans « Mes dépôts ».",
      admin:
        "Depuis « Déposer un support », renseignez le titre, choisissez le sous-domaine, ajoutez un résumé, sélectionnez le fichier (PDF, jusqu'à 500 Mo) et, si vous le souhaitez, une image de couverture. En tant qu'administrateur, vous pouvez aussi modifier ou supprimer n'importe quel document du catalogue, pas seulement les vôtres, depuis sa fiche.",
    },
  },
  {
    keywords: [['mes', 'depots'], ['modifier', 'depot'], ['supprimer', 'depot']],
    answer:
      "« Mes dépôts » liste les supports que vous avez déposés. Vous pouvez modifier leurs informations (titre, sous-domaine, résumé, fichier, couverture) ou faire une demande de suppression depuis cet écran — la suppression d'un document déjà en ligne doit être approuvée par un administrateur, elle n'est pas immédiate.",
  },
  {
    keywords: [['demande', 'suppression'], ['supprimer', 'definitivement']],
    answer: "Une demande de suppression concerne un document déjà en ligne : elle doit être approuvée par un administrateur avant que le document ne disparaisse réellement du catalogue.",
    roles: {
      admin:
        "Les demandes de suppression envoyées par les enseignants apparaissent dans « Demandes de suppression ». Vous pouvez y examiner chaque demande (document concerné, enseignant, date) et l'approuver ou la refuser.",
    },
  },

  // --- Administration (domaines, utilisateurs, stats) ---
  {
    keywords: [['gerer', 'utilisateur'], ['liste', 'utilisateur'], ['changer', 'role'], ['promouvoir']],
    answer: "La gestion des comptes utilisateurs (liste complète, recherche, changement de rôle, désactivation) est réservée aux administrateurs.",
    roles: {
      admin:
        "Depuis « Utilisateurs », vous avez la liste complète des comptes avec recherche par nom/matricule et filtre par rôle ou statut. La fiche de chaque compte permet de changer son rôle, de le désactiver/réactiver, et montre son historique de téléchargements.",
    },
  },
  {
    keywords: [['gerer', 'domaine'], ['creer', 'domaine'], ['ajouter', 'sous-domaine'], ['supprimer', 'domaine'], ['renommer', 'domaine']],
    answer: "La création/modification/suppression des domaines et sous-domaines est réservée aux administrateurs, depuis la page « Domaines ».",
    roles: {
      admin:
        "Depuis « Domaines », le bouton « + Nouveau domaine » en crée un ; sur chaque domaine, l'icône crayon renomme, la corbeille supprime, et « + Ajouter un sous-domaine » en crée un dessous. Règle importante : impossible de supprimer un domaine qui contient encore des sous-domaines, ni un sous-domaine qui contient encore des documents — il faut d'abord les déplacer ou les retirer, pour ne jamais laisser de document orphelin.",
    },
  },
  {
    keywords: [['statistique'], ['analyse', 'donnee'], ['tableau', 'bord', 'admin'], ['graphique', 'admin']],
    answer: "La page Statistiques (calculs faits en langage R) est réservée aux administrateurs : téléchargements et lectures par jour, utilisateurs en ligne, nouvelles inscriptions, répartition des comptes, et catalogue par domaine.",
    roles: {
      admin:
        "La page « Statistiques » montre l'activité de la plateforme sur les 90 derniers jours en graphiques : téléchargements, lectures en ligne, inscriptions et utilisateurs actifs par jour, qui est en ligne en ce moment, la répartition des comptes par statut, et le nombre exact de documents par domaine/sous-domaine. Le bouton « Voir les conclusions en langage clair » en haut de cette page traduit tous ces chiffres en phrases simples, sans jargon — pratique pour un aperçu rapide sans lire les graphiques.",
    },
  },

  // --- Applications mobile / desktop ---
  {
    keywords: [
      ['application', 'mobile'],
      ['application', 'bureau'],
      ['telecharger', 'application'],
      ['apk'],
      ['setup', 'pc'],
      ['installer', 'app'],
      ['android'],
      ['ordinateur'],
    ],
    answer:
      "Les applications Android et Windows sont disponibles depuis « Télécharger l'application » dans le menu. Elles se connectent avec le même compte et affichent la même bibliothèque que le site web — tout ce que vous téléchargez sur l'un apparaît sur les autres. Sur Android, un écran de conditions d'utilisation s'affiche au tout premier lancement ; sur Windows, l'installateur affiche un contrat de licence à accepter avant de continuer.",
    roles: {
      admin:
        "Les applications Android et Windows sont disponibles depuis « Télécharger l'application ». En tant qu'administrateur, vous voyez en plus les contrôles de publication pour chaque plateforme : saisir un numéro de version (format X.Y.Z), choisir le fichier (.exe ou .apk) et cliquer « Publier » — un nouvel envoi remplace l'installeur précédent, il n'y a pas d'historique de versions. Le bouton « Supprimer » retire l'installeur publié. Les appareils déjà installés détectent automatiquement la nouvelle version à leur prochain lancement.",
    },
  },

  // --- Vie privée / légal ---
  {
    keywords: [['cookie'], ['confidentialite'], ['donnee', 'personnelle'], ['vie', 'privee'], ['suivi', 'audience']],
    answer:
      "SCKOLARIS ne collecte que les données nécessaires au fonctionnement de votre compte et de votre bibliothèque. Le suivi d'audience (pour savoir combien de personnes visitent le site) est optionnel : vous choisissez de l'accepter ou de le refuser via le bandeau proposé au bas de la page, et vous pouvez changer d'avis à tout moment via « Gérer les cookies » dans le pied de page. Le détail complet est dans la politique de confidentialité.",
  },
  {
    keywords: [['condition', 'utilisation'], ['mention', 'legale'], ['droit', 'auteur'], ['cgu']],
    answer:
      "Les conditions d'utilisation, la politique de confidentialité et les mentions légales sont accessibles depuis les liens en bas de chaque page du site.",
  },

  // --- Contact ---
  {
    keywords: [['contact'], ['aide', 'humaine'], ['parler', 'quelqu'], ['probleme', 'technique'], ['bug'], ['signaler']],
    answer:
      "Pour une aide personnalisée ou signaler un problème précis (document manquant, erreur technique...), utilisez la page « Contact » ou écrivez directement à biblio@iu-ztf.cm — une vraie personne vous répondra.",
  },
]

export const fallbackAnswer =
  "Je n'ai pas de réponse toute prête pour cette question précise. Essayez de la reformuler avec d'autres mots (par exemple « comment télécharger un livre » plutôt que « comment l'avoir »), ou contactez-nous directement via la page Contact (biblio@iu-ztf.cm) — une vraie personne vous répondra."

export const greetingKnown =
  "Bonjour ! Je suis l'assistant SCKOLARIS — vous êtes connecté en tant que {{role}}, mes réponses en tiennent compte. Posez votre question."
export const greetingAnonymous =
  "Bonjour ! Je suis l'assistant SCKOLARIS. Posez-moi une question sur la recherche, la lecture, le téléchargement ou la création d'un compte."
export const roleLabels = { student: 'étudiant', teacher: 'enseignant', admin: 'administrateur' }
