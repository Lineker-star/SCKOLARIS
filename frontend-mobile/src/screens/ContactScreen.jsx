import { useState } from 'react'
import { View, Text, ScrollView, Pressable, TextInput, Linking, Platform } from 'react-native'
import { KeyboardAvoidingView } from 'react-native'
import { WebView } from 'react-native-webview'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import TextField from '../components/TextField'
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, SendIcon, CheckIcon } from '../components/icons'
import { BRAND_NAME, CONTACT_EMAIL, CONTACT_PHONES } from '../config/brand'

const initialForm = { name: '', email: '', subject: '', message: '' }

// Portage de Contact.jsx (web), formulaire formsubmit.co inclus.
export default function ContactScreen() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const hours = [
    [t('contact.hoursTitle'), t('contact.hours.available')],
  ]

  function update(field) {
    return (text) => setForm((f) => ({ ...f, [field]: text }))
  }

  async function handleSubmit() {
    setStatus('sending')

    const payload = new FormData()
    payload.append('Nom_complet', form.name)
    payload.append('Adresse_email', form.email)
    payload.append('Sujet', form.subject)
    payload.append('Message', form.message)
    payload.append('Origine', `Formulaire de contact — ${BRAND_NAME} (mobile)`)
    payload.append('_subject', `${BRAND_NAME} — Nouveau message : ${form.subject}`)
    payload.append('_template', 'table')
    payload.append('_captcha', 'false')
    payload.append(
      '_autoresponse',
      `Bonjour,\n\nNous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nL'équipe ${BRAND_NAME}`,
    )
    payload.append('_honey', '')

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('sent')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  return (
    <AppShell title={t('nav.contact')}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="px-4 py-8 gap-5">
            <Text className="text-3xl font-bold text-primary dark:text-primary-night">{t('contact.title')}</Text>
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night leading-relaxed">
              {t('contact.intro')}
            </Text>

            <InfoBlock icon={<MapPinIcon width={20} height={20} />} title={t('contact.addressTitle')}>
              <Text className="text-on-surface-variant dark:text-on-surface-variant-night">
                {t('contact.addressLine1')}{'\n'}{t('contact.addressLine2')}{'\n'}{t('contact.location')}
              </Text>
            </InfoBlock>

            <InfoBlock icon={<PhoneIcon width={20} height={20} />} title={t('contact.assistanceTitle')}>
              {CONTACT_PHONES.map((phone) => (
                <Pressable key={phone} onPress={() => Linking.openURL(`tel:+237${phone.replaceAll(' ', '')}`)} className="flex-row items-center gap-2">
                  <PhoneIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                  <Text className="text-on-surface-variant dark:text-on-surface-variant-night">{phone}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
                className="flex-row items-center gap-2 mt-1"
              >
                <MailIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-on-surface-variant dark:text-on-surface-variant-night">{CONTACT_EMAIL}</Text>
              </Pressable>
            </InfoBlock>

            <InfoBlock icon={<ClockIcon width={20} height={20} />} title={t('contact.hoursTitle')}>
              {hours.map(([day, time]) => (
                <View key={day} className="flex-row items-center justify-between gap-3 py-1.5">
                  <Text className="flex-1 font-medium text-on-surface dark:text-on-surface-night">{day}</Text>
                  <Text className="shrink-0 text-right text-on-surface-variant dark:text-on-surface-variant-night">{time}</Text>
                </View>
              ))}
            </InfoBlock>

            <View className="rounded-lg overflow-hidden border border-outline-variant dark:border-outline-variant-night" style={{ height: 220 }}>
              {/* L'API Google Maps Embed refuse de s'afficher si elle n'est
                  pas dans un vrai <iframe> — charger l'URL directement dans
                  le WebView (comme une page normale) déclenche "The Google
                  Maps Embed API must be used in an iframe". On charge donc
                  une mini page HTML contenant l'iframe attendu. */}
              <WebView
                source={{
                  html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,iframe{margin:0;padding:0;width:100%;height:100%;border:0}</style></head><body><iframe src="https://www.google.com/maps?q=Bertoua,Cameroun&output=embed" loading="lazy"></iframe></body></html>',
                }}
              />
            </View>
          </View>

          <View className="px-4 pb-10">
            <View className="rounded-lg border border-outline dark:border-outline-night bg-surface-container-lowest dark:bg-surface-container-lowest-night overflow-hidden">
              <View className="bg-footer p-8 items-start">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-on-footer/10">
                  <SendIcon width={22} height={22} className="text-on-footer" />
                </View>
                <Text className="mt-5 text-2xl font-bold text-on-footer">{t('contact.formTitle')}</Text>
                <Text className="mt-3 text-sm text-on-footer-muted leading-relaxed">{t('contact.formIntro')}</Text>
              </View>

              <View className="p-6 gap-5">
                {status === 'sent' ? (
                  <View className="items-center gap-3 py-10">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-success-container dark:bg-success-container-night">
                      <CheckIcon width={24} height={24} className="text-success dark:text-success-night" />
                    </View>
                    <Text className="font-semibold text-on-surface dark:text-on-surface-night text-lg">
                      {t('contact.sentTitle')}
                    </Text>
                    <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night text-center">
                      {t('contact.sentText')}
                    </Text>
                    <Pressable onPress={() => setStatus('idle')}>
                      <Text className="text-sm font-semibold text-primary dark:text-primary-night">
                        {t('contact.sendAnother')}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <TextField label={t('contact.fields.name')} value={form.name} onChangeText={update('name')} />
                    <TextField
                      label={t('contact.fields.email')}
                      type="email"
                      value={form.email}
                      onChangeText={update('email')}
                    />
                    <TextField
                      label={t('contact.fields.subject')}
                      placeholder={t('contact.fields.subjectPlaceholder')}
                      value={form.subject}
                      onChangeText={update('subject')}
                    />

                    <View>
                      <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">
                        {t('contact.fields.message')}
                      </Text>
                      <TextInput
                        multiline
                        numberOfLines={5}
                        value={form.message}
                        onChangeText={update('message')}
                        placeholder={t('contact.fields.messagePlaceholder')}
                        placeholderTextColor="#8a90a0"
                        textAlignVertical="top"
                        className="w-full rounded border border-outline dark:border-outline-night px-3 py-2.5 text-on-surface dark:text-on-surface-night"
                        style={{ minHeight: 110 }}
                      />
                    </View>

                    {status === 'error' && (
                      <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
                        {t('contact.errorText', { email: CONTACT_EMAIL })}
                      </Text>
                    )}

                    <Pressable
                      onPress={handleSubmit}
                      disabled={status === 'sending'}
                      className="flex-row items-center justify-center gap-2 rounded bg-primary dark:bg-primary-night px-6 py-3 disabled:opacity-60"
                    >
                      <SendIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
                      <Text className="font-semibold text-on-primary dark:text-on-primary-night">
                        {status === 'sending' ? t('contact.sending') : t('contact.submit')}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  )
}

function InfoBlock({ icon, title, children }) {
  return (
    <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-5 flex-row gap-4">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-on-surface dark:text-on-surface-night">{title}</Text>
        <View className="mt-1">{children}</View>
      </View>
    </View>
  )
}
