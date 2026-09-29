import { Link } from 'react-router-dom'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'

export default function AuthLayout({ children }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="border-b border-outline-variant">
        <div className="max-w-(--container-max-width) mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="flex flex-col min-w-0">
              <span className="text-lg font-bold text-primary leading-tight">{BRAND_NAME}</span>
              <span className="text-[10px] text-on-surface-variant leading-tight whitespace-nowrap">{BRAND_TAGLINE}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </main>

      <footer className="text-center text-xs text-on-surface-variant pb-6">
        {t('authLayout.copyright')}
      </footer>
    </div>
  )
}
