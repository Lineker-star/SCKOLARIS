import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import {
  CheckIcon,
  XIcon,
  PencilIcon,
  TrashIcon,
  UploadCloudIcon,
  DownloadIcon,
  SearchIcon,
  BookOpenIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeIcon,
  SunIcon,
  CameraIcon,
  MonitorIcon,
} from '../components/icons'
import { useAuth } from '../context/AuthContext'

// Ce guide n'est pas encore passé par i18next (contrairement au reste du
// site) : c'est un texte long, rédigé une fois pour l'équipe de l'Universite ZTF,
// pas une interface qu'un visiteur anonyme doit lire en anglais. À traduire
// plus tard si un besoin réel apparaît.

function Chip({ href, children, tone = 'default' }) {
  const tones = {
    default: 'border-outline text-on-surface hover:bg-surface-container',
    admin: 'border-error/40 text-error hover:bg-error-container',
  }
  return (
    <a
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${tones[tone]}`}
    >
      {children}
    </a>
  )
}

function SectionHeader({ id, eyebrow, title, intro }) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold text-on-surface">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-on-surface-variant">{intro}</p>}
    </div>
  )
}

function Topic({ title, icon, children }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
        {icon}
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-on-surface-variant [&_strong]:text-on-surface [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </div>
  )
}

// Aperçu d'interface : reconstitue fidèlement un fragment réel de l'écran
// décrit (mêmes classes, mêmes couleurs que la vraie page) avec des données
// d'exemple explicitement fictives — ce n'est pas une capture d'écran, mais
// un rendu vivant du vrai composant, toujours à jour avec le thème actuel
// (contrairement à une image figée).
function Preview({ label, children }) {
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-outline-variant">
      <div className="border-b border-outline-variant bg-surface-container px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
        Aperçu — {label}
      </div>
      <div className="bg-surface p-4">{children}</div>
    </div>
  )
}

export default function Guide() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const isTeacher = user.role === 'teacher'
  const isStudent = user.role === 'student'

  const studentGuide = (isStudent || isAdmin) ? (
    <section className="mt-14 space-y-6">
      <SectionHeader
        id="etudiant"
        eyebrow="Rôle étudiant"
        title="Ce qu'un étudiant peut faire en plus"
      />
      <Topic title="Le tableau de bord étudiant" icon={<BookOpenIcon width={20} height={20} className="text-primary" />}>
        <p>
          Le tableau de bord étudiant permet de rechercher rapidement un document, d'ouvrir les
          dernières additions et de consulter les deux derniers téléchargements. Les accès
          permanents sont <strong>Catalogue</strong>, <strong>Ma bibliothèque</strong>,
          <strong> Télécharger l'application</strong>, <strong>Profil</strong> et ce guide.
        </p>
        <p>
          Un compte étudiant peut lire les documents dès qu'il est inscrit. Le téléchargement et
          la bibliothèque sont disponibles une fois le compte <StatusBadge status="validated" />.
          Les menus de dépôt, de gestion des comptes, de domaines, de demandes de suppression et
          de statistiques ne sont jamais affichés pour ce rôle.
        </p>
      </Topic>
    </section>
  ) : null

  const teacherGuide = (isTeacher || isAdmin) ? (
    <section className="mt-14 space-y-6">
      <SectionHeader
        id="enseignant"
        eyebrow="Rôle enseignant"
        title="Déposer et gérer des supports de cours"
      />
      <Topic title="Déposer un support" icon={<UploadCloudIcon width={20} height={20} className="text-primary" />}>
        <ol>
          <li>Menu <strong>« Déposer un support »</strong>.</li>
          <li>Renseigner le titre, choisir le sous-domaine, ajouter un résumé.</li>
          <li>Sélectionner le fichier (PDF, jusqu'à 500 Mo) et, en option, une image de couverture.</li>
        </ol>
        <p>
          Le document apparaît ensuite dans <strong>« Mes dépôts »</strong>, où il peut être
          modifié à tout moment (titre, sous-domaine, résumé, fichier, couverture).
        </p>
      </Topic>
      <Topic title="Retirer un document déjà en ligne" icon={<TrashIcon width={20} height={20} className="text-primary" />}>
        <p>
          Contrairement à une modification, retirer un document déjà publié n'est
          <strong> pas immédiat</strong> : depuis « Mes dépôts », le bouton
          <strong> « Demander la suppression »</strong> envoie une demande, avec une justification
          écrite, à valider par un administrateur avant que le document ne disparaisse réellement
          du catalogue.
        </p>
      </Topic>
      <Topic title="Le tableau de bord enseignant" icon={<BookOpenIcon width={20} height={20} className="text-primary" />}>
        <p>
          Le tableau de bord enseignant affiche vos dépôts récents, leur éventuelle demande de
          suppression en attente, les dernières additions du catalogue et les notifications.
          Les options disponibles sont <strong>Déposer un support</strong>, <strong>Mes dépôts</strong>,
          <strong>Catalogue</strong>, <strong>Ma bibliothèque</strong>, <strong>Télécharger l'application</strong>,
          <strong>Profil</strong> et ce guide.
        </p>
        <p>
          Un enseignant ne peut jamais valider un compte, gérer les utilisateurs, modifier les
          domaines, consulter les statistiques globales ou traiter la demande de suppression d'un
          autre enseignant. Ces fonctions appartiennent exclusivement à l'administrateur.
        </p>
      </Topic>
    </section>
  ) : null

  const adminGuide = isAdmin ? (
    <section className="mt-14 space-y-8">
      <SectionHeader
        id="admin"
        eyebrow="Rôle administrateur"
        title="Console d'administration"
        intro="Tout ce qui suit n'apparaît que dans le menu d'un compte administrateur."
      />

      <Topic title="Comptes en attente — valider ou rejeter" icon={<ShieldCheckIcon width={20} height={20} className="text-primary" />}>
        <p>Chaque nouvelle inscription apparaît ici jusqu'à décision. Deux boutons par ligne :</p>
        <ul>
          <li><strong>Valider</strong> (coche verte) — le compte passe en <StatusBadge status="validated" />, débloque téléchargement et dépôt.</li>
          <li><strong>Rejeter</strong> (croix) — décision définitive et irréversible.</li>
        </ul>
        <p>
          Un enseignant qui s'est inscrit lui-même passe aussi par cette liste. La validation d'un
          compte reste une action réservée aux administrateurs.
        </p>
      </Topic>

      <Topic title="Utilisateurs — gérer tous les comptes" icon={<UsersIcon width={20} height={20} className="text-primary" />}>
        <p>Rechercher les comptes, filtrer par rôle ou statut, changer les rôles, désactiver ou réactiver les comptes.</p>
      </Topic>

      <Topic title="Domaines — organiser le catalogue" icon={<ChartBarIcon width={20} height={20} className="text-primary" />}>
        <p>Créer, renommer et supprimer les domaines et sous-domaines utilisés par le catalogue.</p>
      </Topic>

      <Topic title="Demandes de suppression — approuver ou refuser" icon={<TrashIcon width={20} height={20} className="text-primary" />}>
        <p>Examiner la justification d'un enseignant, puis approuver ou refuser la suppression de son document.</p>
      </Topic>

      <Topic title="Statistiques — activité de la plateforme" icon={<ChartBarIcon width={20} height={20} className="text-primary" />}>
        <p>Consulter les lectures, téléchargements, inscriptions, utilisateurs actifs et répartitions du catalogue.</p>
      </Topic>

      <Topic title="Télécharger l'application — publier les installeurs" icon={<DownloadIcon width={20} height={20} className="text-primary" />}>
        <p>Publier ou retirer les installeurs Windows et Android, avec une version au format X.Y.Z.</p>
      </Topic>
    </section>
  ) : null

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">Guide d'utilisation</h1>
      <p className="mt-2 max-w-2xl text-on-surface-variant">
        {isAdmin
          ? "Guide complet de SCKOLARIS : espace commun, parcours étudiant, espace enseignant et administration de la plateforme."
          : isTeacher
            ? "Guide de l'espace enseignant : fonctionnalités communes, dépôt de supports et gestion de vos documents."
            : "Guide de l'espace étudiant : fonctionnalités communes, catalogue, lecture et bibliothèque personnelle."}{' '}
        Chaque aperçu est un rendu fidèle de l'interface, pas une image figée.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip href="#general">Pour tous</Chip>
        {(isStudent || isAdmin) && <Chip href="#etudiant">Étudiant</Chip>}
        {(isTeacher || isAdmin) && <Chip href="#enseignant">Enseignant</Chip>}
        {isAdmin && <Chip href="#admin" tone="admin">Administrateur</Chip>}
      </div>

      {/* ============================================================ */}
      <section className="mt-12 space-y-6">
        <SectionHeader
          id="general"
          eyebrow="Commun à tous les comptes"
          title="Prise en main"
          intro="Ces réglages et écrans existent pour tout le monde, quel que soit le rôle."
        />

        <Topic title="Se connecter et créer un compte" icon={<UsersIcon width={20} height={20} className="text-primary" />}>
          <p>
            Sur la page d'accueil, <strong>« S'inscrire »</strong> ouvre le formulaire de création
            de compte. Un menu <strong>« S'inscrire en tant que »</strong> propose Étudiant ou
            Enseignant — ce choix change un champ du formulaire (voir ci-dessous). Le reste est
            commun : nom, prénom, e-mail, mot de passe, et une <strong>photo d'identité
            obligatoire</strong> (format 4x4, comme pour une pièce officielle), quel que soit le rôle.
          </p>
          <ul>
            <li>
              Le <strong>matricule</strong> suit un format imposé : 2 chiffres (année d'inscription)
              + 3 lettres (code filière) + 3 chiffres (numéro séquentiel) — exemple :
              <code className="mx-1 rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs">26SWE001</code>.
              <strong> Obligatoire pour un étudiant</strong>, mais <strong>facultatif pour un
              enseignant</strong> (l'Universite ZTF n'en attribue pas systématiquement à son personnel
              enseignant) — s'il est quand même fourni, il doit respecter ce format.
            </li>
            <li>
              Le <strong>mot de passe</strong> doit contenir au moins 4 lettres, 3 chiffres et 1
              symbole (l'ordre n'a pas d'importance), sur 8 caractères minimum.
            </li>
          </ul>
          <p>
            Le compte créé passe automatiquement au statut <StatusBadge status="pending" /> — pour
            un étudiant comme pour un enseignant. Il peut déjà consulter le catalogue, mais pas
            encore télécharger ni déposer, en attendant qu'un <strong>administrateur</strong> le
            valide (jamais un enseignant, même déjà validé — voir plus bas). Un e-mail est
            automatiquement envoyé dès que le statut change (validation, rejet, désactivation,
            réactivation).
          </p>
          <p>
            La connexion se fait ensuite avec le mot de passe et, indifféremment, le
            <strong> matricule ou l'e-mail</strong> — utile pour un enseignant sans matricule, qui
            se connecte alors avec son e-mail.
          </p>
        </Topic>

        <Topic title="Changer de langue et de thème" icon={<GlobeIcon width={20} height={20} className="text-primary" />}>
          <p>
            L'icône <strong>globe</strong> (en haut du site, ou dans le menu latéral en tableau de
            bord) ouvre un menu déroulant pour basculer entre <strong>Français</strong> et
            <strong> English</strong> — tout le texte de l'interface change instantanément, sans
            recharger la page.
          </p>
          <p>
            Le bouton <strong>Clair / Sombre</strong> à côté fait de même pour l'apparence. Les
            deux choix sont mémorisés sur l'appareil et repris à chaque visite.
          </p>
          <Preview label="sélecteurs langue et thème">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-outline px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant">
                <GlobeIcon width={16} height={16} /> FR
              </span>
              <span className="inline-flex items-center gap-1.5 rounded border border-outline px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant">
                <SunIcon width={16} height={16} /> Clair
              </span>
            </div>
          </Preview>
        </Topic>

        <Topic title="Gérer son profil et son mot de passe" icon={<CameraIcon width={20} height={20} className="text-primary" />}>
          <p>
            Depuis <strong>« Profil »</strong> dans le menu : modifier nom/prénom/filière, ajouter
            un e-mail secondaire, changer la photo (par appareil photo ou galerie sur mobile), et
            mettre à jour le mot de passe (l'ancien mot de passe est demandé, avec la même règle
            de sécurité que pour l'inscription). Le matricule et l'e-mail principal ne sont, eux,
            jamais modifiables — ce sont les identifiants officiels du compte.
          </p>
        </Topic>

        <Topic title="Chercher et lire un document" icon={<SearchIcon width={20} height={20} className="text-primary" />}>
          <ol>
            <li>Ouvrir <strong>« Catalogue »</strong> dans le menu.</li>
            <li>Taper un mot du titre ou de l'auteur dans la barre de recherche.</li>
            <li>Affiner avec les menus <strong>Domaine</strong> puis <strong>Sous-domaine</strong>.</li>
            <li>Cliquer un résultat pour ouvrir sa fiche, puis <strong>« Lire en ligne »</strong> ou <strong>« Télécharger »</strong>.</li>
          </ol>
          <p>
            Le téléchargement range le document dans <strong>« Ma bibliothèque »</strong>, disponible
            hors connexion et synchronisé automatiquement entre tous les appareils du même compte —
            sur mobile et desktop, la lecture se fait dans un lecteur intégré (pas le PDF natif),
            justement pour que la lecture hors ligne fonctionne de façon identique partout.
          </p>
        </Topic>
      </section>

      {studentGuide}
      {teacherGuide}
      {adminGuide}

      {isAdmin && (
        <>
        <Topic title="Comptes en attente — valider ou rejeter" icon={<ShieldCheckIcon width={20} height={20} className="text-primary" />}>
          <p>
            Chaque nouvelle inscription apparaît ici jusqu'à décision. Deux boutons par ligne :
          </p>
          <ul>
            <li><strong>Valider</strong> (coche verte) — le compte passe en <StatusBadge status="validated" />, débloque téléchargement et dépôt.</li>
            <li><strong>Rejeter</strong> (croix) — <strong className="text-error">décision définitive et irréversible</strong> : le compte passe en <StatusBadge status="rejected" /> et ne pourra plus jamais être validé, même plus tard. À utiliser uniquement pour un compte manifestement invalide (faux matricule, doublon...).</li>
          </ul>
          <p>
            Un enseignant qui s'est inscrit lui-même passe aussi par cette liste, exactement comme
            un étudiant — son rôle « Enseignant » est déjà attribué, mais il ne peut pas déposer de
            support tant qu'il n'a pas été validé ici. La validation d'un compte reste une action
            réservée aux administrateurs.
          </p>
          <Preview label="ligne « Comptes en attente »">
            <div className="flex items-center justify-between rounded border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-on-surface">Awa Fotso <span className="ml-2 font-mono text-xs text-on-surface-variant">26SWE042</span></p>
                <p className="text-xs text-on-surface-variant">Étudiant · Génie Logiciel</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-outline text-success"><CheckIcon width={16} height={16} /></span>
                <span className="flex h-8 w-8 items-center justify-center rounded border border-outline text-error"><XIcon width={16} height={16} /></span>
              </div>
            </div>
          </Preview>
        </Topic>

        <Topic title="Utilisateurs — gérer tous les comptes" icon={<UsersIcon width={20} height={20} className="text-primary" />}>
          <p>
            Liste complète des comptes (tout statut confondu), avec recherche par nom/matricule et
            filtres par rôle/statut. Cliquer une ligne ouvre la fiche du compte, qui permet :
          </p>
          <ul>
            <li><strong>Changer de rôle</strong> — promouvoir un étudiant en enseignant, ou n'importe qui en administrateur.</li>
            <li><strong>Désactiver / réactiver</strong> — bloque immédiatement le compte (même déjà connecté), et est <strong>réversible</strong> — contrairement au rejet d'une inscription. Un administrateur ne peut pas désactiver son propre compte.</li>
          </ul>
        </Topic>

        <Topic title="Domaines — organiser le catalogue" icon={<ChartBarIcon width={20} height={20} className="text-primary" />}>
          <p>
            Le catalogue est classé sur deux niveaux : un <strong>domaine</strong> (ex. « Sciences
            de la Santé ») contient plusieurs <strong>sous-domaines</strong> (ex. « Médecine »,
            « Pharmacie »). C'est le sous-domaine qui est attribué à chaque document.
          </p>
          <ol>
            <li><strong>« + Nouveau domaine »</strong> en haut de page pour en créer un.</li>
            <li>Sur chaque domaine : icône crayon pour renommer, corbeille pour supprimer, « + Ajouter un sous-domaine » pour en créer un dessous.</li>
          </ol>
          <p>
            <strong>Règle importante :</strong> impossible de supprimer un domaine qui contient
            encore des sous-domaines, ni un sous-domaine qui contient encore des documents — il
            faut d'abord les déplacer ou les retirer. C'est une protection volontaire contre une
            suppression accidentelle qui laisserait des documents orphelins.
          </p>
          <Preview label="carte « Domaines »">
            <div className="rounded-lg border border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center justify-between border-b border-outline-variant px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                  <ChartBarIcon width={16} height={16} className="text-primary" /> Sciences de la Santé
                </span>
                <span className="flex items-center gap-3 text-on-surface-variant">
                  <PencilIcon width={14} height={14} /> <TrashIcon width={14} height={14} />
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-2 text-sm text-on-surface">
                Médecine <span className="text-xs text-on-surface-variant">14 documents</span>
              </div>
            </div>
          </Preview>
        </Topic>

        <Topic title="Demandes de suppression — approuver ou refuser" icon={<TrashIcon width={20} height={20} className="text-primary" />}>
          <p>
            Chaque demande envoyée par un enseignant (voir plus haut) apparaît ici avec le document
            concerné, l'enseignant, la date et sa justification écrite. Deux issues : approuver
            (le document est retiré définitivement du catalogue) ou refuser (le document reste en
            ligne, la demande est classée).
          </p>
        </Topic>

        <Topic title="Statistiques — activité de la plateforme" icon={<ChartBarIcon width={20} height={20} className="text-primary" />}>
          <p>
            Graphiques calculés en langage R sur les 90 derniers jours : téléchargements et lectures
            par jour, nouvelles inscriptions, utilisateurs actifs, qui est en ligne en ce moment,
            répartition des comptes par statut, et nombre de documents par domaine/sous-domaine.
          </p>
          <p>
            En haut de la page, <strong>« Voir les conclusions en langage clair »</strong> traduit
            tous ces chiffres en phrases simples, sans jargon technique ni graphique à interpréter —
            pratique pour un compte rendu rapide.
          </p>
        </Topic>

        <Topic title="Télécharger l'application — publier les installeurs" icon={<DownloadIcon width={20} height={20} className="text-primary" />}>
          <p>
            Cette page est visible par tous (pour télécharger l'app), mais seul un administrateur
            voit les contrôles de publication, pour Windows et Android séparément :
          </p>
          <ol>
            <li>Saisir le <strong>numéro de version</strong> (format X.Y.Z, ex. <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs">1.2.0</code>).</li>
            <li>Choisir le fichier (<code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs">.exe</code> pour Windows, <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-xs">.apk</code> pour Android).</li>
            <li>Cliquer <strong>« Publier »</strong>.</li>
          </ol>
          <p>
            Un nouvel envoi <strong>remplace</strong> l'installeur précédent (un seul fichier actif
            par plateforme, pas d'historique). Le bouton <strong>« Supprimer »</strong> (rouge,
            à côté du bouton de téléchargement) retire l'installeur publié, avec confirmation.
          </p>
          <p>
            Une fois publié, les appareils déjà installés détectent automatiquement la nouvelle
            version à leur prochain lancement et proposent la mise à jour — sans autre action de
            ta part.
          </p>
          <Preview label="carte plateforme (vue admin)">
            <div className="max-w-xs rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <MonitorIcon width={24} height={24} className="text-primary" />
              <p className="mt-2 text-sm font-semibold text-on-surface">Windows</p>
              <div className="mt-3 flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary">
                  <DownloadIcon width={14} height={14} /> Télécharger
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-error px-2.5 py-1.5 text-xs font-semibold text-error">
                  <TrashIcon width={14} height={14} /> Supprimer
                </span>
              </div>
              <p className="mt-1.5 text-xs text-on-surface-variant">Version 1.2.0</p>
            </div>
          </Preview>
        </Topic>
        </>
      )}
      <div className="mt-14 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Une question qui ne trouve pas de réponse ici ? L'assistant (bouton en bas à droite de
        l'écran) connaît aussi le fonctionnement de chaque page, adapté à ton rôle — ou écris à
        <strong className="text-on-surface"> biblio@iu-ztf.cm</strong>.
      </div>
    </DashboardLayout>
  )
}
