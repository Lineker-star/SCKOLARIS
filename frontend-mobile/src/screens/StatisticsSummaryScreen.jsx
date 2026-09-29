import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { getAnalytics } from '../services/adminStats'
import { AlertTriangleIcon, InfoIcon } from '../components/icons'

function num(value) {
  return Number(value) || 0
}

function findSeries(summary, series) {
  return summary.find((row) => row.series === series)
}

// Même logique que la version web (StatisticsSummary.jsx) — aucun terme
// technique, une phrase par constat.
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
    <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-4 gap-2">
      <Text className="text-base font-bold text-on-surface dark:text-on-surface-night">{title}</Text>
      {children}
    </View>
  )
}

function Insight({ children }) {
  return (
    <Text className="text-sm leading-relaxed text-on-surface-variant dark:text-on-surface-variant-night">{children}</Text>
  )
}

function OverviewInsight({ data, t }) {
  const downloads = findSeries(data.summary, 'downloads_daily')
  const reads = findSeries(data.summary, 'reads_daily')
  const downloadsTotal = num(downloads?.total)
  const readsTotal = num(reads?.total)

  return (
    <InsightCard title={t('summary.overview.title')}>
      <Insight>
        {t('summary.overview.mainSentence', {
          downloads: t('summary.overview.downloadsPhrase', { count: downloadsTotal }),
          reads: t('summary.overview.readsPhrase', { count: readsTotal }),
        })}{' '}
        {downloadsTotal === 0 && readsTotal === 0
          ? t('summary.overview.noneYet')
          : t('summary.overview.trendSentence', {
              downloadsTrend: weeklyTrendSentence(t, downloads, 'download'),
              readsTrend: weeklyTrendSentence(t, reads, 'read'),
            })}
      </Insight>
      {downloadsTotal > 0 && readsTotal > 0 && (
        <Insight>{readsTotal > downloadsTotal ? t('summary.overview.preferRead') : t('summary.overview.preferDownload')}</Insight>
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
      <Insight>
        {totalAccounts === 0
          ? t('summary.noAccountsYet')
          : t('summary.activity.onlineStatus', { count: onlineCount, total: totalAccounts })}
      </Insight>
      <Insight>
        {t('summary.activity.trendSentence', {
          activityTrend: weeklyTrendSentence(t, activity, 'person'),
          registrationsTrend: weeklyTrendSentence(t, registrations, 'registration'),
        })}
      </Insight>
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
      <Insight>{total === 0 ? t('summary.noAccountsYet') : t('summary.accounts.totalBreakdown', { count: total, breakdown })}</Insight>
      {pending > 0 && (
        <View className="flex-row items-start gap-2">
          <AlertTriangleIcon width={16} height={16} className="mt-0.5 text-secondary dark:text-secondary-night" />
          <Text className="flex-1 text-sm leading-relaxed text-secondary dark:text-secondary-night">
            {t('summary.accounts.pendingWarning', { count: pending })}
          </Text>
        </View>
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
      <Insight>
        {t('summary.catalog.documentsClause', { count: totalDocuments })}
        {t('summary.catalog.domainsClause', { count: domains.length })}
        {busiest && t('summary.catalog.busiest', { domain: busiest.domain, count: busiest.total })}
      </Insight>
      {emptySubdomains.length > 0 && (
        <Insight>
          {t('summary.catalog.emptyIntro', { count: emptySubdomains.length })}
          {emptySubdomains.length <= 5
            ? t('summary.catalog.emptyListShort', { list: emptySubdomains.join(', ') })
            : t('summary.catalog.emptyListLong', { list: emptySubdomains.slice(0, 5).join(', ') })}
        </Insight>
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
        <Insight>{t('summary.depositors.none')}</Insight>
      ) : (
        <Insight>
          {t('summary.depositors.leader', { name: leader.label, count: leader.count })}
          {top.length > 1 && t('summary.depositors.followedBy', { names: top.slice(1, 4).map((row) => row.label).join(', ') })}
        </Insight>
      )}
    </InsightCard>
  )
}

// Portage de StatisticsSummary.jsx (web) — même contenu, mêmes phrases.
export default function StatisticsSummaryScreen() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || t('statistics.loadError')))
      .finally(() => setLoading(false))
  }, [t])

  return (
    <AppShell title={t('summary.title')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View className="flex-row items-start gap-2">
          <InfoIcon width={18} height={18} className="mt-0.5 text-on-surface-variant dark:text-on-surface-variant-night" />
          <Text className="flex-1 text-on-surface-variant dark:text-on-surface-variant-night">
            {t('summary.intro')}
          </Text>
        </View>

        {loading && <ActivityIndicator className="mt-6" />}

        {error ? (
          <View className="flex-row items-start gap-2 rounded-lg border border-error dark:border-error-night bg-error-container dark:bg-error-container-night px-4 py-3">
            <AlertTriangleIcon width={18} height={18} className="mt-0.5 text-on-error-container dark:text-on-error-container-night" />
            <Text className="flex-1 text-sm text-on-error-container dark:text-on-error-container-night">{error}</Text>
          </View>
        ) : null}

        {data && (
          <>
            <OverviewInsight data={data} t={t} />
            <ActivityInsight data={data} t={t} />
            <AccountsInsight data={data} t={t} />
            <CatalogInsight data={data} t={t} />
            <DepositorsInsight data={data} t={t} />
          </>
        )}
      </ScrollView>
    </AppShell>
  )
}
