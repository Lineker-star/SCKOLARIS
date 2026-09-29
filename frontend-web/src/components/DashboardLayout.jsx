import { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuth } from '../context/AuthContext'
import { navForRole, subtitleForRole } from '../navConfig'
import { syncLibrary } from '../services/librarySync'
import { getNotifications, markNotificationRead, deleteNotification } from '../services/notifications'
import { MenuIcon, XIcon, UserIcon, LogOutIcon, GlobeIcon, BellIcon, CameraIcon, TrashIcon } from './icons'

const linkClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-surface-container-high text-on-surface border-r-2 border-primary'
      : 'text-on-surface-variant hover:bg-surface-container'
  }`

function SidebarContent({ role, onNavigate }) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    onNavigate?.()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
        <Logo size={32} />
        <div>
          <p className="text-lg font-bold text-primary leading-none">SCKOLARIS</p>
          <p className="text-xs text-on-surface-variant mt-1">{subtitleForRole(role, t)}</p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
        {navForRole(role, t).map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClasses} onClick={onNavigate}>
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-outline-variant px-3 py-4">
        <div className="flex items-center gap-2 px-3 pb-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <GlobeIcon width={20} height={20} />
          {t('nav.viewSite')}
        </Link>
        <NavLink to="/profil" className={linkClasses} onClick={onNavigate}>
          <UserIcon width={20} height={20} />
          {t('nav.profile')}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <LogOutIcon width={20} height={20} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ role, children }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const profileIsComplete = Boolean(
    user?.first_name?.trim()
      && user?.last_name?.trim()
      && user?.avatar_url
      && (role === 'admin' || user?.program?.trim()),
  )

  // Une fois par session (par utilisateur connecté) : aligne la
  // bibliothèque hors-ligne de cet appareil sur celle du serveur, pour que
  // les documents téléchargés sur un autre appareil arrivent ici aussi.
  useEffect(() => {
    if (user?.id) syncLibrary(user.id)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const loadNotifications = () => {
      getNotifications().then((response) => setNotifications(response.data.notifications ?? [])).catch(() => {})
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 60 * 1000)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadNotifications()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [user?.id])

  async function readNotification(notification) {
    if (!notification.read_at) {
      await markNotificationRead(notification.id).catch(() => {})
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
    }
  }

  async function removeNotification(notification) {
    await deleteNotification(notification.id).catch(() => {})
    setNotifications((items) => items.filter((item) => item.id !== notification.id))
  }

  function handleMobileLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden lg:block w-72 shrink-0 border-r border-outline-variant bg-surface-container-lowest">
        <SidebarContent role={role} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-inverse-surface/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-surface-container-lowest shadow-lg">
            <button
              onClick={() => setOpen(false)}
              aria-label={t('nav.closeMenu')}
              className="absolute right-3 top-4 text-on-surface-variant"
            >
              <XIcon />
            </button>
            <SidebarContent role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden flex items-center gap-3 border-b border-outline-variant bg-surface-container-lowest px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            aria-label={t('nav.openMenu')}
            className="text-on-surface"
          >
            <MenuIcon />
          </button>
          <Logo size={26} />
          <span className="min-w-0 flex-1 truncate font-bold text-primary">SCKOLARIS</span>
          <button
            type="button"
            onClick={handleMobileLogout}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
            className="shrink-0 rounded p-2 text-on-surface-variant hover:bg-surface-container hover:text-error"
          >
            <LogOutIcon width={20} height={20} />
          </button>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {!profileIsComplete && (
            <div className="mb-6 overflow-hidden rounded border border-secondary/40 bg-secondary-container text-on-secondary-container">
              <Link to="/profil" className="flex min-h-11 items-center gap-3 px-4 text-sm font-semibold hover:brightness-95">
                <CameraIcon width={18} height={18} className="shrink-0" />
                <span className="dashboard-marquee whitespace-nowrap">
                  Votre profil est important pour SCKOLARIS. Vérifiez et complétez régulièrement vos informations personnelles afin de garder votre compte à jour et de faciliter votre identification dans la communauté de l'Universite. Cliquez ici pour ouvrir votre profil.
                </span>
              </Link>
            </div>
          )}

          {notifications.length > 0 && (
            <section className="mb-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
              <div className="flex items-center gap-2 text-lg font-semibold text-on-surface">
                <BellIcon width={19} height={19} className="text-primary" />
                Notifications
              </div>
              <div className="mt-3 space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-center gap-3 rounded border px-3 py-2 text-sm ${notification.read_at ? 'border-outline-variant text-on-surface-variant' : 'border-primary/40 bg-surface-container text-on-surface'}`}
                  >
                    <Link to={notification.data?.url ?? '#'} onClick={() => readNotification(notification)} className="min-w-0 flex-1 hover:underline">
                      <span className="font-semibold">
                        {notification.data?.kind === 'course_available' ? 'Nouveau support disponible' : 'Décision sur votre demande de suppression'}
                      </span>
                      {notification.data?.title && <span> — {notification.data.title}</span>}
                      <span className="ml-2 text-xs text-on-surface-variant">{new Date(notification.created_at).toLocaleDateString('fr-FR')}</span>
                    </Link>
                    <button type="button" onClick={() => removeNotification(notification)} aria-label="Supprimer la notification" className="shrink-0 text-on-surface-variant hover:text-error">
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {children}
        </main>
      </div>
    </div>
  )
}
