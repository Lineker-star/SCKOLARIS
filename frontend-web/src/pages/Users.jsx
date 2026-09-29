import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import OnlineIndicator from '../components/OnlineIndicator'
import { useAuth } from '../context/AuthContext'
import {
  getAccounts,
  updateAccountStatus,
  deactivateAccount,
  reactivateAccount,
} from '../services/accounts'
import { CheckIcon, XIcon, ChevronRightIcon, ArrowLeftIcon, SearchIcon } from '../components/icons'

export default function Users() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') ?? '')

  const statusFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'pending', label: t('status.pending') },
    { value: 'validated', label: t('users.filterValidated') },
    { value: 'rejected', label: t('users.filterRejected') },
  ]
  const onlineFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'online', label: t('status.online') },
    { value: 'offline', label: t('status.offline') },
  ]
  const roleFilters = [
    { value: 'all', label: t('users.filterAll') },
    { value: 'student', label: t('roles.student') },
    { value: 'teacher', label: t('roles.teacher') },
    { value: 'admin', label: t('roles.admin') },
  ]
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }

  const filter = searchParams.get('status') ?? 'all'
  const onlineFilter = searchParams.get('online') ?? 'all'
  const roleFilter = searchParams.get('role') ?? 'all'
  const searchTerm = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  function load() {
    setLoading(true)
    setError('')
    getAccounts({
      account_status: filter !== 'all' ? filter : undefined,
      is_online: onlineFilter !== 'all' ? (onlineFilter === 'online' ? 1 : 0) : undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      search: searchTerm || undefined,
      page,
    })
      .then((res) => setResults(res.data))
      .catch(() => setError(t('users.loadError')))
      .finally(() => setLoading(false))
  }

  useEffect(load, [filter, onlineFilter, roleFilter, searchTerm, page])

  function setStatusFilter(value) {
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (value === 'all') delete params.status
    else params.status = value
    setSearchParams(params)
  }

  function setOnlineFilterValue(value) {
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (value === 'all') delete params.online
    else params.online = value
    setSearchParams(params)
  }

  function setRoleFilterValue(value) {
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (value === 'all') delete params.role
    else params.role = value
    setSearchParams(params)
  }

  function handleSearch(e) {
    e.preventDefault()
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (search) params.search = search
    else delete params.search
    setSearchParams(params)
  }

  function goToPage(nextPage) {
    setSearchParams({ ...Object.fromEntries(searchParams), page: nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function decide(id, status) {
    setBusyId(id)
    try {
      await updateAccountStatus(id, status)
      load()
    } finally {
      setBusyId(null)
    }
  }

  async function toggleActive(account) {
    setBusyId(account.id)
    try {
      if (account.is_active) {
        await deactivateAccount(account.id)
      } else {
        await reactivateAccount(account.id)
      }
      load()
    } finally {
      setBusyId(null)
    }
  }

  const visible = results?.data ?? []

  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold text-primary">{t('nav.users')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('users.intro')}</p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
            className="w-full rounded border border-outline bg-surface-container-lowest py-3 pl-11 pr-4 focus:outline-none focus:border-2 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-primary px-6 font-semibold text-on-primary hover:bg-primary-container transition-colors"
        >
          {t('common.search')}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {roleFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRoleFilterValue(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              roleFilter === value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {statusFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === value
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {onlineFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setOnlineFilterValue(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              onlineFilter === value
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!loading && results && (
        <p className="mt-4 text-sm text-on-surface-variant">
          {t('users.resultCount', { count: results.total })}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded bg-error-container px-4 py-3 text-sm text-on-error-container">
          {error}
        </p>
      )}

      <div className="mt-2 rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {!loading && !error && visible.length === 0 && (
          <p className="p-6 text-sm text-on-surface-variant">{t('users.noneForFilter')}</p>
        )}

        <div className="divide-y divide-outline-variant">
          {visible.map((account) => (
            <div
              key={account.id}
              onClick={() => navigate(`/utilisateurs/${account.id}`)}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar user={account} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-on-surface">
                      {account.first_name} {account.last_name}
                    </p>
                    <StatusBadge status={account.account_status} />
                    {!account.is_active && <StatusBadge status="deactivated" />}
                    <OnlineIndicator online={account.is_online} />
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {account.registration_number} · {account.email} · {roleLabels[account.role]}
                    {account.program ? ` · ${account.program}` : ''}
                    {!account.is_active ? ` · ${t('users.deactivatedSuffix')}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {account.account_status === 'pending' && (
                  <>
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
                  </>
                )}
                {account.account_status !== 'pending' && account.id !== currentUser.id && (
                  <button
                    disabled={busyId === account.id}
                    onClick={() => toggleActive(account)}
                    className="rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-60"
                  >
                    {account.is_active ? t('users.deactivate') : t('users.reactivate')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!loading && results && results.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={!results.prev_page_url}
            onClick={() => goToPage(page - 1)}
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
            onClick={() => goToPage(page + 1)}
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
