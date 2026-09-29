import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { getDeletionRequests, processDeletionRequest } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { ArrowLeftIcon, XIcon, CheckIcon, InfoIcon } from '../components/icons'

// Portage de DeletionRequestDetail.jsx (web).
export default function DeletionRequestDetailScreen() {
  const { t } = useTranslation()
  const { params } = useRoute()
  const { id } = params
  const navigation = useNavigation()
  const [request, setRequest] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDeletionRequests().then((res) => {
      const found = res.data.deletion_requests.find((r) => String(r.id) === String(id))
      if (found) setRequest(found)
      else setNotFound(true)
    })
  }, [id])

  async function decide(decision) {
    setSubmitting(true)
    setError('')
    try {
      await processDeletionRequest(id, decision)
      navigation.navigate('PendingDeletionRequests')
    } catch {
      setError(t('deletionRequestDetail.genericError'))
      setSubmitting(false)
    }
  }

  return (
    <AppShell title={t('deletionRequestDetail.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Pressable onPress={() => navigation.navigate('PendingDeletionRequests')} className="flex-row items-center gap-2 self-start">
          <ArrowLeftIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
          <Text className="text-sm font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
            {t('deletionRequestDetail.backToList')}
          </Text>
        </Pressable>

        <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('deletionRequestDetail.title')}</Text>

        {notFound ? (
          <Text className="text-on-surface-variant dark:text-on-surface-variant-night">{t('deletionRequestDetail.notFound')}</Text>
        ) : null}

        {request ? (
          <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 gap-5">
            <View className="gap-4">
              <Field label={t('deletionRequestDetail.documentTitle')} value={request.document?.title} strong />
              <Field label={t('deletionRequestDetail.originalAuthor')} value={request.document?.author} />
              <Field
                label={t('deletionRequestDetail.depositedBy')}
                value={`${request.document?.depositor?.first_name ?? ''} ${request.document?.depositor?.last_name ?? ''}`}
              />
              <Field label={t('deletionRequestDetail.subjectCourse')} value={request.document?.subdomain?.name} />
              <Field label={t('deletionRequestDetail.requestDate')} value={formatDate(request.requested_at)} />
              <View>
                <Text className="text-xs font-semibold uppercase text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('deletionRequestDetail.status')}
                </Text>
                <View className="mt-1">
                  <StatusBadge status={request.status} />
                </View>
              </View>
            </View>

            <View className="pt-5 border-t border-outline-variant dark:border-outline-variant-night gap-2">
              <View className="flex-row items-center gap-2">
                <InfoIcon width={18} height={18} className="text-on-surface dark:text-on-surface-night" />
                <Text className="font-semibold text-on-surface dark:text-on-surface-night">{t('deletionRequestDetail.reason')}</Text>
              </View>
              <Text className="rounded-md border border-outline-variant dark:border-outline-variant-night p-4 text-on-surface-variant dark:text-on-surface-variant-night">
                {request.justification}
              </Text>
            </View>

            {error ? <Text className="text-sm text-error dark:text-error-night">{error}</Text> : null}

            <View className="flex-row flex-wrap justify-end gap-3 pt-5 border-t border-outline-variant dark:border-outline-variant-night">
              <Pressable
                disabled={submitting}
                onPress={() => decide('rejected')}
                className="flex-row items-center gap-2 rounded border border-error dark:border-error-night px-4 py-2.5 disabled:opacity-60"
              >
                <XIcon width={16} height={16} className="text-error dark:text-error-night" />
                <Text className="text-sm font-semibold text-error dark:text-error-night">{t('deletionRequestDetail.rejectRequest')}</Text>
              </Pressable>
              <Pressable
                disabled={submitting}
                onPress={() => decide('approved')}
                className="flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-4 py-2.5 disabled:opacity-60"
              >
                <CheckIcon width={16} height={16} className="text-on-primary dark:text-on-primary-night" />
                <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">{t('deletionRequestDetail.approveRequest')}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  )
}

function Field({ label, value, strong }) {
  return (
    <View>
      <Text className="text-xs font-semibold uppercase text-on-surface-variant dark:text-on-surface-variant-night">
        {label}
      </Text>
      <Text className={strong ? 'mt-1 text-lg font-semibold text-on-surface dark:text-on-surface-night' : 'mt-1 text-on-surface dark:text-on-surface-night'}>
        {value || '—'}
      </Text>
    </View>
  )
}
