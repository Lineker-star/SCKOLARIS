import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
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

export default function Domains() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [formTarget, setFormTarget] = useState(null) // { kind: 'domain'|'subdomain', mode: 'create'|'edit', id, domainId, initialName }
  const [name, setName] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toDelete, setToDelete] = useState(null) // { kind, id, label }
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

  async function handleFormSubmit(e) {
    e.preventDefault()
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
    <DashboardLayout role={user.role}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('nav.domains')}</h1>
          <p className="mt-2 text-on-surface-variant">{t('domains.intro')}</p>
        </div>
        <button
          onClick={openCreateDomain}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container"
        >
          <PlusIcon width={18} height={18} />
          {t('domains.newDomain')}
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {!loading && domains.length === 0 && (
          <p className="text-on-surface-variant text-sm">{t('domains.empty')}</p>
        )}
        {domains.map((domain) => (
          <div
            key={domain.id}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest"
          >
            <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4">
              <div className="flex items-center gap-2">
                <ChartBarIcon width={18} height={18} className="text-primary" />
                <h2 className="font-semibold text-on-surface">{domain.name}</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openEditDomain(domain)}
                  aria-label={t('domains.editAria', { name: domain.name })}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <PencilIcon width={16} height={16} />
                </button>
                <button
                  onClick={() =>
                    setToDelete({ kind: 'domain', id: domain.id, label: domain.name })
                  }
                  aria-label={t('domains.deleteAria', { name: domain.name })}
                  className="text-on-surface-variant hover:text-error"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </div>

            <div className="divide-y divide-outline-variant">
              {domain.subdomains.length === 0 && (
                <p className="px-5 py-3 text-sm text-on-surface-variant">{t('domains.noSubdomains')}</p>
              )}
              {domain.subdomains.map((subdomain) => (
                <div key={subdomain.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="text-sm text-on-surface">
                    {subdomain.name}
                    <span className="ml-2 text-xs text-on-surface-variant">
                      {t('domains.documentCount', { count: subdomain.documents_count })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditSubdomain(subdomain)}
                      aria-label={t('domains.editAria', { name: subdomain.name })}
                      className="text-on-surface-variant hover:text-on-surface"
                    >
                      <PencilIcon width={14} height={14} />
                    </button>
                    <button
                      onClick={() =>
                        setToDelete({ kind: 'subdomain', id: subdomain.id, label: subdomain.name })
                      }
                      aria-label={t('domains.deleteAria', { name: subdomain.name })}
                      className="text-on-surface-variant hover:text-error"
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-3">
              <button
                onClick={() => openCreateSubdomain(domain)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <PlusIcon width={14} height={14} />
                {t('domains.addSubdomain')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {formTarget && (
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
          icon={<ChartBarIcon width={22} height={22} className="text-primary" />}
          onClose={() => setFormTarget(null)}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && <p className="text-sm text-error">{formError}</p>}
            <TextField
              label={t('domains.name')}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormTarget(null)}
                className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title={toDelete.kind === 'domain' ? t('domains.deleteDomainTitle') : t('domains.deleteSubdomainTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error" />}
          onClose={() => setToDelete(null)}
        >
          <p className="text-sm text-on-surface-variant">
            {t('domains.deleteConfirmText', { label: toDelete.label })}
          </p>
          {deleteError && <p className="mt-3 text-sm text-error">{deleteError}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90 disabled:opacity-60"
            >
              {t('common.delete')}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
