import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import InfoCallout from '../components/InfoCallout'
import Logo from '../components/Logo'
import Avatar from '../components/Avatar'
import { useAuth } from '../context/AuthContext'
import { pickPhotoFromCamera, pickPhotoFromLibrary, MAX_PHOTO_BYTES } from '../utils/pickPhoto'
import { HourglassIcon, ArrowRightIcon, CameraIcon, ImageIcon } from '../components/icons'

const initialForm = {
  role: 'student',
  first_name: '',
  last_name: '',
  email: '',
  registration_number: '',
  password: '',
  password_confirmation: '',
}

const ROLES = ['student', 'teacher']

// Portage de Register.jsx (web).
export default function RegisterScreen() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigation = useNavigation()
  const [form, setForm] = useState(initialForm)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: t('register.passwordMismatch') })
      return
    }
    setSubmitting(true)
    try {
      // Comme pour Login, RootNavigator réagit au changement de statut de
      // compte et affiche automatiquement l'écran "Compte en attente".
      await register({ ...form, avatar: avatarFile })
    } catch (err) {
      const response = err.response
      const isConnectionIssue = !globalThis.navigator?.onLine || !response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(err.code)
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else if (isConnectionIssue) {
        const { DeviceEventEmitter } = require('react-native')
        DeviceEventEmitter.emit('network-status', { status: 'unstable' })
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
      <View className="items-center">
        <Logo size={96} />
      </View>
      <Text className="mt-4 text-2xl font-bold text-primary dark:text-primary-night text-center">
        {t('register.title')}
      </Text>
      <Text className="mt-2 text-center text-on-surface-variant dark:text-on-surface-variant-night">
        {t('register.subtitle')}
      </Text>

      <View className="mt-7 gap-5">
        {formError ? (
          <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
            {formError}
          </Text>
        ) : null}

        <View className="flex-row gap-4">
          <TextField
            label={t('register.firstName')}
            className="flex-1"
            value={form.first_name}
            onChangeText={update('first_name')}
            error={errors.first_name}
          />
          <TextField
            label={t('register.lastName')}
            className="flex-1"
            value={form.last_name}
            onChangeText={update('last_name')}
            error={errors.last_name}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-on-surface dark:text-on-surface-night">
            {t('register.registerAs')} <Text className="text-error dark:text-error-night">*</Text>
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {ROLES.map((r) => (
              <Pressable
                key={r}
                onPress={() => setForm((f) => ({ ...f, role: r }))}
                className={`rounded-full px-4 py-1.5 ${
                  form.role === r ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    form.role === r
                      ? 'text-on-primary dark:text-on-primary-night'
                      : 'text-on-surface-variant dark:text-on-surface-variant-night'
                  }`}
                >
                  {t(`roles.${r}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-1.5 text-sm font-semibold text-on-surface dark:text-on-surface-night">
            {t('register.photo')}
          </Text>
          <View className="flex-row items-center gap-4">
            <Avatar user={{ ...form, avatar_url: avatarPreview }} size="lg" />
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
                {t('register.photoHint')}
              </Text>
              {errors.avatar ? <Text className="mt-1 text-xs text-error dark:text-error-night">{errors.avatar}</Text> : null}
            </View>
          </View>
        </View>

        <View>
          <TextField
            label={t('register.primaryEmail')}
            type="email"
            placeholder="prenom.nom@exemple.com"
            value={form.email}
            onChangeText={update('email')}
            error={errors.email}
          />
          <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-1.5">
            {t('register.emailHint')}
          </Text>
        </View>

        <View>
          <TextField
            label={
              form.role === 'teacher'
                ? `${t('login.registrationNumber')} (${t('register.optional')})`
                : t('login.registrationNumber')
            }
            placeholder="Ex: 26SWE001"
            maxLength={8}
            value={form.registration_number}
            onChangeText={update('registration_number')}
            error={errors.registration_number}
          />
          <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-1.5">
            {form.role === 'teacher' ? t('register.registrationNumberHintTeacher') : t('register.registrationNumberHint')}
          </Text>
        </View>

        <View>
          <TextField
            label={t('login.password')}
            type="password"
            value={form.password}
            onChangeText={update('password')}
            error={errors.password}
          />
          <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-1.5">
            {t('register.passwordHint')}
          </Text>
        </View>

        <TextField
          label={t('register.confirmPassword')}
          type="password"
          value={form.password_confirmation}
          onChangeText={update('password_confirmation')}
          error={errors.password_confirmation}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className="flex-row items-center justify-center gap-2 rounded bg-primary dark:bg-primary-night py-3 disabled:opacity-60"
        >
          <Text className="font-semibold text-on-primary dark:text-on-primary-night">
            {submitting ? t('register.registering') : t('nav.register')}
          </Text>
          <ArrowRightIcon width={18} height={18} className="text-on-primary dark:text-on-primary-night" />
        </Pressable>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-on-surface dark:text-on-surface-night">{t('register.alreadyRegistered')}</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text className="text-sm font-semibold text-primary dark:text-primary-night">{t('nav.login')}</Text>
          </Pressable>
        </View>

        <InfoCallout icon={<HourglassIcon width={20} height={20} />}>
          {t('register.pendingNotice')}
        </InfoCallout>
      </View>

      <Pressable onPress={() => navigation.navigate('Home')} className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="text-sm font-semibold text-primary dark:text-primary-night">← {t('login.backToHome')}</Text>
      </Pressable>
    </AuthLayout>
  )
}
