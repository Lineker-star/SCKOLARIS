import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { getDeletionRequests } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { CheckIcon } from '../components/icons'

export default function PendingDeletionRequests() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDeletionRequests()
      .then((res) => setRequests(res.data.deletion_requests))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold text-primary">{t('deletionRequests.title')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('deletionRequests.intro')}</p>

      <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden">
        {!loading && requests.length === 0 && (
          <p className="p-6 text-sm text-on-surface-variant">{t('deletionRequests.empty')}</p>
        )}

        {requests.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant text-left text-on-surface-variant">
                  <th className="px-6 py-3 font-medium">{t('deletionRequests.document')}</th>
                  <th className="px-6 py-3 font-medium hidden md:table-cell">{t('deletionRequests.teacher')}</th>
                  <th className="px-6 py-3 font-medium hidden sm:table-cell">{t('deletionRequests.subject')}</th>
                  <th className="px-6 py-3 font-medium hidden lg:table-cell">{t('deletionRequests.date')}</th>
                  <th className="px-6 py-3 font-medium text-right">{t('deletionRequests.action')}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant last:border-0">
                    <td className="px-6 py-4 font-semibold text-on-surface">{r.document?.title}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {r.document?.depositor?.first_name} {r.document?.depositor?.last_name}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="inline-flex rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium">
                        {r.document?.subdomain?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-on-surface-variant">
                      {formatDate(r.requested_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/demandes-de-suppression/${r.id}`}
                        className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:bg-primary-container"
                      >
                        <CheckIcon width={14} height={14} />
                        {t('deletionRequests.review')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {requests.length > 0 && (
          <p className="px-6 py-3 text-xs text-on-surface-variant border-t border-outline-variant">
            {t('deletionRequests.showing', { count: requests.length })}
          </p>
        )}
      </div>
    </DashboardLayout>
  )
}
