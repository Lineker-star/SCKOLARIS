import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import Avatar from '../components/Avatar'
import OnlineIndicator from '../components/OnlineIndicator'
import { useAuth } from '../context/AuthContext'
import {
  getAccount,
  updateAccountStatus,
  updateAccountRole,
  deactivateAccount,
  reactivateAccount,
} from '../services/accounts'
import { formatDate } from '../utils/format'
import {
  ArrowLeftIcon,
  CheckIcon,
  XIcon,
  BookOpenIcon,
  DownloadIcon,
  ShieldCheckIcon,
} from '../components/icons'

export default function UserDetail() {
  const { t } = useTranslation()
  const roleLabels = { student: t('roles.student'), teacher: t('roles.teacher'), admin: t('roles.admin') }
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [counts, setCounts] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [role, setRole] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  function load() {
    getAccount(id)
      .then((res) => {
        setAccount(res.data.account)
        setRole(res.data.account.role)
        setCounts({
          documents: res.data.deposited_documents_count,
          downloads: res.data.downloads_count,
        })
      })
      .catch(() => setNotFound(true))
  }

  useEffect(load, [id])

  async function decide(status) {
    setBusy('status')
    setError('')
    try {
      await updateAccountStatus(id, status)
      load()
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy('')
    }
  }

  async function handleRoleUpdate() {
    setBusy('role')
    setError('')
    try {
      await updateAccountRole(id, role)
      load()
    } catch {
      setError(t('common.error'))
    } finally {
      setBusy('')
    }
  }

  async function toggleActive() {
    setBusy('active')
    setError('')
    try {
      if (account.is_active) {
        await deactivateAccount(id)
      } else {
        await reactivateAccount(id)
      }
      load()
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'))
    } finally {
      setBusy('')
    }
  }

  const isSelf = account && currentUser.id === account.id

  return (
    <DashboardLayout role="admin">
      <button
        onClick={() => navigate('/utilisateurs')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeftIcon width={16} height={16} />
        {t('userDetail.backToList')}
      </button>

      {notFound && <p className="mt-6 text-on-surface-variant">{t('userDetail.notFound')}</p>}

      {account && (
        <div className="mt-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar user={account} size="md" />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-primary">
                {account.first_name} {account.last_name}
              </h1>
              <StatusBadge status={account.account_status} />
              {!account.is_active && <StatusBadge status="deactivated" />}
              <OnlineIndicator online={account.is_online} />
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 grid sm:grid-cols-2 gap-5">
            <Field label={t('login.registrationNumber')} value={account.registration_number} />
            <Field label={t('userDetail.primaryEmail')} value={account.email} />
            <Field label={t('userDetail.secondaryEmail')} value={account.secondary_email ?? '—'} />
            <Field label={t('userDetail.role')} value={roleLabels[account.role]} />
            <Field label={t('deposit.program')} value={account.program ?? '—'} />
            <Field label={t('userDetail.registeredOn')} value={formatDate(account.created_at)} />
          </div>

          {counts && (
            <div className="mt-5 grid grid-cols-2 gap-5">
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <BookOpenIcon width={20} height={20} />
                </div>
                <div>
                  <p className="text-xl font-bold text-on-surface">{counts.documents}</p>
                  <p className="text-xs text-on-surface-variant">{t('userDetail.depositedDocuments')}</p>
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <DownloadIcon width={20} height={20} />
                </div>
                <div>
                  <p className="text-xl font-bold text-on-surface">{counts.downloads}</p>
                  <p className="text-xs text-on-surface-variant">{t('userDetail.downloads')}</p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="mt-5 text-sm text-error">{error}</p>}

          <div className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 space-y-5">
            <h2 className="flex items-center gap-2 font-semibold text-on-surface">
              <ShieldCheckIcon width={20} height={20} />
              {t('userDetail.adminActions')}
            </h2>

            {account.account_status === 'pending' && (
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={busy === 'status'}
                  onClick={() => decide('rejected')}
                  className="inline-flex items-center gap-1.5 rounded border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error-container disabled:opacity-60"
                >
                  <XIcon width={16} height={16} />
                  {t('pendingAccounts.reject')}
                </button>
                <button
                  disabled={busy === 'status'}
                  onClick={() => decide('validated')}
                  className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
                >
                  <CheckIcon width={16} height={16} />
                  {t('pendingAccounts.validate')}
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">{t('userDetail.changeRole')}</label>
              <div className="flex flex-wrap gap-3">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded border border-outline px-3 py-2 focus:outline-none focus:border-2 focus:border-primary"
                >
                  <option value="student">{t('roles.student')}</option>
                  <option value="teacher">{t('roles.teacher')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                </select>
                <button
                  disabled={busy === 'role' || role === account.role}
                  onClick={handleRoleUpdate}
                  className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-60"
                >
                  {t('userDetail.updateRole')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-surface mb-1.5">{t('userDetail.accountActivation')}</label>
              {isSelf ? (
                <p className="text-sm text-on-surface-variant">{t('userDetail.cannotDeactivateSelf')}</p>
              ) : (
                <button
                  disabled={busy === 'active'}
                  onClick={toggleActive}
                  className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-60"
                >
                  {account.is_active ? t('users.deactivate') : t('users.reactivate')}
                </button>
              )}
            </div>
          </div>

          <Link
            to="/utilisateurs"
            className="mt-6 inline-block text-sm font-semibold text-primary hover:underline"
          >
            ← {t('userDetail.backToUsersList')}
          </Link>
        </div>
      )}
    </DashboardLayout>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-on-surface-variant">{label}</p>
      <p className="mt-1 text-on-surface">{value}</p>
    </div>
  )
}
