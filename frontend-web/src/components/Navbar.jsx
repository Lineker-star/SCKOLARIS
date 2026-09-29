import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuth } from '../context/AuthContext'
import { MenuIcon, XIcon } from './icons'

const navLinkClasses = ({ isActive }) =>
  `pb-1 border-b-2 transition-colors ${
    isActive
      ? 'border-secondary text-on-surface font-semibold'
      : 'border-transparent text-on-surface-variant hover:text-on-surface'
  }`

const mobileNavLinkClasses = ({ isActive }) =>
  `block py-2 text-base ${
    isActive ? 'font-semibold text-on-surface' : 'text-on-surface-variant'
  }`

export default function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="bg-surface border-b border-outline-variant relative">
      <div className="max-w-(--container-max-width) mx-auto flex items-center justify-between gap-6 px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <Logo size={32} />
          <span className="flex flex-col min-w-0">
            <span className="text-xl font-bold text-primary leading-tight">{BRAND_NAME}</span>
            <span className="text-[10px] text-on-surface-variant leading-tight whitespace-nowrap">{BRAND_TAGLINE}</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-base">
          <NavLink to="/" end className={navLinkClasses}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/a-propos" className={navLinkClasses}>
            {t('nav.about')}
          </NavLink>
          <NavLink to="/contact" className={navLinkClasses}>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <LanguageSwitcher />
          <ThemeSwitcher />
          {user ? (
            <Link
              to="/tableau-de-bord"
              className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container transition-colors"
            >
              {t('nav.backToDashboard')}
            </Link>
          ) : (
            <>
              <Link
                to="/inscription"
                className="inline-flex items-center rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                {t('nav.register')}
              </Link>
              <Link
                to="/connexion"
                className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container transition-colors"
              >
                {t('nav.login')}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded text-on-surface"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={open}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-outline-variant bg-surface px-4 py-4">
          <nav className="flex flex-col gap-1">
            <NavLink to="/" end className={mobileNavLinkClasses} onClick={() => setOpen(false)}>
              {t('nav.home')}
            </NavLink>
            <NavLink to="/a-propos" className={mobileNavLinkClasses} onClick={() => setOpen(false)}>
              {t('nav.about')}
            </NavLink>
            <NavLink to="/contact" className={mobileNavLinkClasses} onClick={() => setOpen(false)}>
              {t('nav.contact')}
            </NavLink>
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            {user ? (
              <Link
                to="/tableau-de-bord"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
              >
                {t('nav.backToDashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/inscription"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface"
                >
                  {t('nav.register')}
                </Link>
                <Link
                  to="/connexion"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary"
                >
                  {t('nav.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
