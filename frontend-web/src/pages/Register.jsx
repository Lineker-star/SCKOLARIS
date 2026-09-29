import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import InfoCallout from '../components/InfoCallout'
import Logo from '../components/Logo'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { HourglassIcon, ArrowRightIcon, CameraIcon } from '../components/icons'

const initialForm = {
  role: 'student',
  first_name: '',
  last_name: '',
  email: '',
  registration_number: '',
  password: '',
  password_confirmation: '',
}

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(initialForm)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // 2 Mo, identique à la limite serveur (RegisterRequest, max:2048 Ko).
    if (file.size > 2 * 1024 * 1024) {
      setErrors((err) => ({ ...err, avatar: t('register.photoTooLarge') }))
      e.target.value = ''
      return
    }
    setErrors((err) => ({ ...err, avatar: undefined }))
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setFormError('')

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: t('register.passwordMismatch') })
      return
    }
    setSubmitting(true)
    try {
      await register({ ...form, avatar: avatarFile })
      navigate('/compte-en-attente')
    } catch (err) {
      const response = err.response
      const isConnectionIssue = !navigator.onLine || !response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(err.code)
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else if (isConnectionIssue) {
        window.dispatchEvent(new CustomEvent('network-status', { detail: { status: 'unstable' } }))
        setFormError('Connexion instable. Veuillez patienter quelques secondes, puis réessayez.')
      } else {
        setFormError(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Logo size={96} className="rounded-lg" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-primary text-center">{t('register.title')}</h1>
      <p className="mt-2 text-center text-on-surface-variant">{t('register.subtitle')}</p>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        {formError && (
          <p className="rounded bg-error-container text-on-error-container text-sm p-3">
            {formError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t('register.firstName')}
            required
            value={form.first_name}
            onChange={update('first_name')}
            error={errors.first_name}
          />
          <TextField
            label={t('register.lastName')}
            required
            value={form.last_name}
            onChange={update('last_name')}
            error={errors.last_name}
          />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">
            {t('register.registerAs')} <span className="text-error">*</span>
          </span>
          <select
            value={form.role}
            onChange={update('role')}
            className="w-full rounded border border-outline bg-surface-container-lowest px-3 py-2.5 text-on-surface focus:outline-none focus:border-2 focus:border-primary"
          >
            <option value="student">{t('roles.student')}</option>
            <option value="teacher">{t('roles.teacher')}</option>
          </select>
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-semibold text-on-surface">
            {t('register.photo')}
          </span>
          <div className="flex items-center gap-4">
            <Avatar user={{ ...form, avatar_url: avatarPreview }} size="lg" />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
              >
                <CameraIcon width={16} height={16} />
                {avatarFile ? t('register.changePhoto') : t('register.choosePhoto')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickPhoto}
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-on-surface-variant">{t('register.photoHint')}</p>
              {errors.avatar && <p className="mt-1 text-xs text-error">{errors.avatar}</p>}
            </div>
          </div>
        </div>

        <TextField
          label={t('register.primaryEmail')}
          type="email"
          placeholder="prenom.nom@exemple.com"
          required
          value={form.email}
          onChange={update('email')}
          error={errors.email}
        />
        <p className="text-xs text-on-surface-variant -mt-3">{t('register.emailHint')}</p>

        <TextField
          label={
            form.role === 'teacher'
              ? `${t('login.registrationNumber')} (${t('register.optional')})`
              : t('login.registrationNumber')
          }
          placeholder="Ex: 26SWE001"
          maxLength={8}
          required={form.role === 'student'}
          value={form.registration_number}
          onChange={update('registration_number')}
          error={errors.registration_number}
        />
        <p className="text-xs text-on-surface-variant -mt-3">
          {form.role === 'teacher' ? t('register.registrationNumberHintTeacher') : t('register.registrationNumberHint')}
        </p>

        <TextField
          label={t('login.password')}
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={update('password')}
          error={errors.password}
        />
        <p className="text-xs text-on-surface-variant -mt-3">{t('register.passwordHint')}</p>

        <TextField
          label={t('register.confirmPassword')}
          type="password"
          required
          value={form.password_confirmation}
          onChange={update('password_confirmation')}
          error={errors.password_confirmation}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
        >
          {submitting ? t('register.registering') : t('nav.register')}
          <ArrowRightIcon width={18} height={18} />
        </button>

        <p className="text-center text-sm">
          {t('register.alreadyRegistered')}{' '}
          <Link to="/connexion" className="font-semibold text-primary hover:underline">
            {t('nav.login')}
          </Link>
        </p>

        <InfoCallout icon={<HourglassIcon width={20} height={20} />}>
          {t('register.pendingNotice')}
        </InfoCallout>
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
