import { useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import DocumentCard from '../components/DocumentCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { getMyUploads, deleteDocument } from '../services/documents'
import { requestDeletion } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { PlusIcon, PencilIcon, AlertTriangleIcon, InfoIcon } from '../components/icons'

// Portage de MyDeposits.jsx (web).
export default function MyDepositsScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigation = useNavigation()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState(null)
  const [justification, setJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    getMyUploads()
      .then((res) => setDocuments(res.data.documents))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function pendingDeletion(doc) {
    return doc.deletion_requests?.find((r) => r.status === 'pending')
  }

  async function handleConfirmDeletion() {
    setSubmitting(true)
    setError('')
    try {
      await requestDeletion(target.id, justification)
      setTarget(null)
      setJustification('')
      load()
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t('myDeposits.alreadyPending'))
      } else {
        setError(t('myDeposits.genericError'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await deleteDocument(toDelete.id)
      setToDelete(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell title={t('nav.myDeposits')}>
      <FlatList
        data={documents}
        keyExtractor={(doc) => String(doc.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View>
              <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.myDeposits')}</Text>
              <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
                {t('myDeposits.intro')}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('DepositCourse')}
              className="self-start flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-4 py-2.5"
            >
              <PlusIcon width={18} height={18} className="text-on-primary dark:text-on-primary-night" />
              <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">
                {t('myDeposits.newDeposit')}
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('myDeposits.empty')}
            </Text>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: doc }) => {
          const pending = pendingDeletion(doc)
          return (
            <DocumentCard
              title={doc.title}
              subject={doc.subdomain?.name}
              coverUrl={doc.cover_url}
              date={formatDate(doc.uploaded_at)}
              onPress={() => navigation.navigate('DocumentDetail', { id: doc.id })}
              actions={
                pending ? (
                  <StatusBadge status="pending" />
                ) : (
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      onPress={() => navigation.navigate('EditDeposit', { id: doc.id })}
                      className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-1.5"
                    >
                      <PencilIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                      <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.edit')}</Text>
                    </Pressable>
                    {user.role === 'admin' ? (
                      <Pressable onPress={() => setToDelete(doc)}>
                        <Text className="text-sm font-semibold text-error dark:text-error-night">
                          {t('common.delete')}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => setTarget(doc)}>
                        <Text className="text-sm font-semibold text-error dark:text-error-night">
                          {t('myDeposits.requestDeletion')}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )
              }
            />
          )
        }}
      />

      {target ? (
        <Modal
          title={t('myDeposits.requestDeletionTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error dark:text-error-night" />}
          onClose={() => setTarget(null)}
        >
          <View className="gap-4">
            <View className="flex-row gap-3 rounded-md bg-error-container dark:bg-error-container-night p-4">
              <InfoIcon width={20} height={20} className="text-on-error-container dark:text-on-error-container-night mt-0.5" />
              <Text className="flex-1 text-sm text-on-error-container dark:text-on-error-container-night">
                {t('myDeposits.requestDeletionNotice')}
              </Text>
            </View>

            {error ? <Text className="text-sm text-error dark:text-error-night">{error}</Text> : null}

            <View>
              <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night mb-1.5">
                {t('myDeposits.justificationLabel')}
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={justification}
                onChangeText={setJustification}
                placeholder={t('myDeposits.justificationPlaceholder')}
                placeholderTextColor="#8a90a0"
                textAlignVertical="top"
                className="w-full rounded border border-outline dark:border-outline-night px-3 py-2.5 text-on-surface dark:text-on-surface-night"
                style={{ minHeight: 90 }}
              />
            </View>

            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => setTarget(null)}
                className="rounded border border-outline dark:border-outline-night px-4 py-2"
              >
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDeletion}
                disabled={submitting}
                className="rounded bg-error dark:bg-error-night px-4 py-2 disabled:opacity-60"
              >
                <Text className="text-sm font-semibold text-on-error dark:text-on-error-night">
                  {t('myDeposits.confirmRequest')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      {toDelete ? (
        <Modal
          title={t('myDeposits.deleteDocumentTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error dark:text-error-night" />}
          onClose={() => setToDelete(null)}
        >
          <View className="gap-4">
            <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
              {t('myDeposits.deleteConfirmText', { title: toDelete.title })}
            </Text>
            <View className="flex-row justify-end gap-3">
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
                <Text className="text-sm font-semibold text-on-error dark:text-on-error-night">{t('common.delete')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </AppShell>
  )
}
