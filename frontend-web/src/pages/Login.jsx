import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import { BRAND_NAME, BRAND_SUBTITLE } from '../config/brand'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { UserIcon, LockIcon } from '../components/icons'
import Logo from '../components/Logo'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form)
      if (user.account_status === 'pending') {
        navigate('/compte-en-attente')
      } else if (user.account_status === 'rejected') {
        navigate('/acces-refuse')
      } else {
        navigate('/tableau-de-bord')
      }
    } catch (err) {
      const isConnectionIssue = !navigator.onLine || !err.response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(err.code)
      if (err.response?.status === 409) {
        setError(err.response.data.message || err.response.data.errors?.device_id?.[0] || 'Ce compte est déjà utilisé sur deux appareils. Déconnectez un appareil avant de continuer.')
      } else if (err.response?.status === 403) {
        setError(err.response.data.message || t('login.accessDenied'))
      } else if (isConnectionIssue) {
        window.dispatchEvent(new CustomEvent('network-status', { detail: { status: 'unstable' } }))
        setError('Connexion instable. Veuillez patienter quelques secondes, puis réessayez.')
      } else {
        setError(t('login.invalidCredentials'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <Logo size={96} className="rounded-lg" />
        <h1 className="mt-4 text-2xl font-bold text-on-surface">{BRAND_NAME}</h1>
        <p className="text-sm text-on-surface-variant">{BRAND_SUBTITLE}</p>
        <p className="mt-2 text-on-surface-variant">{t('login.welcome')}</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {error && (
          <p className="rounded bg-error-container text-on-error-container text-sm p-3">{error}</p>
        )}

        <TextField
          label={t('login.identifier')}
          placeholder={t('login.identifierPlaceholder')}
          icon={<UserIcon width={18} height={18} />}
          required
          value={form.identifier}
          onChange={update('identifier')}
        />

        <TextField
          label={t('login.password')}
          labelRight={
            <Link to="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">
              {t('login.forgotPassword')}
            </Link>
          }
          icon={<LockIcon width={18} height={18} />}
          type="password"
          required
          value={form.password}
          onChange={update('password')}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          {submitting ? t('login.loggingIn') : t('nav.login')}
        </button>

        <p className="text-center text-sm">
          {t('login.noAccount')}{' '}
          <Link to="/inscription" className="font-semibold text-primary hover:underline">
            {t('nav.register')}
          </Link>
        </p>
      </form>

      <Link
        to="/"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        ← {t('login.backToHome')}
      </Link>
    </AuthLayout>
  )
}
