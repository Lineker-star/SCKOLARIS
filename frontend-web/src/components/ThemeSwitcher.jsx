import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { SunIcon, MoonIcon } from './icons'

export default function ThemeSwitcher({ className = '' }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
      className={`inline-flex items-center gap-1.5 rounded border border-outline px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors ${className}`}
    >
      {theme === 'dark' ? <SunIcon width={16} height={16} /> : <MoonIcon width={16} height={16} />}
      {theme === 'dark' ? t('common.light') : t('common.dark')}
    </button>
  )
}
