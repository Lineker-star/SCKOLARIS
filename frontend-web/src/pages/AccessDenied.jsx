import { Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import InfoCallout from '../components/InfoCallout'
import { useAuth } from '../context/AuthContext'
import { XCircleIcon, InfoIcon } from '../components/icons'

export default function AccessDenied() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  if (user?.account_status === 'pending') return <Navigate to="/compte-en-attente" replace />
  if (user?.account_status === 'validated') return <Navigate to="/tableau-de-bord" replace />

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-error-container">
          <XCircleIcon width={32} height={32} className="text-error" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-on-surface">{t('login.accessDenied')}</h1>
        <p className="mt-3 text-on-surface-variant leading-relaxed">{t('accessDenied.text')}</p>

        <InfoCallout icon={<InfoIcon width={20} height={20} />}>{t('accessDenied.callout')}</InfoCallout>

        <Link
          to="/inscription"
          className="mt-6 w-full rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors"
        >
          {t('accessDenied.retry')}
        </Link>
        <button
          onClick={logout}
          className="mt-4 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
        >
          {t('nav.logout')}
        </button>
      </div>
    </AuthLayout>
  )
}
