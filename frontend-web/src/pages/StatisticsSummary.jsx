import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { getAnalytics } from '../services/adminStats'
import { AlertTriangleIcon, ArrowLeftIcon, InfoIcon } from '../components/icons'

function num(value) {
  return Number(value) || 0
}

function findSeries(summary, series) {
  return summary.find((row) => row.series === series)
}

// Phrase la direction d'une évolution sans jamais utiliser "tendance",
// "moyenne mobile" ou "pourcentage" — juste une évolution par semaine, en
// mots simples.
function weeklyTrendSentence(t, summaryRow, unitKey) {
  const weekly = num(summaryRow?.slope_per_day) * 7

  if (Math.abs(weekly) < 1) {
    return t('summary.trendStable')
  }

  const amount = Math.round(Math.abs(weekly))
  const unit = t(`summary.units.${unitKey}`, { count: amount })
  return t(weekly > 0 ? 'summary.trendIncrease' : 'summary.trendDecrease', { amount, unit })
}

function InsightCard({ title, children }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-on-surface-variant">{children}</div>
    </div>
  )
}

function OverviewInsight({ data, t }) {
  const downloads = findSeries(data.summary, 'downloads_daily')
  const reads = findSeries(data.summary, 'reads_daily')

  const downloadsTotal = num(downloads?.total)
  const readsTotal = num(reads?.total)

  return (
    <InsightCard title={t('summary.overview.title')}>
      <p>
        <Trans
          i18nKey="summary.overview.mainSentence"
          values={{
            downloads: t('summary.overview.downloadsPhrase', { count: downloadsTotal }),
            reads: t('summary.overview.readsPhrase', { count: readsTotal }),
          }}
          components={{ strong: <strong /> }}
        />{' '}
        {downloadsTotal === 0 && readsTotal === 0
          ? t('summary.overview.noneYet')
          : t('summary.overview.trendSentence', {
              downloadsTrend: weeklyTrendSentence(t, downloads, 'download'),
              readsTrend: weeklyTrendSentence(t, reads, 'read'),
            })}
      </p>
      {downloadsTotal > 0 && readsTotal > 0 && (
        <p>{readsTotal > downloadsTotal ? t('summary.overview.preferRead') : t('summary.overview.preferDownload')}</p>
      )}
    </InsightCard>
  )
}

function ActivityInsight({ data, t }) {
  const activity = findSeries(data.summary, 'activity_daily')
  const registrations = findSeries(data.summary, 'registrations_daily')
  const online = data.online_now.find((row) => row.label === 'En ligne')
  const offline = data.online_now.find((row) => row.label === 'Hors ligne')
  const onlineCount = num(online?.count)
  const totalAccounts = onlineCount + num(offline?.count)

  return (
    <InsightCard title={t('summary.activity.title')}>
      <p>
        {totalAccounts === 0
          ? t('summary.noAccountsYet')
          : t('summary.activity.onlineStatus', { count: onlineCount, total: totalAccounts })}
      </p>
      <p>
        {t('summary.activity.trendSentence', {
          activityTrend: weeklyTrendSentence(t, activity, 'person'),
          registrationsTrend: weeklyTrendSentence(t, registrations, 'registration'),
        })}
      </p>
    </InsightCard>
  )
}

function AccountsInsight({ data, t }) {
  const STATUS_LABELS = {
    pending: t('summary.accounts.statusPending'),
    validated: t('summary.accounts.statusValidated'),
    rejected: t('summary.accounts.statusRejected'),
  }
  const byStatus = Object.fromEntries(data.accounts_by_status.map((row) => [row.label, num(row.count)]))
  const pending = byStatus.pending ?? 0
  const total = Object.values(byStatus).reduce((sum, n) => sum + n, 0)

  const breakdown = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => t('summary.accounts.statusCount', { count, status: STATUS_LABELS[status] ?? status }))
    .join(', ')

  return (
    <InsightCard title={t('summary.accounts.title')}>
      <p>{total === 0 ? t('summary.noAccountsYet') : t('summary.accounts.totalBreakdown', { count: total, breakdown })}</p>
      {pending > 0 && (
        <p className="flex items-start gap-2 text-secondary">
          <AlertTriangleIcon width={16} height={16} className="mt-0.5 shrink-0" />
          <span>{t('summary.accounts.pendingWarning', { count: pending })}</span>
        </p>
      )}
    </InsightCard>
  )
}

function CatalogInsight({ data, t }) {
  const domains = data.documents_by_domain
  const totalDocuments = domains.reduce((sum, d) => sum + num(d.total), 0)
  const withDocs = domains.filter((d) => num(d.total) > 0)
  const busiest = [...withDocs].sort((a, b) => num(b.total) - num(a.total))[0]
  const emptySubdomains = domains.flatMap((d) => d.subdomains.filter((s) => num(s.count) === 0).map((s) => `${d.domain} › ${s.name}`))

  return (
    <InsightCard title={t('summary.catalog.title')}>
      <p>
        {t('summary.catalog.documentsClause', { count: totalDocuments })}
        {t('summary.catalog.domainsClause', { count: domains.length })}
        {busiest && t('summary.catalog.busiest', { domain: busiest.domain, count: busiest.total })}
      </p>
      {emptySubdomains.length > 0 && (
        <p>
          {t('summary.catalog.emptyIntro', { count: emptySubdomains.length })}
          {emptySubdomains.length <= 5
            ? t('summary.catalog.emptyListShort', { list: emptySubdomains.join(', ') })
            : t('summary.catalog.emptyListLong', { list: emptySubdomains.slice(0, 5).join(', ') })}
        </p>
      )}
    </InsightCard>
  )
}

function DepositorsInsight({ data, t }) {
  const top = data.top_depositors
  const leader = top[0]

  return (
    <InsightCard title={t('summary.depositors.title')}>
      {top.length === 0 ? (
        <p>{t('summary.depositors.none')}</p>
      ) : (
        <p>
          <Trans
            i18nKey="summary.depositors.leader"
            count={num(leader.count)}
            values={{ name: leader.label, count: leader.count }}
            components={{ strong: <strong /> }}
          />
          {top.length > 1 &&
            t('summary.depositors.followedBy', {
              names: top
                .slice(1, 4)
                .map((row) => row.label)
                .join(', '),
            })}
        </p>
      )}
    </InsightCard>
  )
}

export default function StatisticsSummary() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || t('statistics.loadError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  return (
    <DashboardLayout role={user.role}>
      <Link
        to="/statistiques"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeftIcon width={16} height={16} />
        {t('summary.backToCharts')}
      </Link>

      <h1 className="mt-3 text-3xl font-bold text-primary">{t('summary.title')}</h1>
      <p className="mt-2 flex items-start gap-2 text-on-surface-variant">
        <InfoIcon width={18} height={18} className="mt-0.5 shrink-0" />
        {t('summary.intro')}
      </p>

      {loading && <p className="mt-8 text-sm text-on-surface-variant">{t('summary.analyzing')}</p>}

      {error && (
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-error bg-error-container px-4 py-3 text-sm text-on-error-container">
          <AlertTriangleIcon width={18} height={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {data && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <OverviewInsight data={data} t={t} />
          <ActivityInsight data={data} t={t} />
          <AccountsInsight data={data} t={t} />
          <CatalogInsight data={data} t={t} />
          <div className="lg:col-span-2">
            <DepositorsInsight data={data} t={t} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
