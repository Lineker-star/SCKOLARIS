import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { getPendingAccounts, updateAccountStatus } from '../services/accounts'
import { formatDate } from '../utils/format'
import { CheckIcon, XIcon, ChevronRightIcon, ArrowLeftIcon } from '../components/icons'

export default function PendingAccounts() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const [results, setResults] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    setError('')
    getPendingAccounts({ page })
      .then((res) => setResults(res.data))
      .catch(() => setError(t('pendingAccounts.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const accounts = results?.data ?? []

  async function decide(id, status) {
    setBusyId(id)
    try {
      await updateAccountStatus(id, status)
      load()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold text-primary">{t('nav.pendingAccounts')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('pendingAccounts.intro')}</p>

      {error && (
        <p className="mt-4 rounded bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {!loading && !error && accounts.length === 0 && (
          <p className="p-6 text-sm text-on-surface-variant">{t('pendingAccounts.empty')}</p>
        )}

        <div className="divide-y divide-outline-variant">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
            >
              <div>
                <p className="font-semibold text-on-surface">
                  {account.first_name} {account.last_name}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {account.registration_number} · {account.email} · {roleLabels[account.role]}
                  {account.program ? ` · ${account.program}` : ''}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('pendingAccounts.registeredOn', { date: formatDate(account.created_at) })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busyId === account.id}
                  onClick={() => decide(account.id, 'rejected')}
                  className="inline-flex items-center gap-1.5 rounded border border-error px-3 py-2 text-sm font-semibold text-error hover:bg-error-container disabled:opacity-60"
                >
                  <XIcon width={16} height={16} />
                  {t('pendingAccounts.reject')}
                </button>
                <button
                  disabled={busyId === account.id}
                  onClick={() => decide(account.id, 'validated')}
                  className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
                >
                  <CheckIcon width={16} height={16} />
                  {t('pendingAccounts.validate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!loading && results && results.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={!results.prev_page_url}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface disabled:opacity-40"
          >
            <ArrowLeftIcon width={16} height={16} />
            {t('common.previous')}
          </button>
          <span className="text-sm text-on-surface-variant">
            {t('catalog.pageOf', { current: results.current_page, last: results.last_page })}
          </span>
          <button
            disabled={!results.next_page_url}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface disabled:opacity-40"
          >
            {t('common.next')}
            <ChevronRightIcon width={16} height={16} />
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
