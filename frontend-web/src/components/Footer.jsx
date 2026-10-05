import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { resetConsent } from '../services/analytics'
import { MapPinIcon, PhoneIcon, MailIcon } from './icons'
import { BRAND_NAME, BRAND_TAGLINE, BRAND_SUBTITLE, CONTACT_EMAIL, CONTACT_PHONES } from '../config/brand'

// Application installée (PWA) : pas de pied de page, comme une app native.
function isInstalledApp() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export default function Footer() {
  const { t } = useTranslation()
  const { user } = useAuth()

  if (isInstalledApp()) return null

  const baseLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/a-propos', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  const legalLinks = [
    { to: '/politique-de-confidentialite', label: t('footer.privacyPolicy') },
    { to: '/conditions-utilisation', label: t('footer.termsOfUse') },
    { to: '/mentions-legales', label: t('footer.legalNotice') },
  ]

  const quickLinks = user
    ? [...baseLinks, { to: '/tableau-de-bord', label: t('nav.dashboard') }]
    : [...baseLinks, { to: '/connexion', label: t('nav.login') }]

  return (
    <footer className="bg-footer text-on-footer">
      <div className="max-w-(--container-max-width) mx-auto px-4 py-8 md:px-8 md:py-9">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size={34} className="rounded-md" />
              <div>
                <p className="text-base font-bold leading-none">{BRAND_NAME}</p>
                <p className="text-xs text-on-footer-muted mt-1">{BRAND_TAGLINE}</p>
                <p className="text-xs text-on-footer-muted mt-1">{BRAND_SUBTITLE}</p>
              </div>
            </Link>
            <p className="mt-3 text-sm text-on-footer-muted leading-relaxed max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-footer/60">
              {t('footer.navigation')}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-on-footer-muted hover:text-on-footer transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-footer/60">
              {t('nav.contact')}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-on-footer-muted">
              <li className="flex items-start gap-2">
                <MapPinIcon width={15} height={15} className="shrink-0 mt-0.5" />
                {t('footer.location')}
              </li>
              <li>
                <a
                  href={`tel:+237${CONTACT_PHONES[0].replaceAll(' ', '')}`}
                  className="flex items-center gap-2 hover:text-on-footer transition-colors"
                >
                  <PhoneIcon width={15} height={15} /> {CONTACT_PHONES.join(' / ')}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2 hover:text-on-footer transition-colors"
                >
                  <MailIcon width={15} height={15} /> {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-footer/60">
              {t('footer.legal')}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-on-footer-muted hover:text-on-footer transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={resetConsent}
                  className="text-on-footer-muted hover:text-on-footer transition-colors"
                >
                  {t('footer.manageCookies')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-on-footer/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-2 text-xs text-on-footer-muted">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-2">
            <Logo size={16} className="rounded" />
            <span>Université</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
