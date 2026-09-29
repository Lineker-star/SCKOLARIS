import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import DocumentCard from '../../components/DocumentCard'
import { useAuth } from '../../context/AuthContext'
import { getDownloads } from '../../services/documents'
import { getCatalog } from '../../services/catalog'
import { SearchIcon } from '../../components/icons'
import { formatDate } from '../../utils/format'

export default function StudentDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [downloads, setDownloads] = useState([])
  const [latest, setLatest] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      user.account_status === 'validated' ? getDownloads() : Promise.resolve({ data: { downloads: [] } }),
      getCatalog(),
    ])
      .then(([downloadsRes, catalogRes]) => {
        setDownloads(downloadsRes.data.downloads.slice(0, 2))
        setLatest((catalogRes.data.data ?? []).slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [user.account_status])

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/catalogue${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  }

  return (
    <DashboardLayout role="student">
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('studentDashboard.searchPlaceholder')}
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

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">{t('nav.myLibrary')}</h2>
          <Link to="/ma-bibliotheque" className="text-sm font-semibold text-primary hover:underline">
            {t('dashboard.seeAll')}
          </Link>
        </div>

        {!loading && user.account_status !== 'validated' && (
          <p className="text-on-surface-variant text-sm">{t('studentDashboard.downloadPending')}</p>
        )}
        {!loading && user.account_status === 'validated' && downloads.length === 0 && (
          <p className="text-on-surface-variant text-sm">{t('studentDashboard.noDownloads')}</p>
        )}
        <div className="space-y-3">
          {downloads.map((d) => (
            <DocumentCard
              key={d.id}
              title={d.document?.title}
              author={d.document?.author}
              subject={d.document?.subdomain?.name}
              coverUrl={d.document?.cover_url}
              date={formatDate(d.downloaded_at)}
              onClick={() => navigate(`/documents/${d.document?.id}`)}
            />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-on-surface mb-4">{t('dashboard.latestAdditions')}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {latest.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              author={doc.author}
              subject={doc.subdomain?.name}
              coverUrl={doc.cover_url}
              onClick={() => navigate(`/documents/${doc.id}`)}
            />
          ))}
        </div>
      </section>
    </DashboardLayout>
  )
}
