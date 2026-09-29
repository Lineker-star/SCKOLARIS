import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GlobeIcon, ChevronDownIcon } from './icons'

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  function choose(code) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.chooseLanguage')}
        className="inline-flex items-center gap-1.5 rounded border border-outline px-2.5 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <GlobeIcon width={16} height={16} />
        <span>{current.flag}</span>
        <ChevronDownIcon width={14} height={14} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
          >
            {LANGUAGES.map(({ code, label, flag }) => (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={code === i18n.language}
                  onClick={() => choose(code)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                    code === i18n.language
                      ? 'bg-surface-container-high font-semibold text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="text-base leading-none">{flag}</span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
