import { useEffect, useState } from 'react'
import { View, Text, Image, TextInput, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { createDocument } from '../services/documents'
import { getDomains } from '../services/domains'
import { UploadCloudIcon, InfoIcon, CameraIcon } from '../components/icons'

// Portage de DepositCourse.jsx (web). Le glisser-déposer web devient un
// sélecteur de fichier natif (expo-document-picker). Pas de <select> en
// React Native : le choix domaine/sous-domaine se fait via deux rangées de
// puces (même pattern que le choix de rôle dans UserDetailScreen.jsx).
export default function DepositCourseScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [domains, setDomains] = useState([])
  const [domainId, setDomainId] = useState(null)
  const [customProgramSelected, setCustomProgramSelected] = useState(false)
  const [form, setForm] = useState({ title: '', subdomain_id: '', program: '', summary: '' })
  const [file, setFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
  }, [])

  const selectedDomain = domains.find((d) => d.id === domainId)

  function update(field) {
    return (text) => setForm((f) => ({ ...f, [field]: text }))
  }

  async function pickFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ],
      copyToCacheDirectory: true,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    setFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' })
  }

  async function pickCover() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [3, 4],
    })
    if (result.canceled) return
    const asset = result.assets[0]
    setCoverFile({
      uri: asset.uri,
      name: asset.fileName ?? `cover.${asset.uri.split('.').pop()}`,
      type: asset.mimeType ?? 'image/jpeg',
    })
    setCoverPreview(asset.uri)
  }

  async function handleSubmit() {
    setErrors({})
    setFormError('')

    if (!file) {
      setErrors({ file: t('deposit.fileRequired') })
      return
    }

    setSubmitting(true)
    try {
      await createDocument({
        ...form,
        author: `${user.first_name} ${user.last_name}`,
        file,
        cover: coverFile,
      })
      navigation.navigate('MyDeposits')
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

  return (
    <AppShell title={t('deposit.shortTitle')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">
            {t('deposit.title')}
          </Text>
          <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('deposit.intro')}
          </Text>
        </View>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 gap-5">
          {formError ? (
            <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
              {formError}
            </Text>
          ) : null}

          <TextField
            label={t('deposit.titleLabel')}
            placeholder={t('deposit.titlePlaceholder')}
            value={form.title}
            onChangeText={update('title')}
            error={errors.title}
          />
          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-2">{t('deposit.domain')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {domains.map((domain) => (
                <Pressable
                  key={domain.id}
                  onPress={() => {
                    setDomainId(domain.id)
                    setCustomProgramSelected(false)
                    setForm((f) => ({ ...f, subdomain_id: '' }))
                  }}
                  className={`rounded-full px-4 py-1.5 ${
                    domainId === domain.id ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      domainId === domain.id
                        ? 'text-on-primary dark:text-on-primary-night'
                        : 'text-on-surface-variant dark:text-on-surface-variant-night'
                    }`}
                  >
                    {domain.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {selectedDomain ? (
            <View>
              <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-2">{t('deposit.subdomain')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {selectedDomain.subdomains.map((subdomain) => (
                  <Pressable
                    key={subdomain.id}
                    onPress={() => setForm((f) => ({ ...f, subdomain_id: subdomain.id }))}
                    className={`rounded-full px-4 py-1.5 ${
                      form.subdomain_id === subdomain.id ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        form.subdomain_id === subdomain.id
                          ? 'text-on-primary dark:text-on-primary-night'
                          : 'text-on-surface-variant dark:text-on-surface-variant-night'
                      }`}
                    >
                      {subdomain.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.subdomain_id ? <Text className="text-sm text-error dark:text-error-night mt-1">{errors.subdomain_id}</Text> : null}
            </View>
          ) : null}

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

          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">{t('deposit.coverImage')}</Text>
            <View className="flex-row items-center gap-4">
              {coverPreview ? <Image source={{ uri: coverPreview }} className="h-16 w-16 rounded-lg" /> : null}
              <Pressable
                onPress={pickCover}
                className="flex-row items-center gap-2 rounded border border-outline dark:border-outline-night px-3 py-2"
              >
                <CameraIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                  {coverPreview ? t('deposit.changeImage') : t('deposit.addImage')}
                </Text>
              </Pressable>
            </View>
            <Text className="mt-1.5 text-xs text-on-surface-variant dark:text-on-surface-variant-night">
              {t('deposit.coverHint')}
            </Text>
            {errors.cover ? <Text className="mt-1 text-xs text-error dark:text-error-night">{errors.cover}</Text> : null}
          </View>

          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">{t('deposit.summary')}</Text>
            <TextInput
              multiline
              numberOfLines={3}
              value={form.summary}
              onChangeText={update('summary')}
              placeholderTextColor="#8a90a0"
              textAlignVertical="top"
              className="w-full rounded border border-outline dark:border-outline-night px-3 py-2.5 text-on-surface dark:text-on-surface-night"
              style={{ minHeight: 80 }}
            />
          </View>

          <View className="flex-row gap-3 rounded-md bg-surface-container-high dark:bg-surface-container-high-night p-4">
            <InfoIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night mt-0.5" />
            <Text className="flex-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
              {t('deposit.indexNotice')}
            </Text>
          </View>

          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">
              {t('deposit.attachedFile')}
            </Text>
            <Pressable
              onPress={pickFile}
              className="items-center justify-center gap-3 rounded-lg border-2 border-dashed border-outline-variant dark:border-outline-variant-night p-8"
            >
              <UploadCloudIcon width={40} height={40} className="text-on-surface-variant dark:text-on-surface-variant-night" />
              {file ? (
                <Text className="font-semibold text-on-surface dark:text-on-surface-night">{file.name}</Text>
              ) : (
                <>
                  <Text className="font-semibold text-on-surface dark:text-on-surface-night">{t('deposit.noFileSelected')}</Text>
                  <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                    {t('deposit.acceptedFormats')}
                  </Text>
                </>
              )}
              <View className="mt-2 rounded border border-outline dark:border-outline-night px-4 py-2">
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                  {t('deposit.browseFiles')}
                </Text>
              </View>
            </Pressable>
            {errors.file ? <Text className="text-sm text-error dark:text-error-night mt-1">{errors.file}</Text> : null}
          </View>

          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={() => navigation.navigate('MyDeposits')}
              className="rounded border border-outline dark:border-outline-night px-4 py-2.5"
            >
              <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className="flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-4 py-2.5 disabled:opacity-60"
            >
              <UploadCloudIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
              <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">
                {submitting ? t('deposit.publishing') : t('deposit.publish')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  )
}
