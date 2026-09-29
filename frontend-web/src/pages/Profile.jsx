import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import TextField from '../components/TextField'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { updateProfile, updatePassword } from '../services/accounts'
import { getDomains } from '../services/domains'
import { UserIcon, LockIcon, ShieldCheckIcon, CameraIcon, CheckIcon } from '../components/icons'

export default function Profile() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef(null)
  const [domains, setDomains] = useState([])
  const [customDomainSelected, setCustomDomainSelected] = useState(!user.domain_id && Boolean(user.study_domain))
  const [customProgramSelected, setCustomProgramSelected] = useState(false)

  const [form, setForm] = useState({
    first_name: user.first_name ?? '',
    last_name: user.last_name ?? '',
    email: user.email ?? '',
    program: user.program ?? '',
    domain_id: user.domain_id ? String(user.domain_id) : '',
    study_domain: user.study_domain ?? '',
    secondary_email: user.secondary_email ?? '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url ?? null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  useEffect(() => {
    getDomains().then((response) => {
      const loadedDomains = response.data.domains ?? []
      setDomains(loadedDomains)
      const domain = loadedDomains.find((item) => String(item.id) === String(user.domain_id))
      setCustomProgramSelected(Boolean(user.program && !domain?.subdomains?.some((item) => item.name === user.program)))
    }).catch(() => {})
  }, [user.domain_id, user.program])

  const selectedDomain = domains.find((domain) => String(domain.id) === form.domain_id)
  const programNames = selectedDomain?.subdomains?.map((subdomain) => subdomain.name) ?? []
  const programIsListed = programNames.includes(form.program) && !customProgramSelected

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function pickAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    // 2 Mo, identique à la limite serveur (UpdateProfileRequest, max:2048 Ko).
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
    setSuccess(false)
    setSubmitting(true)
    try {
      await updateProfile({ ...form, avatar: avatarFile })
      await refreshUser()
      setAvatarFile(null)
      setSuccess(true)
    } catch (err) {
      const response = err.response
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else {
        setFormError(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordErrors({ confirm: t('register.passwordMismatch') })
      return
    }

    setPasswordSubmitting(true)
    try {
      await updatePassword({
        current_password: passwordForm.current,
        password: passwordForm.next,
        password_confirmation: passwordForm.confirm,
      })
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPasswordSuccess(true)
    } catch (err) {
      const response = err.response
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field === 'current_password' ? 'current' : field] = messages[0]
        }
        setPasswordErrors(fieldErrors)
      } else {
        setPasswordError(t('common.error'))
      }
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('profile.title')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('profile.intro')}</p>

      <div className="mt-8 grid lg:grid-cols-3 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-6 py-4">
            <div className="flex items-center gap-2 font-semibold text-on-surface">
              <UserIcon width={20} height={20} />
              {t('profile.personalInfo')}
            </div>
            {user.account_status && <StatusBadge status={user.account_status} />}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4">
              <Avatar user={{ ...user, avatar_url: avatarPreview }} size="lg" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  <CameraIcon width={16} height={16} />
                  {t('profile.changePhoto')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={pickAvatar}
                  className="hidden"
                />
                <p className="mt-1.5 text-xs text-on-surface-variant">{t('deposit.coverHint')}</p>
                {errors.avatar && <p className="mt-1 text-xs text-error">{errors.avatar}</p>}
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-5">
              <TextField
                label={t('register.lastName')}
                value={form.last_name}
                onChange={update('last_name')}
                error={errors.last_name}
              />
              <TextField
                label={t('register.firstName')}
                value={form.first_name}
                onChange={update('first_name')}
                error={errors.first_name}
              />
              <TextField label={t('login.registrationNumber')} value={user.registration_number ?? ''} readOnly />
              <TextField
                label={t('userDetail.primaryEmail')}
                type="email"
                required
                value={form.email}
                onChange={update('email')}
                error={errors.email}
              />
              <TextField
                label={t('userDetail.role')}
                icon={<ShieldCheckIcon width={16} height={16} />}
                value={roleLabels[user.role]}
                readOnly
              />
              <label className="block">
                <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('profile.studyDomain')}</span>
                <select
                  value={customDomainSelected ? 'other' : form.domain_id}
                  onChange={(event) => {
                    const value = event.target.value
                    const domain = domains.find((item) => String(item.id) === value)
                    setCustomDomainSelected(value === 'other')
                    setForm((current) => ({
                      ...current,
                      domain_id: domain ? String(domain.id) : '',
                      study_domain: domain?.name ?? '',
                      program: '',
                    }))
                  }}
                  className="w-full rounded border border-outline px-3 py-2.5 text-on-surface bg-surface"
                >
                  <option value="">{t('deposit.select')}</option>
                  {domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.name}</option>)}
                  <option value="other">{t('profile.other')}</option>
                </select>
                {customDomainSelected ? (
                  <TextField
                    className="mt-2"
                    placeholder={t('profile.otherDomainPlaceholder')}
                    value={form.study_domain}
                    onChange={update('study_domain')}
                    error={errors.study_domain}
                  />
                ) : null}
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.program')}</span>
                <select
                  value={programIsListed ? form.program : (form.program ? 'other' : '')}
                  onChange={(event) => {
                    const isOther = event.target.value === 'other'
                    setCustomProgramSelected(isOther)
                    setForm((current) => ({ ...current, program: isOther ? current.program : event.target.value }))
                  }}
                  disabled={!selectedDomain}
                  className="w-full rounded border border-outline px-3 py-2.5 text-on-surface bg-surface disabled:opacity-50"
                >
                  <option value="">{selectedDomain ? t('deposit.select') : t('profile.selectDomainFirst')}</option>
                  {selectedDomain?.subdomains?.map((subdomain) => <option key={subdomain.id} value={subdomain.name}>{subdomain.name}</option>)}
                  {selectedDomain ? <option value="other">{t('profile.other')}</option> : null}
                </select>
                {customProgramSelected ? (
                  <TextField className="mt-2" placeholder={t('profile.otherProgramPlaceholder')} value={form.program} onChange={update('program')} error={errors.program} />
                ) : null}
                {errors.program && <p className="mt-1 text-xs text-error">{errors.program}</p>}
              </label>
              <TextField
                label={t('userDetail.secondaryEmail')}
                type="email"
                placeholder={t('profile.optional')}
                value={form.secondary_email}
                onChange={update('secondary_email')}
                error={errors.secondary_email}
                className="sm:col-span-2"
              />
            </div>

            {formError && <p className="mt-4 text-sm text-error">{formError}</p>}
            {success && (
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
                <CheckIcon width={16} height={16} />
                {t('profile.profileUpdated')}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
            >
              {submitting ? t('editDeposit.saving') : t('profile.saveChanges')}
            </button>
            <p className="mt-3 text-xs text-on-surface-variant">{t('profile.readOnlyNotice')}</p>
          </div>
        </form>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
          <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-6 py-4 font-semibold text-on-surface">
            <LockIcon width={20} height={20} />
            {t('profile.security')}
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            {passwordError && (
              <p className="rounded bg-error-container text-on-error-container text-sm p-3">
                {passwordError}
              </p>
            )}
            {passwordSuccess && (
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <CheckIcon width={16} height={16} />
                {t('profile.passwordUpdated')}
              </p>
            )}
            <TextField
              label={t('profile.currentPassword')}
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
              error={passwordErrors.current}
            />
            <TextField
              label={t('resetPassword.newPassword')}
              type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
              error={passwordErrors.password}
            />
            <p className="text-xs text-on-surface-variant -mt-2">{t('register.passwordHint')}</p>
            <TextField
              label={t('register.confirmPassword')}
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
              error={passwordErrors.confirm}
            />
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full rounded bg-primary py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              {passwordSubmitting ? t('profile.updating') : t('profile.update')}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
