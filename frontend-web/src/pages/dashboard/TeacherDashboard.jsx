import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../../components/DashboardLayout'
import DocumentCard from '../../components/DocumentCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { getMyUploads } from '../../services/documents'
import { getCatalog } from '../../services/catalog'
import { formatDate } from '../../utils/format'
import { BellIcon } from '../../components/icons'

export default function TeacherDashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [uploads, setUploads] = useState([])
  const [latest, setLatest] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    getMyUploads().then((res) => setUploads(res.data.documents.slice(0, 2)))
    getCatalog().then((res) => setLatest((res.data.data ?? []).slice(0, 3)))
  }, [])

  return (
    <DashboardLayout role="teacher">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('dashboard.greeting', { name: user.first_name })}</h1>
          <p className="mt-2 text-on-surface-variant">{t('teacherDashboard.welcome')}</p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="flex items-center gap-2 rounded border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            <BellIcon width={18} height={18} />
            <span className="hidden sm:inline">{t('dashboard.notifications')}</span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant shadow-lg">
              {t('dashboard.noNotifications')}
            </div>
          )}
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-on-surface">{t('teacherDashboard.recentDeposits')}</h2>
          <Link to="/mes-depots" className="text-sm font-semibold text-primary hover:underline">
            {t('dashboard.seeAll')}
          </Link>
        </div>
        {uploads.length === 0 ? (
          <p className="text-on-surface-variant text-sm">{t('myDeposits.empty')}</p>
        ) : (
          <div className="space-y-3">
            {uploads.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                author={doc.author}
                subject={doc.subdomain?.name}
                coverUrl={doc.cover_url}
                date={formatDate(doc.uploaded_at)}
                actions={doc.deletion_requests?.some((r) => r.status === 'pending') && (
                  <StatusBadge status="pending" />
                )}
                onClick={() => navigate(`/documents/${doc.id}`)}
              />
            ))}
          </div>
        )}
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
