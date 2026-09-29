import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import Logo from '../components/Logo'
import { BRAND_TITLE } from '../config/brand'
import { resetPassword } from '../services/accounts'
import { CheckIcon, LockIcon } from '../components/icons'

const REDIRECT_DELAY_MS = 2500

export default function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [status, setStatus] = useState('idle') // idle | submitting | done

  useEffect(() => {
    if (status === 'done') {
      const timer = setTimeout(() => navigate('/connexion'), REDIRECT_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setFormError('')

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: t('register.passwordMismatch') })
      return
    }

    setStatus('submitting')
    try {
      await resetPassword({ token, email, ...form })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      const response = err.response
      if (response?.status === 422 && response.data.errors) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors)) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
        setFormError(response.data.message ?? t('resetPassword.invalidLink'))
      } else {
        setFormError(t('resetPassword.genericError'))
      }
    }
  }

  const missingLink = !token || !email

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <Logo size={72} className="rounded-lg" />
        <h1 className="mt-4 text-xl font-bold text-on-surface">{BRAND_TITLE}</h1>
      </div>

      {missingLink ? (
        <div className="mt-7 space-y-4 text-center">
          <p className="rounded bg-error-container text-on-error-container text-sm p-3">
            {t('resetPassword.incompleteLink')}
          </p>
          <Link to="/mot-de-passe-oublie" className="text-sm font-semibold text-primary hover:underline">
            {t('resetPassword.requestNewLink')}
          </Link>
        </div>
      ) : status === 'done' ? (
        <div className="mt-7 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-container text-success">
            <CheckIcon width={24} height={24} />
          </span>
          <p className="font-semibold text-on-surface">{t('resetPassword.doneTitle')}</p>
          <p className="text-sm text-on-surface-variant">{t('resetPassword.doneText')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <h2 className="font-semibold text-lg text-on-surface">{t('resetPassword.title')}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t('resetPassword.chooseFor')} <strong>{email}</strong>.
            </p>
          </div>

          {formError && (
            <p className="rounded bg-error-container text-on-error-container text-sm p-3">{formError}</p>
          )}

          <div>
            <TextField
              label={t('resetPassword.newPassword')}
              type="password"
              icon={<LockIcon width={18} height={18} />}
              required
              minLength={8}
              value={form.password}
              onChange={update('password')}
              error={errors.password}
            />
            <p className="mt-1.5 text-xs text-on-surface-variant">{t('register.passwordHint')}</p>
          </div>

          <TextField
            label={t('register.confirmPassword')}
            type="password"
            icon={<LockIcon width={18} height={18} />}
            required
            value={form.password_confirmation}
            onChange={update('password_confirmation')}
            error={errors.password_confirmation}
          />

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full flex items-center justify-center gap-2 rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            {status === 'submitting' ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
