import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { getAiDocuments, getAiUsageStats, indexAiDocument } from '../services/ai'
import { SparklesIcon, ClockIcon, UploadCloudIcon } from '../components/icons'

const STATUS_STYLES = {
  indexed: 'bg-success-container text-success',
  pending: 'bg-surface-container-high text-on-surface-variant',
  processing: 'bg-secondary-container text-on-secondary-container',
  failed: 'bg-error-container text-on-error-container',
  too_large: 'bg-error-container text-on-error-container',
  unsupported_format: 'bg-surface-container-highest text-on-surface-variant',
}

function StatusPill({ status }) {
  const { t } = useTranslation()
  const labels = {
    indexed: t('aiAdmin.statusIndexed'),
    pending: t('aiAdmin.statusPending'),
    processing: t('aiAdmin.statusProcessing'),
    failed: t('aiAdmin.statusFailed'),
    too_large: t('aiAdmin.statusTooLarge'),
    unsupported_format: t('aiAdmin.statusUnsupportedFormat'),
  }
  return (
    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.pending}`}>
      {labels[status] ?? status}
    </span>
  )
}

export default function AiAdministration() {
  const { t } = useTranslation()
  const [documents, setDocuments] = useState([])
  const [counts, setCounts] = useState(null)
  const [usage, setUsage] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [indexing, setIndexing] = useState(null)

  function load() {
    getAiDocuments(statusFilter).then((res) => {
      setDocuments(res.data.documents.data)
      setCounts(res.data.counts)
    })
    getAiUsageStats().then((res) => setUsage(res.data))
  }

  useEffect(load, [statusFilter])

  async function handleIndex(document, force) {
    setIndexing(document.id)
    try {
      await indexAiDocument(document.id, force)
      load()
    } finally {
      setIndexing(null)
    }
  }

  return (
    <DashboardLayout role="admin">
      <h1 className="text-3xl font-bold text-primary">{t('aiAdmin.title')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('aiAdmin.subtitle')}</p>

      <div className="mt-6 grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatTile icon={<SparklesIcon />} label={t('aiAdmin.statusIndexed')} value={counts?.indexed} onClick={() => setStatusFilter('indexed')} />
        <StatTile icon={<ClockIcon />} label={t('aiAdmin.statusPending')} value={counts?.pending} onClick={() => setStatusFilter('pending')} />
        <StatTile icon={<UploadCloudIcon />} label={t('aiAdmin.statusProcessing')} value={counts?.processing} onClick={() => setStatusFilter('processing')} />
        <StatTile label={t('aiAdmin.statusFailed')} value={counts?.failed} onClick={() => setStatusFilter('failed')} />
        <StatTile label={t('aiAdmin.statusTooLarge')} value={counts?.too_large} onClick={() => setStatusFilter('too_large')} />
        <StatTile label={t('aiAdmin.statusUnsupportedFormat')} value={counts?.unsupported_format} onClick={() => setStatusFilter('unsupported_format')} />
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <StatTile label={t('aiAdmin.requests30d')} value={usage?.total_requests_30d} />
        <StatTile label={t('aiAdmin.avgLatency')} value={usage?.average_latency_ms != null ? `${usage.average_latency_ms} ms` : undefined} />
      </div>

      {statusFilter && (
        <button onClick={() => setStatusFilter('')} className="mt-4 text-sm text-primary underline">
          {t('common.reset')}
        </button>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full text-sm">
          <thead className="bg-surface-container text-left text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">{t('aiAdmin.documentTitle')}</th>
              <th className="px-4 py-3">{t('aiAdmin.status')}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="border-t border-outline-variant">
                <td className="px-4 py-3 text-on-surface">{document.title}</td>
                <td className="px-4 py-3">
                  <StatusPill status={document.ai_index_status} />
                  {document.ai_index_error && (
                    <p className="mt-1 max-w-xs text-xs text-on-surface-variant">{document.ai_index_error}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleIndex(document, document.ai_index_status === 'indexed')}
                    disabled={indexing === document.id}
                    className="rounded border border-outline px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container disabled:opacity-50"
                  >
                    {document.ai_index_status === 'indexed' ? t('aiAdmin.reindex') : t('aiAdmin.index')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}

function StatTile({ icon, label, value, onClick }) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper onClick={onClick} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 text-left">
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-primary">
          {icon}
        </div>
      )}
      <p className="mt-3 text-2xl font-bold text-on-surface">{value ?? '—'}</p>
      <p className="text-xs text-on-surface-variant">{label}</p>
    </Wrapper>
  )
}
