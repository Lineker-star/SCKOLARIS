import { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import DocumentCard from '../components/DocumentCard'
import { useAuth } from '../context/AuthContext'
import { listOfflineDocuments, removeOfflineDocument } from '../services/offlineStore'
import { removeFromLibrary } from '../services/library'
import { onLibrarySyncStart, onLibrarySyncEnd } from '../services/librarySync'
import { formatDate } from '../utils/format'
import { BookOpenIcon, TrashIcon, WifiOffIcon } from '../components/icons'

// Portage de MyLibrary.jsx (web). `useFocusEffect` recharge la liste à
// chaque retour sur l'écran (ex: après un téléchargement depuis la fiche
// document), pas seulement au premier montage.
export default function MyLibraryScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(() => {
    listOfflineDocuments(user.id)
      .then((docs) => {
        setDocuments([...docs].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)))
      })
      .catch((err) => {
        console.error('Échec de lecture de la bibliothèque hors ligne :', err)
        setDocuments([])
      })
      .finally(() => setLoading(false))
  }, [user.id])

  useFocusEffect(load)

  // Une synchro peut être en cours (déclenchée à la connexion, voir
  // AppShell) ou démarrer pendant que cet écran est ouvert — on recharge
  // la liste locale dès qu'elle se termine.
  useEffect(() => {
    const unsubStart = onLibrarySyncStart(() => setSyncing(true))
    const unsubEnd = onLibrarySyncEnd(() => {
      setSyncing(false)
      load()
    })
    return () => {
      unsubStart()
      unsubEnd()
    }
  }, [load])

  async function handleRemove(documentId) {
    await removeOfflineDocument(user.id, documentId)
    load()
    removeFromLibrary(documentId).catch(() => {})
  }

  return (
    <AppShell title={t('nav.myLibrary')}>
      <FlatList
        data={documents}
        keyExtractor={(doc) => doc.documentId}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.myLibrary')}</Text>
            <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
              {t('myLibrary.intro')}
            </Text>
            {syncing ? (
              <View className="mt-3 flex-row items-center gap-2">
                <ActivityIndicator size="small" />
                <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('myLibrary.syncing')}
                </Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: doc }) => (
          <DocumentCard
            title={doc.title}
            author={doc.author}
            subject={doc.subject}
            coverUrl={doc.localCoverUri}
            date={formatDate(doc.savedAt)}
            onPress={() => navigation.navigate('DocumentDetail', { id: doc.documentId })}
            actions={
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() =>
                    navigation.navigate('DocumentReader', { uri: doc.localUri, title: doc.title, documentId: doc.documentId })
                  }
                  className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-1.5"
                >
                  <BookOpenIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                  <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.read')}</Text>
                </Pressable>
                <Pressable onPress={() => handleRemove(doc.documentId)} accessibilityLabel={t('myLibrary.remove')}>
                  <TrashIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                </Pressable>
              </View>
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('myLibrary.empty')}
            </Text>
          ) : null
        }
        ListFooterComponent={
          documents.length > 0 ? (
            <View className="mt-2 flex-row items-center gap-2">
              <WifiOffIcon width={14} height={14} className="text-on-surface-variant dark:text-on-surface-variant-night" />
              <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                {t('myLibrary.offlineNotice')}
              </Text>
            </View>
          ) : null
        }
      />
    </AppShell>
  )
}
