import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Linking } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { getAppReleases, uploadAppRelease, deleteAppRelease } from '../services/appReleases'
import { AlertTriangleIcon, DownloadIcon, MonitorIcon, SmartphoneIcon, TrashIcon, UploadCloudIcon } from '../components/icons'

// Portage de Downloads.jsx (web).
export default function DownloadsScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [releases, setReleases] = useState({})
  const [versionDrafts, setVersionDrafts] = useState({})
  const [files, setFiles] = useState({})
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null) // clé de plateforme, ou null
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const PLATFORMS = [
    { key: 'windows', label: t('downloads.windows'), hint: t('downloads.windowsHint'), icon: MonitorIcon, accept: '.exe' },
    { key: 'android', label: 'Android', hint: t('downloads.androidHint'), icon: SmartphoneIcon, accept: '.apk' },
  ]

  function load() {
    getAppReleases().then((res) => setReleases(res.data.releases))
  }

  useEffect(load, [])

  async function pickFile(platform, accept) {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
    if (result.canceled) return
    const asset = result.assets[0]
    if (!asset.name?.toLowerCase().endsWith(accept)) {
      setError(t('downloads.wrongFileType', { ext: accept }))
      return
    }
    setFiles((prev) => ({
      ...prev,
      [platform]: { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' },
    }))
    setError('')
  }

  async function handlePublish(platform) {
    const version = versionDrafts[platform]?.trim()
    const file = files[platform]
    if (!version) {
      setError(t('downloads.versionRequired'))
      return
    }
    if (!file) {
      setError(t('downloads.fileRequired'))
      return
    }
    setUploading(platform)
    setError('')
    try {
      await uploadAppRelease(platform, version, file)
      setFiles((prev) => ({ ...prev, [platform]: null }))
      setVersionDrafts((prev) => ({ ...prev, [platform]: '' }))
      load()
    } catch {
      setError(t('downloads.uploadFailed'))
    } finally {
      setUploading('')
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAppRelease(toDelete)
      setToDelete(null)
      load()
    } catch {
      setDeleteError(t('downloads.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  const platformLabel = PLATFORMS.find((p) => p.key === toDelete)?.label

  return (
    <AppShell title={t('nav.downloadApp')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">
            {t('nav.downloadApp')}
          </Text>
          <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('downloads.intro')}
          </Text>
        </View>

        <View className="gap-4">
          {PLATFORMS.map(({ key, label, hint, icon: Icon, accept }) => {
            const release = releases[key]
            const file = files[key]
            return (
              <View
                key={key}
                className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-5"
              >
                <Icon width={28} height={28} className="text-primary dark:text-primary-night" />
                <Text className="mt-3 font-semibold text-on-surface dark:text-on-surface-night">{label}</Text>
                <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{hint}</Text>

                {release ? (
                  <>
                    <View className="mt-4 flex-row flex-wrap items-center gap-2">
                      <Pressable
                        onPress={() => Linking.openURL(release.url)}
                        className="flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-4 py-2"
                      >
                        <DownloadIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
                        <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">
                          {t('common.download')}
                        </Text>
                      </Pressable>
                      {user.role === 'admin' ? (
                        <Pressable
                          onPress={() => {
                            setToDelete(key)
                            setDeleteError('')
                          }}
                          className="flex-row items-center gap-2 rounded border border-error dark:border-error-night px-3 py-2"
                        >
                          <TrashIcon width={16} height={16} className="text-error dark:text-error-night" />
                          <Text className="text-sm font-semibold text-error dark:text-error-night">{t('common.delete')}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                    {release.version ? (
                      <Text className="mt-1.5 text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                        {t('downloads.version')} {release.version}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  <Text className="mt-4 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                    {t('downloads.notAvailable')}
                  </Text>
                )}

                {user.role === 'admin' ? (
                  <View className="mt-4 gap-2">
                    <TextInput
                      value={versionDrafts[key] ?? ''}
                      onChangeText={(text) => setVersionDrafts((prev) => ({ ...prev, [key]: text }))}
                      editable={uploading !== key}
                      placeholder={t('downloads.versionPlaceholder')}
                      placeholderTextColor="#8a90a0"
                      className="rounded border border-outline dark:border-outline-night px-2.5 py-1.5 text-xs text-on-surface dark:text-on-surface-night"
                    />
                    <Pressable
                      onPress={() => pickFile(key, accept)}
                      disabled={uploading === key}
                      className="self-start rounded border border-outline dark:border-outline-night px-3 py-1.5 disabled:opacity-60"
                    >
                      <Text className="text-xs font-semibold text-on-surface dark:text-on-surface-night">
                        {file ? t('downloads.replaceFile') : t('downloads.chooseFile')}
                      </Text>
                    </Pressable>
                    {file ? (
                      <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                        {t('downloads.chosenFile')} {file.name}
                      </Text>
                    ) : null}
                    <Pressable
                      onPress={() => handlePublish(key)}
                      disabled={uploading === key || !file}
                      className="self-start flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-3 py-1.5 disabled:opacity-60"
                    >
                      <UploadCloudIcon width={14} height={14} className="text-on-primary dark:text-on-primary-night" />
                      <Text className="text-xs font-semibold text-on-primary dark:text-on-primary-night">
                        {uploading === key ? t('downloads.publishing') : t('downloads.publish')}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            )
          })}
        </View>

        {error ? <Text className="text-sm text-error dark:text-error-night">{error}</Text> : null}

        <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
          {t('downloads.iosNotice')}
        </Text>
      </ScrollView>

      {toDelete ? (
        <Modal
          title={t('downloads.deleteInstallerTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error dark:text-error-night" />}
          onClose={() => setToDelete(null)}
        >
          <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
            {t('downloads.deleteConfirmText', { platform: platformLabel })}
          </Text>
          {deleteError ? <Text className="mt-2 text-sm text-error dark:text-error-night">{deleteError}</Text> : null}
          <View className="flex-row justify-end gap-3 pt-4">
            <Pressable
              onPress={() => setToDelete(null)}
              className="rounded border border-outline dark:border-outline-night px-4 py-2"
            >
              <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmDelete}
              disabled={deleting}
              className="rounded bg-error dark:bg-error-night px-4 py-2 disabled:opacity-60"
            >
              <Text className="text-sm font-semibold text-on-error dark:text-on-error-night">
                {deleting ? t('downloads.deleting') : t('common.delete')}
              </Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
    </AppShell>
  )
}
