import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as pdfjsLib from 'pdfjs-dist'
import { getReadLink } from '../services/documents'
import { getOfflineDocument } from '../services/offlineStore'
import { useAuth } from '../context/AuthContext'
import { ArrowLeftIcon, ArrowRightIcon, MaximizeIcon, MinimizeIcon, XIcon } from './icons'

// Rendu manuel du PDF sur un <canvas> (pdf.js), au lieu de naviguer vers le
// fichier et de compter sur le visionneur natif du navigateur : sur
// certains téléphones Android, Chrome est réglé pour TÉLÉCHARGER les PDF
// plutôt que les afficher — un réglage que le site ne peut pas contrôler.
// En rendant nous-mêmes les pages, le navigateur ne voit jamais "un PDF à
// ouvrir", donc ce réglage ne peut plus jamais s'appliquer.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

// Modal plutôt que route dédiée (l'ancien /documents/:id/lire) : ouvrir/
// fermer un modal ne fait que changer un état local, sans jamais recharger
// le fichier JS d'une autre page. Sur l'app desktop (fenêtre Electron
// ouverte parfois pendant des semaines, voir ErrorBoundary.jsx), revenir à
// une page ainsi chargée à la demande pouvait échouer si un déploiement
// avait eu lieu entre-temps — plus aucun risque de ce type ici, puisque la
// page d'où on a ouvert le livre (Ma bibliothèque, Fiche document) reste
// montée en arrière-plan pendant toute la lecture.
export default function ReaderModal({ documentId, title: initialTitle, onClose }) {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [title, setTitle] = useState(initialTitle || '')
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [expanded, setExpanded] = useState(false)

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const pdfRef = useRef(null)
  const renderTaskRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const offlineDoc = await getOfflineDocument(user.id, documentId)
        let loadingTask
        if (offlineDoc) {
          if (!initialTitle) setTitle(offlineDoc.title)
          loadingTask = pdfjsLib.getDocument({ data: await offlineDoc.blob.arrayBuffer() })
        } else {
          const res = await getReadLink(documentId)
          loadingTask = pdfjsLib.getDocument({ url: res.data.url })
        }
        const pdf = await loadingTask.promise
        if (cancelled) return
        pdfRef.current = pdf
        setNumPages(pdf.numPages)
        setPageNum(1)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        console.error('Échec de chargement du document :', err)
        setStatus('error')
      }
    }

    load()

    return () => {
      cancelled = true
      // Annule d'abord un éventuel rendu de page en cours : sans ça,
      // détruire le document pendant qu'une page est en train de se
      // dessiner peut faire rejeter sa promesse avec une erreur qui n'est
      // pas "RenderingCancelledException" (voir renderPage), donc relancée
      // — et comme React capture les erreurs des fonctions de nettoyage
      // d'effet, ça faisait planter tout l'arbre à la fermeture du modal.
      renderTaskRef.current?.cancel()
      try {
        // destroy() renvoie une promesse : on intercepte aussi son rejet,
        // pas seulement un éventuel throw synchrone.
        Promise.resolve(pdfRef.current?.destroy()).catch((err) =>
          console.error('Échec (sans gravité) de la fermeture du document :', err),
        )
      } catch (err) {
        console.error('Échec (sans gravité) de la fermeture du document :', err)
      }
      pdfRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, user.id])

  useEffect(() => {
    if (status !== 'ready') return
    renderPage(pageNum)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pageNum, expanded])

  useEffect(() => {
    function handleResize() {
      if (status === 'ready') renderPage(pageNum)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pageNum])

  async function renderPage(num) {
    const pdf = pdfRef.current
    const canvas = canvasRef.current
    if (!pdf || !canvas) return

    renderTaskRef.current?.cancel()

    const page = await pdf.getPage(num)
    const containerWidth = Math.min(containerRef.current?.clientWidth || 800, 900)
    const unscaledWidth = page.getViewport({ scale: 1 }).width
    const scale = containerWidth / unscaledWidth
    const viewport = page.getViewport({ scale })

    // Rendu à la résolution physique de l'écran (au lieu de sa résolution
    // logique) pour rester net sur les écrans à forte densité de pixels —
    // le cas le plus fréquent en lecture sur téléphone.
    const outputScale = window.devicePixelRatio || 1
    canvas.width = Math.floor(viewport.width * outputScale)
    canvas.height = Math.floor(viewport.height * outputScale)
    canvas.style.width = `${Math.floor(viewport.width)}px`
    canvas.style.height = `${Math.floor(viewport.height)}px`

    const context = canvas.getContext('2d')
    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null

    const task = page.render({ canvasContext: context, viewport, transform })
    renderTaskRef.current = task
    try {
      await task.promise
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') throw err
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 p-0 sm:p-6">
      <div
        className={`flex w-full flex-col bg-surface shadow-lg transition-all ${
          expanded ? 'h-full max-w-full rounded-none' : 'h-full max-w-4xl rounded-lg sm:h-[85vh]'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface">
            {title || t('reader.title')}
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? t('reader.reduce') : t('reader.expand')}
              className="text-on-surface-variant hover:text-on-surface"
            >
              {expanded ? <MinimizeIcon width={20} height={20} /> : <MaximizeIcon width={20} height={20} />}
            </button>
            <button
              onClick={onClose}
              aria-label={t('common.close')}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <XIcon width={22} height={22} />
            </button>
          </div>
        </header>

        <div ref={containerRef} className="flex-1 overflow-auto">
          {status === 'loading' && (
            <p className="mt-10 text-center text-sm text-on-surface-variant">{t('reader.loading')}</p>
          )}
          {status === 'error' && (
            <p className="mt-10 text-center text-sm text-error">{t('reader.loadError')}</p>
          )}
          {status === 'ready' && (
            <div className="flex justify-center py-4">
              <canvas ref={canvasRef} className="shadow-sm" />
            </div>
          )}
        </div>

        {status === 'ready' && (
          <footer className="flex items-center justify-center gap-6 border-t border-outline-variant px-4 py-3">
            <button
              onClick={() => setPageNum((n) => Math.max(1, n - 1))}
              disabled={pageNum <= 1}
              aria-label={t('reader.previousPage')}
              className="text-on-surface-variant hover:text-on-surface disabled:opacity-30"
            >
              <ArrowLeftIcon width={20} height={20} />
            </button>
            <span className="text-sm text-on-surface-variant">
              {t('catalog.pageOf', { current: pageNum, last: numPages })}
            </span>
            <button
              onClick={() => setPageNum((n) => Math.min(numPages, n + 1))}
              disabled={pageNum >= numPages}
              aria-label={t('reader.nextPage')}
              className="text-on-surface-variant hover:text-on-surface disabled:opacity-30"
            >
              <ArrowRightIcon width={20} height={20} />
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
