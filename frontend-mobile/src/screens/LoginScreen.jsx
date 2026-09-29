import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import Logo from '../components/Logo'
import { BRAND_TITLE } from '../config/brand'
import { useAuth } from '../context/AuthContext'
import { UserIcon, LockIcon } from '../components/icons'

// Portage de Login.jsx (web).
export default function LoginScreen() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigation = useNavigation()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (text) => setForm((f) => ({ ...f, [field]: text }))
  }

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    try {
      // Le changement de statut de compte fait automatiquement basculer
      // l'arbre de navigation racine (voir RootNavigator) vers l'écran
      // adapté (PendingAccount / AccessDenied / tableau de bord) — pas
      // besoin de naviguer manuellement ici.
      await login(form)
    } catch (err) {
      const isConnectionIssue = !globalThis.navigator?.onLine || !err.response || ['ERR_NETWORK', 'ECONNABORTED', 'ERR_INTERNET_DISCONNECTED'].includes(err.code)
      if (err.response?.status === 409) {
        setError(err.response.data.message || err.response.data.errors?.device_id?.[0] || 'Ce compte est déjà utilisé sur deux appareils. Déconnectez un appareil avant de continuer.')
      } else if (err.response?.status === 403) {
        setError(err.response.data.message || t('login.accessDenied'))
      } else if (isConnectionIssue) {
        const { DeviceEventEmitter } = require('react-native')
        DeviceEventEmitter.emit('network-status', { status: 'unstable' })
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
      <View className="items-center">
        <Logo size={96} />
        <Text className="mt-4 text-2xl font-bold text-on-surface dark:text-on-surface-night">{BRAND_TITLE}</Text>
        <Text className="mt-2 text-on-surface-variant dark:text-on-surface-variant-night text-center">
          {t('login.welcome')}
        </Text>
      </View>

      <View className="mt-7 gap-5">
        {/* `error && (...)` renverrait '' (nœud de texte invalide) tant que
            error === '' — JS renvoie l'opérande de gauche, pas `false`. */}
        {error ? (
          <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
            {error}
          </Text>
        ) : null}

        <TextField
          label={t('login.identifier')}
          placeholder={t('login.identifierPlaceholder')}
          icon={<UserIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />}
          value={form.identifier}
          onChangeText={update('identifier')}
        />

        <TextField
          label={t('login.password')}
          labelRight={
            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-sm text-primary dark:text-primary-night">{t('login.forgotPassword')}</Text>
            </Pressable>
          }
          icon={<LockIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />}
          type="password"
          value={form.password}
          onChangeText={update('password')}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className="rounded bg-primary dark:bg-primary-night py-3 disabled:opacity-60"
        >
          <Text className="text-center font-semibold text-on-primary dark:text-on-primary-night">
            {submitting ? t('login.loggingIn') : t('nav.login')}
          </Text>
        </Pressable>

        <View className="flex-row justify-center gap-1">
          <Text className="text-sm text-on-surface dark:text-on-surface-night">{t('login.noAccount')}</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text className="text-sm font-semibold text-primary dark:text-primary-night">{t('nav.register')}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => navigation.navigate('Home')} className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="text-sm font-semibold text-primary dark:text-primary-night">← {t('login.backToHome')}</Text>
      </Pressable>
    </AuthLayout>
  )
}
