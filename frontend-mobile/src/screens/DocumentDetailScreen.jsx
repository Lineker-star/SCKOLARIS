import { useEffect, useState } from 'react'
import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { getDocument } from '../services/catalog'
import { readDocumentToFile, downloadDocumentToFile, downloadCoverToFile } from '../services/documents'
import { removeFromLibrary } from '../services/library'
import { saveOfflineDocument, getOfflineDocument, removeOfflineDocument } from '../services/offlineStore'
import { formatDate } from '../utils/format'
import { BookOpenIcon, DownloadIcon, CalendarIcon, UserIcon, CheckIcon, TrashIcon, FileIcon } from '../components/icons'

// Portage de DocumentDetail.jsx (web).
export default function DocumentDetailScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { params } = useRoute()
  const { id } = params
  const { user } = useAuth()
  const [doc, setDoc] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(null)

  useEffect(() => {
    let cancelled = false

    getOfflineDocument(user.id, id)
      .then((offlineDoc) => {
        if (cancelled) return
        setOffline(offlineDoc)

        return getDocument(id)
          .then((res) => setDoc(res.data.document))
          .catch(() => {
            if (cancelled) return
            // Hors connexion (ou document supprimé côté serveur) : si une
            // copie a été téléchargée, on reconstruit la fiche à partir
            // d'elle plutôt que d'afficher "introuvable".
            if (offlineDoc) {
              setDoc({
                title: offlineDoc.title,
                author: offlineDoc.author,
                subdomain: offlineDoc.subject ? { name: offlineDoc.subject } : null,
                uploaded_at: offlineDoc.savedAt,
                cover_url: offlineDoc.localCoverUri ?? null,
              })
            } else {
              setNotFound(true)
            }
          })
      })
      .catch((err) => console.error('Échec de lecture du stockage hors ligne :', err))

    return () => {
      cancelled = true
    }
  }, [id, user.id])

  function filenameFor(document) {
    const ext = document?.file_path?.split('.').pop() || 'pdf'
    return `document-${id}.${ext}`
  }

  function coverFilenameFor(document) {
    const ext = document?.cover_path?.split('.').pop() || 'jpg'
    return `cover-${id}.${ext}`
  }

  async function handleRead() {
    setBusy('read')
    setError('')
    try {
      const uri = offline ? offline.localUri : await readDocumentToFile(id, filenameFor(doc))
      navigation.navigate('DocumentReader', { uri, title: doc?.title, documentId: id })
    } catch (err) {
      console.error('[handleRead] échec :', err)
      setError(t('documentDetail.readError'))
    } finally {
      setBusy('')
    }
  }

  async function handleDownload() {
    setBusy('download')
    setError('')
    try {
      const localUri = await downloadDocumentToFile(id, filenameFor(doc))
      const localCoverUri = await downloadCoverToFile(doc.cover_url, coverFilenameFor(doc))
      await saveOfflineDocument(user.id, {
        id,
        title: doc.title,
        author: doc.author,
        subject: doc.subdomain?.name,
        localUri,
        localCoverUri,
      })
      setOffline(await getOfflineDocument(user.id, id))
    } catch (err) {
      console.error('[handleDownload] échec :', err)
      if (err.response?.status === 403) {
        setError(t('documentDetail.downloadRequiresValidated'))
      } else {
        setError(t('documentDetail.downloadFailed'))
      }
    } finally {
      setBusy('')
    }
  }

  async function handleRemoveOffline() {
    await removeOfflineDocument(user.id, id)
    setOffline(null)
    // Propage le retrait au serveur — sinon la synchro d'un autre appareil
    // le re-téléchargerait ici au prochain lancement.
    removeFromLibrary(id).catch(() => {})
  }

  return (
    <AppShell title={t('documentDetail.title')}>
      <ScrollView>
        <View className="p-4">
        {notFound ? (
          <Text className="text-on-surface-variant dark:text-on-surface-variant-night">{t('documentDetail.notFound')}</Text>
        ) : null}

        {doc ? (
          <View>
            <View className="mb-4 items-center">
              {doc.cover_url ? (
                <Image
                  source={{ uri: doc.cover_url }}
                  className="w-40 rounded-lg border border-outline-variant dark:border-outline-variant-night"
                  style={{ aspectRatio: 3 / 4 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-40 items-center justify-center rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container dark:bg-surface-container-night"
                  style={{ aspectRatio: 3 / 4 }}
                >
                  <FileIcon width={36} height={36} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                </View>
              )}
            </View>
            {doc.subdomain ? (
              <View className="self-start rounded bg-surface-container-high dark:bg-surface-container-high-night px-2.5 py-1">
                <Text className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
                  {doc.subdomain.domain?.name ? `${doc.subdomain.domain.name} › ${doc.subdomain.name}` : doc.subdomain.name}
                </Text>
              </View>
            ) : null}
            <Text className="mt-3 text-2xl font-bold text-primary dark:text-primary-night">{doc.title}</Text>

            <View className="mt-2 flex-row flex-wrap items-center gap-x-4 gap-y-1">
              <View className="flex-row items-center gap-1.5">
                <UserIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">{doc.author}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <CalendarIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
                  {formatDate(doc.uploaded_at)}
                </Text>
              </View>
              {doc.program ? (
                <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
                  · {doc.program}
                </Text>
              ) : null}
            </View>

            {doc.summary ? (
              <Text className="mt-6 text-on-surface dark:text-on-surface-night leading-relaxed">{doc.summary}</Text>
            ) : null}

            {error ? <Text className="mt-4 text-sm text-error dark:text-error-night">{error}</Text> : null}

            {offline ? (
              <View className="mt-4 self-start flex-row items-center gap-2 rounded bg-success-container dark:bg-success-container-night px-3 py-2">
                <CheckIcon width={16} height={16} className="text-success dark:text-success-night" />
                <Text className="text-sm font-semibold text-success dark:text-success-night">
                  {t('documentDetail.availableOffline')}
                </Text>
              </View>
            ) : null}

            <View className="mt-6 flex-row flex-wrap gap-3">
              <Pressable
                onPress={handleRead}
                disabled={busy === 'read'}
                className="flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-5 py-2.5 disabled:opacity-60"
              >
                <BookOpenIcon width={18} height={18} className="text-on-primary dark:text-on-primary-night" />
                <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">
                  {busy === 'read' ? t('documentDetail.loading') : t('documentDetail.readOnline')}
                </Text>
              </Pressable>

              {!offline ? (
                <Pressable
                  onPress={handleDownload}
                  disabled={busy === 'download'}
                  className="flex-row items-center gap-2 rounded border border-outline dark:border-outline-night px-5 py-2.5 disabled:opacity-60"
                >
                  <DownloadIcon width={18} height={18} className="text-on-surface dark:text-on-surface-night" />
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                    {busy === 'download' ? t('documentDetail.downloading') : t('common.download')}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={handleRemoveOffline}
                  className="flex-row items-center gap-2 rounded border border-outline dark:border-outline-night px-5 py-2.5"
                >
                  <TrashIcon width={18} height={18} className="text-on-surface dark:text-on-surface-night" />
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                    {t('documentDetail.removeFromDownloads')}
                  </Text>
                </Pressable>
              )}
            </View>
            <Text className="mt-3 text-xs text-on-surface-variant dark:text-on-surface-variant-night">
              {t('documentDetail.syncNotice')}
            </Text>
          </View>
        ) : null}
        </View>
      </ScrollView>
    </AppShell>
  )
}
