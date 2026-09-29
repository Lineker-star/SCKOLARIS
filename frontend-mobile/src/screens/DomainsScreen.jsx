import { useEffect, useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import Modal from '../components/Modal'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import {
  getDomains,
  createDomain,
  updateDomain,
  deleteDomain,
  createSubdomain,
  updateSubdomain,
  deleteSubdomain,
} from '../services/domains'
import { PlusIcon, PencilIcon, TrashIcon, AlertTriangleIcon, ChartBarIcon } from '../components/icons'

// Portage de Domains.jsx (web).
export default function DomainsScreen() {
  const { t } = useTranslation()
  useAuth()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState(null)
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    getDomains()
      .then((res) => setDomains(res.data.domains))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreateDomain() {
    setName('')
    setFormError('')
    setFormTarget({ kind: 'domain', mode: 'create' })
  }

  function openEditDomain(domain) {
    setName(domain.name)
    setFormError('')
    setFormTarget({ kind: 'domain', mode: 'edit', id: domain.id })
  }

  function openCreateSubdomain(domain) {
    setName('')
    setFormError('')
    setFormTarget({ kind: 'subdomain', mode: 'create', domainId: domain.id })
  }

  function openEditSubdomain(subdomain) {
    setName(subdomain.name)
    setFormError('')
    setFormTarget({ kind: 'subdomain', mode: 'edit', id: subdomain.id })
  }

  async function handleFormSubmit() {
    setSubmitting(true)
    setFormError('')
    try {
      if (formTarget.kind === 'domain') {
        if (formTarget.mode === 'create') await createDomain(name)
        else await updateDomain(formTarget.id, name)
      } else {
        if (formTarget.mode === 'create') await createSubdomain(formTarget.domainId, name)
        else await updateSubdomain(formTarget.id, { name })
      }
      setFormTarget(null)
      load()
    } catch (err) {
      if (err.response?.status === 422) {
        setFormError(Object.values(err.response.data.errors ?? {})[0]?.[0] ?? t('common.error'))
      } else {
        setFormError(t('myDeposits.genericError'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      if (toDelete.kind === 'domain') await deleteDomain(toDelete.id)
      else await deleteSubdomain(toDelete.id)
      setToDelete(null)
      load()
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteError(err.response.data.message)
      } else {
        setDeleteError(t('myDeposits.genericError'))
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell title={t('nav.domains')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.domains')}</Text>
            <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
              {t('domains.intro')}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={openCreateDomain}
          className="self-start flex-row items-center gap-2 rounded bg-primary dark:bg-primary-night px-4 py-2.5"
        >
          <PlusIcon width={18} height={18} className="text-on-primary dark:text-on-primary-night" />
          <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">{t('domains.newDomain')}</Text>
        </Pressable>

        {!loading && domains.length === 0 && (
          <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
            {t('domains.empty')}
          </Text>
        )}

        {domains.map((domain) => (
          <View
            key={domain.id}
            className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night overflow-hidden"
          >
            <View className="flex-row items-center justify-between gap-3 border-b border-outline-variant dark:border-outline-variant-night px-4 py-3">
              <View className="flex-row items-center gap-2 flex-1">
                <ChartBarIcon width={18} height={18} className="text-primary dark:text-primary-night" />
                <Text className="font-semibold text-on-surface dark:text-on-surface-night">{domain.name}</Text>
              </View>
              <View className="flex-row items-center gap-4">
                <Pressable onPress={() => openEditDomain(domain)} accessibilityLabel={t('domains.editAria', { name: domain.name })}>
                  <PencilIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                </Pressable>
                <Pressable
                  onPress={() => setToDelete({ kind: 'domain', id: domain.id, label: domain.name })}
                  accessibilityLabel={t('domains.deleteAria', { name: domain.name })}
                >
                  <TrashIcon width={16} height={16} className="text-error dark:text-error-night" />
                </Pressable>
              </View>
            </View>

            {domain.subdomains.length === 0 && (
              <Text className="px-4 py-3 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {t('domains.noSubdomains')}
              </Text>
            )}
            {domain.subdomains.map((subdomain) => (
              <View
                key={subdomain.id}
                className="flex-row items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant dark:border-outline-variant-night"
              >
                <Text className="flex-1 text-sm text-on-surface dark:text-on-surface-night">
                  {subdomain.name}{' '}
                  <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night">
                    ({subdomain.documents_count})
                  </Text>
                </Text>
                <View className="flex-row items-center gap-4">
                  <Pressable onPress={() => openEditSubdomain(subdomain)} accessibilityLabel={t('domains.editAria', { name: subdomain.name })}>
                    <PencilIcon width={14} height={14} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                  </Pressable>
                  <Pressable
                    onPress={() => setToDelete({ kind: 'subdomain', id: subdomain.id, label: subdomain.name })}
                    accessibilityLabel={t('domains.deleteAria', { name: subdomain.name })}
                  >
                    <TrashIcon width={14} height={14} className="text-error dark:text-error-night" />
                  </Pressable>
                </View>
              </View>
            ))}

            <Pressable onPress={() => openCreateSubdomain(domain)} className="px-4 py-3">
              <View className="flex-row items-center gap-1.5">
                <PlusIcon width={14} height={14} className="text-primary dark:text-primary-night" />
                <Text className="text-sm font-semibold text-primary dark:text-primary-night">
                  {t('domains.addSubdomain')}
                </Text>
              </View>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {formTarget ? (
        <Modal
          title={
            formTarget.kind === 'domain'
              ? formTarget.mode === 'create'
                ? t('domains.newDomain')
                : t('domains.editDomain')
              : formTarget.mode === 'create'
                ? t('domains.newSubdomain')
                : t('domains.editSubdomain')
          }
          icon={<ChartBarIcon width={22} height={22} className="text-primary dark:text-primary-night" />}
          onClose={() => setFormTarget(null)}
        >
          <View className="gap-4">
            {formError ? <Text className="text-sm text-error dark:text-error-night">{formError}</Text> : null}
            <TextField label={t('domains.name')} value={name} onChangeText={setName} autoFocus />
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={() => setFormTarget(null)}
                className="rounded border border-outline dark:border-outline-night px-4 py-2"
              >
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleFormSubmit}
                disabled={submitting}
                className="rounded bg-primary dark:bg-primary-night px-4 py-2 disabled:opacity-60"
              >
                <Text className="text-sm font-semibold text-on-primary dark:text-on-primary-night">{t('common.save')}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}

      {toDelete ? (
        <Modal
          title={toDelete.kind === 'domain' ? t('domains.deleteDomainTitle') : t('domains.deleteSubdomainTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error dark:text-error-night" />}
          onClose={() => setToDelete(null)}
        >
          <View className="gap-4">
            <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
              {t('domains.deleteConfirmText', { label: toDelete.label })}
            </Text>
            {deleteError ? <Text className="text-sm text-error dark:text-error-night">{deleteError}</Text> : null}
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
