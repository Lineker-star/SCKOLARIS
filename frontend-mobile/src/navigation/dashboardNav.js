// Portage de navConfig.jsx (web) — même raison de passer `t` en paramètre :
// ces fonctions ne sont pas des composants, elles ne peuvent pas appeler
// useTranslation() elles-mêmes.
import { GridIcon, SearchIcon, BookOpenIcon, UploadCloudIcon, FolderIcon, UsersIcon, ShieldCheckIcon, TrashIcon, ChartBarIcon, DownloadIcon, HelpCircleIcon } from '../components/icons'

export function navForRole(role, t) {
  const downloadsLink = { screen: 'Downloads', label: t('nav.downloadApp'), icon: DownloadIcon }
  const guideLink = { screen: 'Guide', label: t('nav.guide'), icon: HelpCircleIcon }

  const studentNav = [
    { screen: 'Dashboard', label: t('nav.dashboard'), icon: GridIcon },
    { screen: 'Catalog', label: t('nav.catalog'), icon: SearchIcon },
    { screen: 'MyLibrary', label: t('nav.myLibrary'), icon: BookOpenIcon },
    downloadsLink,
    guideLink,
  ]

  const teacherNav = [
    { screen: 'Dashboard', label: t('nav.dashboard'), icon: GridIcon },
    { screen: 'Catalog', label: t('nav.catalog'), icon: SearchIcon },
    { screen: 'MyLibrary', label: t('nav.myLibrary'), icon: BookOpenIcon },
    { screen: 'DepositCourse', label: t('nav.depositCourse'), icon: UploadCloudIcon },
    { screen: 'MyDeposits', label: t('nav.myDeposits'), icon: FolderIcon },
    downloadsLink,
    guideLink,
  ]

  const adminNav = [
    { screen: 'Dashboard', label: t('nav.dashboard'), icon: GridIcon },
    { screen: 'Catalog', label: t('nav.catalog'), icon: SearchIcon },
    { screen: 'MyLibrary', label: t('nav.myLibrary'), icon: BookOpenIcon },
    { screen: 'DepositCourse', label: t('nav.depositCourse'), icon: UploadCloudIcon },
    { screen: 'MyDeposits', label: t('nav.myDeposits'), icon: FolderIcon },
    { screen: 'Domains', label: t('nav.domains'), icon: ChartBarIcon },
    { screen: 'Statistics', label: t('nav.statistics'), icon: ChartBarIcon },
    { screen: 'Users', label: t('nav.users'), icon: UsersIcon },
    { screen: 'PendingAccounts', label: t('nav.pendingAccounts'), icon: ShieldCheckIcon },
    { screen: 'PendingDeletionRequests', label: t('nav.deletionRequests'), icon: TrashIcon },
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
