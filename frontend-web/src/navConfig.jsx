import {
  GridIcon,
  SearchIcon,
  BookOpenIcon,
  UploadCloudIcon,
  FolderIcon,
  UsersIcon,
  ShieldCheckIcon,
  TrashIcon,
  ChartBarIcon,
  DownloadIcon,
  HelpCircleIcon,
  SparklesIcon,
} from './components/icons'

const icon = (Cmp) => <Cmp width={20} height={20} />

// `t` (de useTranslation, appelé depuis DashboardLayout) est passé en
// paramètre plutôt qu'utilisé via un hook ici : ces fonctions ne sont pas
// des composants React, elles ne peuvent pas appeler useTranslation() elles-mêmes.
export function navForRole(role, t) {
  const downloadsLink = { to: '/telecharger-l-application', label: t('nav.downloadApp'), icon: icon(DownloadIcon) }
  // Le guide n'est pas encore traduit (voir Guide.jsx) — libellé fixe en
  // attendant, comme le contenu de la page elle-même.
  const guideLink = { to: '/guide', label: "Guide d'utilisation", icon: icon(HelpCircleIcon) }

  const studentNav = [
    { to: '/tableau-de-bord', label: t('nav.dashboard'), icon: icon(GridIcon), end: true },
    { to: '/catalogue', label: t('nav.catalog'), icon: icon(SearchIcon) },
    { to: '/ma-bibliotheque', label: t('nav.myLibrary'), icon: icon(BookOpenIcon) },
    downloadsLink,
    guideLink,
  ]

  const teacherNav = [
    { to: '/tableau-de-bord', label: t('nav.dashboard'), icon: icon(GridIcon), end: true },
    { to: '/catalogue', label: t('nav.catalog'), icon: icon(SearchIcon) },
    { to: '/ma-bibliotheque', label: t('nav.myLibrary'), icon: icon(BookOpenIcon) },
    { to: '/deposer-un-support', label: t('nav.depositCourse'), icon: icon(UploadCloudIcon) },
    { to: '/mes-depots', label: t('nav.myDeposits'), icon: icon(FolderIcon) },
    downloadsLink,
    guideLink,
  ]

  const adminNav = [
    { to: '/tableau-de-bord', label: t('nav.dashboard'), icon: icon(GridIcon), end: true },
    { to: '/catalogue', label: t('nav.catalog'), icon: icon(SearchIcon) },
    { to: '/ma-bibliotheque', label: t('nav.myLibrary'), icon: icon(BookOpenIcon) },
    { to: '/deposer-un-support', label: t('nav.depositCourse'), icon: icon(UploadCloudIcon) },
    { to: '/mes-depots', label: t('nav.myDeposits'), icon: icon(FolderIcon) },
    { to: '/domaines', label: t('nav.domains'), icon: icon(ChartBarIcon) },
    { to: '/statistiques', label: t('nav.statistics'), icon: icon(ChartBarIcon) },
    { to: '/administration-ia', label: t('nav.aiAdmin'), icon: icon(SparklesIcon) },
    { to: '/utilisateurs', label: t('nav.users'), icon: icon(UsersIcon) },
    { to: '/comptes-en-attente', label: t('nav.pendingAccounts'), icon: icon(ShieldCheckIcon) },
    { to: '/demandes-de-suppression', label: t('nav.deletionRequests'), icon: icon(TrashIcon) },
    downloadsLink,
    guideLink,
  ]

  if (role === 'teacher') return teacherNav
  if (role === 'admin') return adminNav
  return studentNav
}

export function subtitleForRole(role, t) {
  if (role === 'teacher') return t('nav.teacherSpace')
  if (role === 'admin') return t('nav.adminConsole')
  return t('nav.studentSpace')
}
