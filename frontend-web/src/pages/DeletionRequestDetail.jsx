import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import { getDeletionRequests, processDeletionRequest } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { ArrowLeftIcon, XIcon, CheckIcon, InfoIcon } from '../components/icons'

export default function DeletionRequestDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getDeletionRequests().then((res) => {
      const found = res.data.deletion_requests.find((r) => String(r.id) === id)
      if (found) setRequest(found)
      else setNotFound(true)
    })
  }, [id])

  async function decide(decision) {
    setSubmitting(true)
    setError('')
    try {
      await processDeletionRequest(id, decision)
      navigate('/demandes-de-suppression')
    } catch {
      setError(t('common.error'))
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <Link
        to="/demandes-de-suppression"
        className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface"
      >
        <ArrowLeftIcon width={16} height={16} />
        {t('userDetail.backToList')}
      </Link>
      <h1 className="mt-3 text-3xl font-bold text-primary">{t('deletionRequestDetail.title')}</h1>

      {notFound && <p className="mt-6 text-on-surface-variant">{t('deletionRequestDetail.notFound')}</p>}

      {request && (
        <div className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label={t('deletionRequestDetail.documentTitle')} value={request.document?.title} strong />
            <Field label={t('deletionRequestDetail.originalAuthor')} value={request.document?.author} />
            <Field
              label={t('deletionRequestDetail.depositedBy')}
              value={`${request.document?.depositor?.first_name ?? ''} ${request.document?.depositor?.last_name ?? ''}`}
            />
            <Field label={t('deletionRequestDetail.subjectCourse')} value={request.document?.subdomain?.name} />
            <Field label={t('deletionRequestDetail.requestDate')} value={formatDate(request.requested_at)} />
            <div>
              <p className="text-xs font-semibold uppercase text-on-surface-variant">{t('deletionRequestDetail.status')}</p>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-outline-variant">
            <p className="flex items-center gap-2 font-semibold text-on-surface mb-2">
              <InfoIcon width={18} height={18} />
              {t('deletionRequestDetail.reason')}
            </p>
            <p className="rounded-md border border-outline-variant p-4 text-on-surface-variant">
              {request.justification}
            </p>
          </div>

          {error && <p className="mt-4 text-sm text-error">{error}</p>}

          <div className="mt-6 flex flex-wrap justify-end gap-3 pt-6 border-t border-outline-variant">
            <button
              disabled={submitting}
              onClick={() => decide('rejected')}
              className="inline-flex items-center gap-2 rounded border border-error px-4 py-2.5 text-sm font-semibold text-error hover:bg-error-container disabled:opacity-60"
            >
              <XIcon width={16} height={16} />
              {t('deletionRequestDetail.rejectRequest')}
            </button>
            <button
              disabled={submitting}
              onClick={() => decide('approved')}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
            >
              <CheckIcon width={16} height={16} />
              {t('deletionRequestDetail.approveRequest')}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function Field({ label, value, strong }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-on-surface-variant">{label}</p>
      <p className={strong ? 'mt-1 text-lg font-semibold text-on-surface' : 'mt-1 text-on-surface'}>
        {value || '—'}
      </p>
    </div>
  )
}
