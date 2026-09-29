import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import Logo from '../components/Logo'
import { forgotPassword } from '../services/accounts'
import { MailIcon, SendIcon, CheckIcon } from '../components/icons'

// Portage de ForgotPassword.jsx (web) — la réinitialisation elle-même
// (choix du nouveau mot de passe) se termine toujours dans un navigateur
// (le lien reçu par e-mail ouvre la page web, pas l'app), même une demande
// faite depuis le mobile : c'est le seul endroit où un clic dans un e-mail
// a du sens.
export default function ForgotPasswordScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [notice, setNotice] = useState('')

  async function handleSubmit() {
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
      <View className="items-center">
        <Logo size={72} />
        <Text className="mt-4 text-xl font-bold text-on-surface dark:text-on-surface-night">SCKOLARIS</Text>
      </View>

      {status === 'sent' ? (
        <View className="mt-7 items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-success-container dark:bg-success-container-night">
            <CheckIcon width={24} height={24} className="text-success dark:text-success-night" />
          </View>
          <Text className="font-semibold text-on-surface dark:text-on-surface-night text-center">{notice}</Text>
          <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night text-center">
            {t('forgotPassword.openInBrowser')}
          </Text>
        </View>
      ) : (
        <View className="mt-7 gap-5">
          <View>
            <Text className="font-semibold text-lg text-on-surface dark:text-on-surface-night">{t('forgotPassword.title')}</Text>
            <Text className="mt-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
              {t('forgotPassword.intro')}
            </Text>
          </View>

          {notice ? (
            <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
              {notice}
            </Text>
          ) : null}

          <TextField
            label={t('login.emailAddress')}
            type="email"
            placeholder="ex: jean.dupont@exemple.com"
            icon={<MailIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />}
            value={email}
            onChangeText={setEmail}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={status === 'sending'}
            className="flex-row items-center justify-center gap-2 rounded bg-primary dark:bg-primary-night py-3 disabled:opacity-60"
          >
            <Text className="font-semibold text-on-primary dark:text-on-primary-night">
              {status === 'sending' ? t('contact.sending') : t('forgotPassword.sendLink')}
            </Text>
            <SendIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
          </Pressable>
        </View>
      )}

      <Pressable onPress={() => navigation.navigate('Login')} className="mt-6 flex-row items-center justify-center gap-2">
        <Text className="text-sm font-semibold text-primary dark:text-primary-night">← {t('forgotPassword.backToLogin')}</Text>
      </Pressable>
    </AuthLayout>
  )
}
