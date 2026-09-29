import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import DocumentCard from '../components/DocumentCard'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { getMyUploads, deleteDocument } from '../services/documents'
import { requestDeletion } from '../services/deletionRequests'
import { formatDate } from '../utils/format'
import { PlusIcon, PencilIcon, AlertTriangleIcon, InfoIcon } from '../components/icons'

export default function MyDeposits() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState(null)
  const [justification, setJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function load() {
    setLoading(true)
    getMyUploads()
      .then((res) => setDocuments(res.data.documents))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function pendingDeletion(doc) {
    return doc.deletion_requests?.find((r) => r.status === 'pending')
  }

  async function handleConfirmDeletion(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await requestDeletion(target.id, justification)
      setTarget(null)
      setJustification('')
      load()
    } catch (err) {
      if (err.response?.status === 409) {
        setError(t('myDeposits.alreadyPending'))
      } else {
        setError(t('myDeposits.genericError'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      await deleteDocument(toDelete.id)
      setToDelete(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout role={user.role}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('nav.myDeposits')}</h1>
          <p className="mt-2 text-on-surface-variant">{t('myDeposits.intro')}</p>
        </div>
        <Link
          to="/deposer-un-support"
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container sm:w-auto"
        >
          <PlusIcon width={18} height={18} />
          {t('myDeposits.newDeposit')}
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {!loading && documents.length === 0 && (
          <p className="text-on-surface-variant text-sm">{t('myDeposits.empty')}</p>
        )}
        {documents.map((doc) => {
          const pending = pendingDeletion(doc)
          return (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              subject={doc.subdomain?.name}
              coverUrl={doc.cover_url}
              date={formatDate(doc.uploaded_at)}
              onClick={() => navigate(`/documents/${doc.id}`)}
              actions={
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {pending ? (
                    <StatusBadge status="pending" />
                  ) : (
                    <>
                      <Link
                        to={`/mes-depots/${doc.id}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-1.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
                      >
                        <PencilIcon width={16} height={16} />
                        {t('common.edit')}
                      </Link>
                      {user.role === 'admin' ? (
                        <button
                          onClick={() => setToDelete(doc)}
                          className="text-sm font-semibold text-error hover:underline"
                        >
                          {t('common.delete')}
                        </button>
                      ) : (
                        <button
                          onClick={() => setTarget(doc)}
                          className="text-sm font-semibold text-error hover:underline"
                        >
                          {t('myDeposits.requestDeletion')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              }
            />
          )
        })}
      </div>

      {target && (
        <Modal
          title={t('myDeposits.requestDeletionTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error" />}
          onClose={() => setTarget(null)}
        >
          <form onSubmit={handleConfirmDeletion} className="space-y-4">
            <div className="flex gap-3 rounded-md bg-error-container p-4 text-sm text-on-error-container">
              <InfoIcon width={20} height={20} className="shrink-0 mt-0.5" />
              <p>{t('myDeposits.requestDeletionNotice')}</p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <label className="block">
              <span className="block text-sm font-semibold text-on-surface mb-1.5">
                {t('myDeposits.justificationLabel')}
              </span>
              <textarea
                required
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t('myDeposits.justificationPlaceholder')}
                className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary"
              />
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTarget(null)}
                className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90 disabled:opacity-60"
              >
                {t('myDeposits.confirmRequest')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <Modal
          title={t('myDeposits.deleteDocumentTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error" />}
          onClose={() => setToDelete(null)}
        >
          <p className="text-sm text-on-surface-variant">
            {t('myDeposits.deleteConfirmText', { title: toDelete.title })}
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setToDelete(null)}
              className="rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded bg-error px-4 py-2 text-sm font-semibold text-on-error hover:opacity-90 disabled:opacity-60"
            >
              {t('common.delete')}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
