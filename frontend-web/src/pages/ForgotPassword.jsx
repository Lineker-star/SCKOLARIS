import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import { MailIcon, SendIcon } from '../components/icons'
import Logo from '../components/Logo'
import { BRAND_TITLE } from '../config/brand'
import { forgotPassword } from '../services/accounts'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [notice, setNotice] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    try {
      const { data } = await forgotPassword(email)
      setNotice(data.message)
      setStatus('sent')
    } catch {
      setNotice(t('forgotPassword.error'))
      setStatus('error')
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <Logo size={72} className="rounded-lg" />
        <h1 className="mt-4 text-xl font-bold text-on-surface">{BRAND_TITLE}</h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <h2 className="font-semibold text-lg text-on-surface">{t('forgotPassword.title')}</h2>
          <p className="mt-1 text-sm text-on-surface-variant">{t('forgotPassword.intro')}</p>
        </div>

        {notice && (
          <p
            className={`rounded text-sm p-3 ${
              status === 'error' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            {notice}
          </p>
        )}

        {status !== 'sent' && (
          <>
            <TextField
              label={t('login.emailAddress')}
              type="email"
              placeholder="ex: jean.dupont@exemple.com"
              icon={<MailIcon width={18} height={18} />}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full flex items-center justify-center gap-2 rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {status === 'sending' ? t('contact.sending') : t('forgotPassword.sendLink')}
              <SendIcon width={16} height={16} />
            </button>
          </>
        )}
      </form>

      <Link
        to="/connexion"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        ← {t('forgotPassword.backToLogin')}
      </Link>
    </AuthLayout>
  )
}
