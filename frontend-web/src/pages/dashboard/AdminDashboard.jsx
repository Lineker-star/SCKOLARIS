import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import { getStatistics } from '../../services/accounts'
import { getDeletionRequests } from '../../services/deletionRequests'
import { ShieldCheckIcon, TrashIcon, UsersIcon, BookOpenIcon, DownloadIcon, ChevronRightIcon, UploadCloudIcon } from '../../components/icons'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [pendingDeletions, setPendingDeletions] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Le nombre de comptes en attente vient de /statistics (un COUNT SQL),
    // pas d'un fetch de la liste entière juste pour en compter la longueur
    // — ça devenait très lent une fois la base à plusieurs milliers de
    // comptes.
    getDeletionRequests().then((res) => setPendingDeletions(res.data.deletion_requests.length))
    getStatistics().then((res) => setStats(res.data))
  }, [])

  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold text-primary">{t('adminDashboard.title')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('adminDashboard.intro')}</p>

      <div className="mt-8 grid md:grid-cols-3 gap-5">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
            <ShieldCheckIcon width={22} height={22} className="text-primary" />
            {t('nav.pendingAccounts')}
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">{t('adminDashboard.pendingAccountsHint')}</p>
          <p className="mt-4 text-4xl font-bold text-primary">{stats?.pending_accounts ?? '—'}</p>
          <Link
            to="/comptes-en-attente"
            className="mt-4 inline-flex items-center gap-1 rounded bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container hover:opacity-90"
          >
            {t('deletionRequests.review')} <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>

        <div className="rounded-lg border border-error-container bg-error-container p-6">
          <div className="flex items-center gap-2 text-on-error-container font-semibold text-lg">
            <TrashIcon width={22} height={22} />
            {t('nav.deletionRequests')}
          </div>
          <p className="mt-1 text-sm text-on-error-container/80">{t('adminDashboard.deletionRequestsHint')}</p>
          <p className="mt-4 text-4xl font-bold text-on-error-container">{pendingDeletions ?? '—'}</p>
          <Link
            to="/demandes-de-suppression"
            className="mt-4 inline-flex items-center gap-1 rounded bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90"
          >
            {t('deletionRequests.review')} <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <div className="flex items-center gap-2 text-on-surface font-semibold text-lg">
            <UploadCloudIcon width={22} height={22} className="text-primary" />
            {t('nav.myDeposits')}
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">{t('adminDashboard.myDepositsHint')}</p>
          <Link
            to="/deposer-un-support"
            className="mt-4 inline-flex items-center gap-1 rounded bg-secondary-container px-4 py-2 text-sm font-semibold text-on-secondary-container hover:opacity-90"
          >
            {t('common.add')} <ChevronRightIcon width={16} height={16} />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile icon={<UsersIcon />} label={t('nav.users')} value={stats?.total_users} />
        <StatTile icon={<ShieldCheckIcon />} label={t('adminDashboard.validatedAccounts')} value={stats?.validated_accounts} />
        <StatTile icon={<BookOpenIcon />} label={t('adminDashboard.catalogDocuments')} value={stats?.total_documents} />
        <StatTile icon={<DownloadIcon />} label={t('userDetail.downloads')} value={stats?.total_downloads} />
      </div>
    </DashboardLayout>
  )
}

function StatTile({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
        {icon}
      </div>
      <p className="mt-4 text-3xl font-bold text-on-surface">{value ?? '—'}</p>
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  )
}
