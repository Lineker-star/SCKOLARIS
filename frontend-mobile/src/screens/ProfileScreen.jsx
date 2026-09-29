import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import TextField from '../components/TextField'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { updateProfile, updatePassword } from '../services/accounts'
import { getDomains } from '../services/domains'
import { pickPhotoFromCamera, pickPhotoFromLibrary, MAX_PHOTO_BYTES } from '../utils/pickPhoto'
import { UserIcon, LockIcon, ShieldCheckIcon, CameraIcon, ImageIcon, CheckIcon } from '../components/icons'

// Portage de Profile.jsx (web).
export default function ProfileScreen() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const { user, refreshUser } = useAuth()
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
    return (text) => setForm((f) => ({ ...f, [field]: text }))
  }

  async function handlePicked(asset) {
    if (!asset) return
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
      setErrors((e) => ({ ...e, avatar: t('register.photoTooLarge') }))
      return
    }
    setErrors((e) => ({ ...e, avatar: undefined }))
    setAvatarFile(asset)
    setAvatarPreview(asset.uri)
  }

  async function pickFromCamera() {
    handlePicked(await pickPhotoFromCamera())
  }

  async function pickFromLibrary() {
    handlePicked(await pickPhotoFromLibrary())
  }

  async function handleSubmit() {
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

  async function handlePasswordSubmit() {
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
    <AppShell title={t('profile.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('profile.title')}</Text>
          <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('profile.intro')}
          </Text>
        </View>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night overflow-hidden">
          <View className="flex-row items-center justify-between border-b border-outline-variant dark:border-outline-variant-night bg-surface-container-low dark:bg-surface-container-low-night px-6 py-4">
            <View className="flex-row items-center gap-2">
              <UserIcon width={20} height={20} className="text-on-surface dark:text-on-surface-night" />
              <Text className="font-semibold text-on-surface dark:text-on-surface-night">{t('profile.personalInfo')}</Text>
            </View>
            {user.account_status ? <StatusBadge status={user.account_status} /> : null}
          </View>

          <View className="p-6 gap-5">
            <View className="flex-row items-center gap-4">
              <Avatar user={{ ...user, avatar_url: avatarPreview }} size="lg" />
              <View className="flex-1">
                <View className="flex-row flex-wrap gap-2">
                  <Pressable
                    onPress={pickFromCamera}
                    className="flex-row items-center gap-2 rounded border border-outline dark:border-outline-night px-3 py-2"
                  >
                    <CameraIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                    <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                      {t('register.takePhoto')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={pickFromLibrary}
                    className="flex-row items-center gap-2 rounded border border-outline dark:border-outline-night px-3 py-2"
                  >
                    <ImageIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                    <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                      {t('register.chooseFromLibrary')}
                    </Text>
                  </Pressable>
                </View>
                <Text className="mt-1.5 text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('deposit.coverHint')}
                </Text>
                {errors.avatar ? <Text className="mt-1 text-xs text-error dark:text-error-night">{errors.avatar}</Text> : null}
              </View>
            </View>

            <TextField label={t('register.lastName')} value={form.last_name} onChangeText={update('last_name')} error={errors.last_name} />
            <TextField label={t('register.firstName')} value={form.first_name} onChangeText={update('first_name')} error={errors.first_name} />
            <TextField label={t('login.registrationNumber')} value={user.registration_number ?? ''} editable={false} />
            <TextField
              label={t('userDetail.primaryEmail')}
              type="email"
              value={form.email}
              onChangeText={update('email')}
              error={errors.email}
            />
            <TextField
              label={t('userDetail.role')}
              icon={<ShieldCheckIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />}
              value={roleLabels[user.role]}
              editable={false}
            />
            <View>
              <Text className="mb-2 text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('profile.studyDomain')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {domains.map((domain) => (
                  <Pressable
                    key={domain.id}
                    onPress={() => {
                      setCustomDomainSelected(false)
                      setForm((current) => ({ ...current, domain_id: String(domain.id), study_domain: domain.name, program: '' }))
                      setCustomProgramSelected(false)
                    }}
                    className={`rounded-full px-4 py-1.5 ${form.domain_id === String(domain.id) && !customDomainSelected ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'}`}
                  >
                    <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{domain.name}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {
                    setCustomDomainSelected(true)
                    setForm((current) => ({ ...current, domain_id: '', study_domain: '', program: '' }))
                    setCustomProgramSelected(true)
                  }}
                  className={`rounded-full px-4 py-1.5 ${customDomainSelected ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'}`}
                >
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('profile.other')}</Text>
                </Pressable>
              </View>
              {customDomainSelected ? (
                <TextField className="mt-2" placeholder={t('profile.otherDomainPlaceholder')} value={form.study_domain} onChangeText={update('study_domain')} error={errors.study_domain} />
              ) : null}
            </View>
            <View>
              <Text className="mb-2 text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('deposit.program')}</Text>
              {selectedDomain ? (
                <View className="flex-row flex-wrap gap-2">
                  {selectedDomain.subdomains.map((subdomain) => (
                    <Pressable key={subdomain.id} onPress={() => { setCustomProgramSelected(false); setForm((current) => ({ ...current, program: subdomain.name })) }} className={`rounded-full px-4 py-1.5 ${form.program === subdomain.name && !customProgramSelected ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'}`}>
                      <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{subdomain.name}</Text>
                    </Pressable>
                  ))}
                  <Pressable onPress={() => setCustomProgramSelected(true)} className={`rounded-full px-4 py-1.5 ${customProgramSelected ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'}`}>
                    <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('profile.other')}</Text>
                  </Pressable>
                </View>
              ) : null}
              {customProgramSelected ? <TextField className="mt-2" placeholder={t('profile.otherProgramPlaceholder')} value={form.program} onChangeText={update('program')} error={errors.program} /> : null}
              {errors.program ? <Text className="mt-1 text-xs text-error dark:text-error-night">{errors.program}</Text> : null}
            </View>
            <TextField
              label={t('userDetail.secondaryEmail')}
              type="email"
              placeholder={t('profile.optional')}
              value={form.secondary_email}
              onChangeText={update('secondary_email')}
              error={errors.secondary_email}
            />

            {formError ? <Text className="text-sm text-error dark:text-error-night">{formError}</Text> : null}
            {success ? (
              <View className="flex-row items-center gap-2">
                <CheckIcon width={16} height={16} className="text-success dark:text-success-night" />
                <Text className="text-sm font-semibold text-success dark:text-success-night">{t('profile.profileUpdated')}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="self-start rounded bg-primary dark:bg-primary-night px-5 py-2.5 disabled:opacity-60"
            >
              <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">
                {submitting ? t('editDeposit.saving') : t('profile.saveChanges')}
              </Text>
            </Pressable>
            <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
              {t('profile.readOnlyNotice')}
            </Text>
          </View>
        </View>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night overflow-hidden">
          <View className="flex-row items-center gap-2 border-b border-outline-variant dark:border-outline-variant-night bg-surface-container-low dark:bg-surface-container-low-night px-6 py-4">
            <LockIcon width={20} height={20} className="text-on-surface dark:text-on-surface-night" />
            <Text className="font-semibold text-on-surface dark:text-on-surface-night">{t('profile.security')}</Text>
          </View>

          <View className="p-6 gap-4">
            {passwordError ? (
              <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
                {passwordError}
              </Text>
            ) : null}
            {passwordSuccess ? (
              <View className="flex-row items-center gap-2">
                <CheckIcon width={16} height={16} className="text-success dark:text-success-night" />
                <Text className="text-sm font-semibold text-success dark:text-success-night">
                  {t('profile.passwordUpdated')}
                </Text>
              </View>
            ) : null}
            <TextField
              label={t('profile.currentPassword')}
              type="password"
              value={passwordForm.current}
              onChangeText={(text) => setPasswordForm((f) => ({ ...f, current: text }))}
              error={passwordErrors.current}
            />
            <TextField
              label={t('resetPassword.newPassword')}
              type="password"
              value={passwordForm.next}
              onChangeText={(text) => setPasswordForm((f) => ({ ...f, next: text }))}
              error={passwordErrors.password}
            />
            <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night -mt-2">
              {t('register.passwordHint')}
            </Text>
            <TextField
              label={t('register.confirmPassword')}
              type="password"
              value={passwordForm.confirm}
              onChangeText={(text) => setPasswordForm((f) => ({ ...f, confirm: text }))}
              error={passwordErrors.confirm}
            />
            <Pressable
              onPress={handlePasswordSubmit}
              disabled={passwordSubmitting}
              className="rounded bg-primary dark:bg-primary-night py-3 disabled:opacity-60"
            >
              <Text className="text-center font-semibold text-on-primary dark:text-on-primary-night">
                {passwordSubmitting ? t('profile.updating') : t('profile.update')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  )
}
