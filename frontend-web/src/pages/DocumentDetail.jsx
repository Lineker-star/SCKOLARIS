import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { getDocument } from '../services/catalog'
import { downloadDocument } from '../services/documents'
import { removeFromLibrary } from '../services/library'
import { saveOfflineDocument, getOfflineDocument, removeOfflineDocument } from '../services/offlineStore'
import { formatDate } from '../utils/format'
import { BookOpenIcon, DownloadIcon, CalendarIcon, UserIcon, CheckIcon, TrashIcon, FileIcon } from '../components/icons'

// Chargé à la demande : pdf.js (~130 Ko gzippés) ne doit peser que sur les
// utilisateurs qui ouvrent effectivement le livre, pas sur chaque visite
// d'une fiche document.
const ReaderModal = lazy(() => import('../components/ReaderModal'))

// Récupère la couverture en tant que blob (pour un stockage hors-ligne
// réellement disponible sans réseau, comme le PDF) — retourne null si
// absente ou si la requête échoue, sans faire échouer le téléchargement.
async function fetchCoverBlob(coverUrl) {
  if (!coverUrl) return null
  try {
    const res = await fetch(coverUrl)
    return res.ok ? await res.blob() : null
  } catch {
    return null
  }
}

export default function DocumentDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const [doc, setDoc] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(null)
  const [reading, setReading] = useState(false)

  useEffect(() => {
    let cancelled = false

    getOfflineDocument(user.id, id)
      .then((offlineDoc) => {
        if (cancelled) return
        setOffline(offlineDoc)

        return getDocument(id)
          .then((res) => setDoc(res.data.document))
          .catch(() => {
            if (cancelled) return
            // Hors connexion (ou document supprimé côté serveur) : si une
            // copie a été téléchargée, on reconstruit la fiche à partir
            // d'elle plutôt que d'afficher "introuvable" — c'est justement
            // le cas d'usage de la bibliothèque hors ligne.
            if (offlineDoc) {
              setDoc({
                title: offlineDoc.title,
                author: offlineDoc.author,
                subdomain: offlineDoc.subject ? { name: offlineDoc.subject } : null,
                uploaded_at: offlineDoc.savedAt,
                cover_url: offlineDoc.coverBlob ? URL.createObjectURL(offlineDoc.coverBlob) : null,
              })
            } else {
              setNotFound(true)
            }
          })
      })
      .catch((err) => console.error('Échec de lecture du stockage hors ligne :', err))

    return () => {
      cancelled = true
    }
  }, [id, user.id])

  async function handleDownload() {
    setBusy('download')
    setError('')
    try {
      const res = await downloadDocument(id)
      const coverBlob = await fetchCoverBlob(doc.cover_url)
      await saveOfflineDocument(user.id, {
        id,
        title: doc.title,
        author: doc.author,
        subject: doc.subdomain?.name,
        mime: res.data.type,
        extension: doc.file_path?.split('.').pop(),
        blob: res.data,
        coverBlob,
      })
      setOffline(await getOfflineDocument(user.id, id))
    } catch (err) {
      if (err.response?.status === 403) {
        setError(t('documentDetail.downloadRequiresValidated'))
      } else {
        setError(t('documentDetail.downloadFailed'))
      }
    } finally {
      setBusy('')
    }
  }

  async function handleRemoveOffline() {
    await removeOfflineDocument(user.id, id)
    setOffline(null)
    // Propage le retrait au serveur — sinon la synchro d'un autre appareil
    // le re-téléchargerait ici au prochain lancement.
    removeFromLibrary(id).catch(() => {})
  }

  return (
    <DashboardLayout role={user.role}>
      {notFound && <p className="text-on-surface-variant">{t('documentDetail.notFound')}</p>}

      {doc && (
        <div className="max-w-3xl flex flex-col sm:flex-row gap-6">
          <div className="shrink-0 self-start w-40 sm:w-52">
            {doc.cover_url ? (
              <img
                src={doc.cover_url}
                alt={doc.title}
                className="w-full aspect-[3/4] rounded-lg object-cover border border-outline-variant shadow-sm"
              />
            ) : (
              <div className="w-full aspect-[3/4] rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center">
                <FileIcon width={40} height={40} className="text-on-surface-variant" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {doc.subdomain && (
              <span className="inline-flex rounded bg-surface-container-high px-2.5 py-1 text-xs font-semibold">
                {doc.subdomain.domain?.name ? `${doc.subdomain.domain.name} › ${doc.subdomain.name}` : doc.subdomain.name}
              </span>
            )}
            <h1 className="mt-3 text-3xl font-bold text-primary">{doc.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant text-sm">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon width={16} height={16} /> {doc.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon width={16} height={16} /> {formatDate(doc.uploaded_at)}
              </span>
              {doc.program && <span>· {doc.program}</span>}
            </div>

            {doc.summary && <p className="mt-6 text-on-surface leading-relaxed">{doc.summary}</p>}

            {error && <p className="mt-4 text-sm text-error">{error}</p>}

            {offline && (
              <p className="mt-4 inline-flex items-center gap-2 rounded bg-success-container px-3 py-2 text-sm font-semibold text-success">
                <CheckIcon width={16} height={16} />
                {t('documentDetail.availableOffline')}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setReading(true)}
                className="inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
              >
                <BookOpenIcon width={18} height={18} />
                {t('documentDetail.readOnline')}
              </button>

              {!offline ? (
                <button
                  onClick={handleDownload}
                  disabled={busy === 'download'}
                  className="inline-flex items-center gap-2 rounded border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container disabled:opacity-60"
                >
                  <DownloadIcon width={18} height={18} />
                  {busy === 'download' ? t('documentDetail.downloading') : t('common.download')}
                </button>
              ) : (
                <button
                  onClick={handleRemoveOffline}
                  className="inline-flex items-center gap-2 rounded border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
                >
                  <TrashIcon width={18} height={18} />
                  {t('documentDetail.removeFromDownloads')}
                </button>
              )}
            </div>
            <p className="mt-3 text-xs text-on-surface-variant">{t('documentDetail.syncNotice')}</p>
          </div>
        </div>
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
          <ReaderModal documentId={id} title={doc?.title} onClose={() => setReading(false)} />
        </Suspense>
      )}
    </DashboardLayout>
  )
}
