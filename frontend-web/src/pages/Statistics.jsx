import { Fragment, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { getAnalytics } from '../services/adminStats'
import { AlertTriangleIcon, InfoIcon } from '../components/icons'

const PIE_COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-tertiary)', 'var(--color-error)']

function ChartCard({ title, subtitle, height = 288, children }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <h2 className="text-base font-bold text-on-surface">{title}</h2>
      {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </div>
  )
}

// Tronque un libellé trop long pour l'axe (le nom complet reste visible au
// survol via <Tooltip>) — sans ça, avec beaucoup de catégories (ex: les 36
// sous-domaines) dans l'espace vertical réduit d'un graphique, les libellés
// se chevauchent et deviennent illisibles.
function truncateLabel(label, max = 26) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

function DailyLineChart({ data, t }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" name={t('statistics.perDay')} stroke="var(--color-primary)" dot={false} strokeWidth={1.5} />
        <Line
          type="monotone"
          dataKey="trend"
          name={t('statistics.trend7d')}
          stroke="var(--color-secondary)"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function CategoryBarChart({ data, t }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 12, right: 24 }} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" />
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis
          dataKey="label"
          type="category"
          width={168}
          tick={{ fontSize: 11 }}
          tickFormatter={truncateLabel}
          interval={0}
        />
        <Tooltip formatter={(value) => [value, t('statistics.count')]} labelFormatter={(label) => label} />
        <Bar dataKey="count" name={t('statistics.count')} fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Un simple comptage groupé se lit mieux en table qu'en graphique — pas de
// libellés à deviner sur un axe, le nombre exact est juste là (voir
// StatsController::documentsByDomain(), calculé côté serveur sans passer
// par R : ce n'est pas une tendance à analyser).
function DomainDocumentsTable({ domains, t }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-high text-left text-on-surface-variant">
            <th className="px-6 py-3 font-medium">{t('nav.domains')}</th>
            <th className="px-6 py-3 font-medium">{t('statistics.subdomainColumn')}</th>
            <th className="px-6 py-3 font-medium text-right">{t('statistics.documentsColumn')}</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain) => (
            <Fragment key={domain.domain}>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <td colSpan={2} className="px-6 py-2 font-bold text-on-surface">
                  {domain.domain}
                </td>
                <td className="px-6 py-2 text-right font-bold text-on-surface">{domain.total}</td>
              </tr>
              {domain.subdomains.map((subdomain) => (
                <tr key={subdomain.name} className="border-b border-outline-variant last:border-0">
                  <td className="px-6 py-2.5" />
                  <td className="px-6 py-2.5 text-on-surface-variant">{subdomain.name}</td>
                  <td
                    className={`px-6 py-2.5 text-right ${subdomain.count === 0 ? 'text-on-surface-variant' : 'font-semibold text-on-surface'}`}
                  >
                    {subdomain.count}
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CategoryPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function Statistics() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => {
        // Page réservée aux admins : le détail renvoyé par le backend (ex:
        // "R n'est pas installé") est un vrai diagnostic utile ici, pas une
        // fuite d'info sensible — on l'affiche plutôt qu'un message générique.
        setError(err.response?.data?.message || t('statistics.loadError'))
      })
      .finally(() => setLoading(false))
  }, [t])

  return (
    <DashboardLayout role={user.role}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('nav.statistics')}</h1>
          <p className="mt-2 text-on-surface-variant">{t('statistics.intro')}</p>
        </div>
        <Link
          to="/statistiques/conclusions"
          className="inline-flex items-center gap-2 rounded border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-high"
        >
          <InfoIcon width={18} height={18} />
          {t('statistics.seeConclusions')}
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-on-surface-variant">{t('statistics.computing')}</p>}

      {error && (
        <div className="mt-8 flex items-start gap-2 rounded-lg border border-error bg-error-container px-4 py-3 text-sm text-on-error-container">
          <AlertTriangleIcon width={18} height={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {data && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title={t('statistics.downloadsPerDay')} subtitle={t('statistics.last90Days')}>
            <DailyLineChart data={data.downloads_daily} t={t} />
          </ChartCard>

          <ChartCard title={t('statistics.onlineNow')} subtitle={t('statistics.snapshot')}>
            <CategoryPieChart data={data.online_now} />
          </ChartCard>

          <ChartCard title={t('statistics.activeUsersPerDay')} subtitle={t('statistics.last90DaysAction')}>
            <DailyLineChart data={data.activity_daily} t={t} />
          </ChartCard>

          <ChartCard title={t('statistics.readsPerDay')} subtitle={t('statistics.last90Days')}>
            <DailyLineChart data={data.reads_daily} t={t} />
          </ChartCard>

          <ChartCard title={t('statistics.newRegistrationsPerDay')} subtitle={t('statistics.last90Days')}>
            <DailyLineChart data={data.registrations_daily} t={t} />
          </ChartCard>

          <ChartCard title={t('statistics.accountBreakdown')} subtitle={t('statistics.byStatus')}>
            <CategoryPieChart data={data.accounts_by_status} />
          </ChartCard>

          <div className="lg:col-span-2">
            <h2 className="text-base font-bold text-on-surface">{t('statistics.catalogByDomain')}</h2>
            <p className="text-xs text-on-surface-variant">{t('statistics.documentsPerSubdomain')}</p>
            <div className="mt-4">
              <DomainDocumentsTable domains={data.documents_by_domain} t={t} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <ChartCard
              title={t('statistics.mostActiveTeachers')}
              subtitle={t('statistics.top10ByDeposits')}
              height={Math.max(288, data.top_depositors.length * 28)}
            >
              <CategoryBarChart data={data.top_depositors} t={t} />
            </ChartCard>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
