import { useEffect, useState } from 'react'
import { View, Text, Image, TextInput, Pressable, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import TextField from '../components/TextField'
import { getDocument } from '../services/catalog'
import { updateDocument } from '../services/documents'
import { getDomains } from '../services/domains'
import { UploadCloudIcon, CameraIcon } from '../components/icons'

// Portage de EditDeposit.jsx (web).
export default function EditDepositScreen() {
  const { t } = useTranslation()
  const { params } = useRoute()
  const { id } = params
  const navigation = useNavigation()
  const [domains, setDomains] = useState([])
  const [domainId, setDomainId] = useState(null)
  const [form, setForm] = useState(null)
  const [file, setFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
    getDocument(id).then((res) => {
      const doc = res.data.document
      setForm({ title: doc.title, subdomain_id: doc.subdomain_id ?? '', program: doc.program ?? '', summary: doc.summary ?? '' })
      if (doc.subdomain?.domain_id) setDomainId(doc.subdomain.domain_id)
      if (doc.cover_url) setCoverPreview(doc.cover_url)
    })
  }, [id])

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
    setSubmitting(true)
    try {
      await updateDocument(id, { ...form, ...(file ? { file } : {}), ...(coverFile ? { cover: coverFile } : {}) })
      navigation.navigate('MyDeposits')
    } catch (err) {
      const response = err.response
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else if (response?.status === 403) {
        setFormError(t('editDeposit.forbidden'))
      } else {
        setFormError(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return (
      <AppShell title={t('editDeposit.title')}>
        <Text className="p-4 text-on-surface-variant dark:text-on-surface-variant-night">{t('common.loading')}</Text>
      </AppShell>
    )
  }

  return (
    <AppShell title={t('editDeposit.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('editDeposit.title')}</Text>

        <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 gap-5">
          {formError ? (
            <Text className="rounded bg-error-container dark:bg-error-container-night text-on-error-container dark:text-on-error-container-night text-sm p-3">
              {formError}
            </Text>
          ) : null}

          <TextField label={t('deposit.titleLabel')} value={form.title} onChangeText={update('title')} error={errors.title} />

          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-2">{t('deposit.domain')}</Text>
            <View className="flex-row flex-wrap gap-2">
              {domains.map((domain) => (
                <Pressable
                  key={domain.id}
                  onPress={() => {
                    setDomainId(domain.id)
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

          <TextField label={t('deposit.program')} value={form.program} onChangeText={update('program')} error={errors.program} />

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
              textAlignVertical="top"
              className="w-full rounded border border-outline dark:border-outline-night px-3 py-2.5 text-on-surface dark:text-on-surface-night"
              style={{ minHeight: 80 }}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">
              {t('editDeposit.replaceFile')}
            </Text>
            <Pressable onPress={pickFile} className="self-start rounded border border-outline dark:border-outline-night px-4 py-2.5">
              <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                {file ? file.name : t('editDeposit.chooseFile')}
              </Text>
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
                {submitting ? t('editDeposit.saving') : t('common.save')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AppShell>
  )
}
