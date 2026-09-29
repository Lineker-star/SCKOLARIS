import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import DocumentCard from '../components/DocumentCard'
import { useAuth } from '../context/AuthContext'
import { listOfflineDocuments, removeOfflineDocument } from '../services/offlineStore'
import { removeFromLibrary } from '../services/library'
import { LIBRARY_SYNC_START, LIBRARY_SYNC_END } from '../services/librarySync'
import { formatDate } from '../utils/format'
import { BookOpenIcon, TrashIcon, WifiOffIcon } from '../components/icons'

// Chargé à la demande : pdf.js (~130 Ko gzippés) ne doit peser que sur les
// utilisateurs qui ouvrent effectivement un livre, pas sur le premier
// chargement de cette liste.
const ReaderModal = lazy(() => import('../components/ReaderModal'))

export default function MyLibrary() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [reading, setReading] = useState(null) // { documentId, title } | null

  function load() {
    listOfflineDocuments(user.id)
      .then((docs) => {
        const sorted = docs.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
        setDocuments(
          sorted.map((doc) => ({
            ...doc,
            coverObjectUrl: doc.coverBlob ? URL.createObjectURL(doc.coverBlob) : null,
          })),
        )
      })
      .catch((err) => {
        console.error('Échec de lecture de la bibliothèque hors ligne :', err)
        setDocuments([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [user.id])

  // Une synchro peut être en cours (déclenchée à la connexion, voir
  // DashboardLayout) ou démarrer pendant que cette page est ouverte —
  // on recharge la liste locale dès qu'elle se termine.
  useEffect(() => {
    function handleStart() {
      setSyncing(true)
    }
    function handleEnd() {
      setSyncing(false)
      load()
    }
    window.addEventListener(LIBRARY_SYNC_START, handleStart)
    window.addEventListener(LIBRARY_SYNC_END, handleEnd)
    return () => {
      window.removeEventListener(LIBRARY_SYNC_START, handleStart)
      window.removeEventListener(LIBRARY_SYNC_END, handleEnd)
    }
  }, [])

  // Les URL d'objet créées pour les couvertures ne sont utiles que pendant
  // que le composant affiche cette liste — on les révoque au démontage pour
  // ne pas accumuler de références mémoire.
  useEffect(() => {
    return () => documents.forEach((doc) => doc.coverObjectUrl && URL.revokeObjectURL(doc.coverObjectUrl))
  }, [documents])

  async function handleRemove(documentId, e) {
    e.stopPropagation()
    await removeOfflineDocument(user.id, documentId)
    load()
    removeFromLibrary(documentId).catch(() => {})
  }

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('nav.myLibrary')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('myLibrary.intro')}</p>

      {syncing && <p className="mt-4 text-sm text-on-surface-variant">{t('myLibrary.syncing')}</p>}

      {!loading && documents.length === 0 && (
        <p className="mt-8 text-on-surface-variant text-sm">{t('myLibrary.empty')}</p>
      )}

      <div className="mt-8 space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            title={doc.title}
            author={doc.author}
            subject={doc.subject}
            coverUrl={doc.coverObjectUrl}
            date={formatDate(doc.savedAt)}
            onClick={() => navigate(`/documents/${doc.documentId}`)}
            actions={
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setReading({ documentId: doc.documentId, title: doc.title })
                  }}
                  className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-1.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  <BookOpenIcon width={16} height={16} />
                  {t('common.read')}
                </button>
                <button
                  onClick={(e) => handleRemove(doc.documentId, e)}
                  aria-label={t('myLibrary.remove')}
                  className="text-on-surface-variant hover:text-error"
                >
                  <TrashIcon width={18} height={18} />
                </button>
              </div>
            }
          />
        ))}
      </div>

      {documents.length > 0 && (
        <p className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant">
          <WifiOffIcon width={14} height={14} />
          {t('myLibrary.offlineNotice')}
        </p>
      )}

      {reading && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60">
              <p className="rounded-lg bg-surface px-6 py-4 text-sm text-on-surface-variant">
                {t('reader.loading')}
              </p>
            </div>
          }
        >
          <ReaderModal
            documentId={reading.documentId}
            title={reading.title}
            onClose={() => setReading(null)}
          />
        </Suspense>
      )}
    </DashboardLayout>
  )
}
