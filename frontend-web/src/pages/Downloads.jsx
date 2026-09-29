import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { getAppReleases, uploadAppRelease, deleteAppRelease } from '../services/appReleases'
import { AlertTriangleIcon, DownloadIcon, MonitorIcon, SmartphoneIcon, TrashIcon, UploadCloudIcon } from '../components/icons'

export default function Downloads() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [releases, setReleases] = useState({})
  const [versionDrafts, setVersionDrafts] = useState({})
  const [files, setFiles] = useState({})
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null) // clé de plateforme, ou null
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const PLATFORMS = [
    { key: 'windows', label: t('downloads.windows'), hint: t('downloads.windowsHint'), icon: MonitorIcon },
    { key: 'android', label: 'Android', hint: t('downloads.androidHint'), icon: SmartphoneIcon },
  ]

  function load() {
    getAppReleases().then((res) => setReleases(res.data.releases))
  }

  useEffect(load, [])

  function pickFile(platform, file) {
    setFiles((prev) => ({ ...prev, [platform]: file ?? null }))
    setError('')
  }

  async function handlePublish(platform) {
    const version = versionDrafts[platform]?.trim()
    const file = files[platform]
    if (!version) {
      setError(t('downloads.versionRequired'))
      return
    }
    if (!file) {
      setError(t('downloads.fileRequired'))
      return
    }
    setUploading(platform)
    setError('')
    try {
      await uploadAppRelease(platform, version, file)
      setFiles((prev) => ({ ...prev, [platform]: null }))
      setVersionDrafts((prev) => ({ ...prev, [platform]: '' }))
      load()
    } catch {
      setError(t('downloads.uploadFailed'))
    } finally {
      setUploading('')
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      await deleteAppRelease(toDelete)
      setToDelete(null)
      load()
    } catch {
      setDeleteError(t('downloads.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  const platformLabel = PLATFORMS.find((p) => p.key === toDelete)?.label

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('nav.downloadApp')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('downloads.intro')}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 max-w-2xl">
        {PLATFORMS.map(({ key, label, hint, icon: Icon }) => {
          const release = releases[key]
          const file = files[key]
          return (
            <div
              key={key}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5"
            >
              <Icon width={28} height={28} className="text-primary" />
              <p className="mt-3 font-semibold text-on-surface">{label}</p>
              <p className="text-sm text-on-surface-variant">{hint}</p>

              {release ? (
                <>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={release.url}
                      className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container"
                    >
                      <DownloadIcon width={16} height={16} />
                      {t('common.download')}
                    </a>
                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setToDelete(key)
                          setDeleteError('')
                        }}
                        className="inline-flex items-center gap-2 rounded border border-error px-3 py-2 text-sm font-semibold text-error hover:bg-error-container"
                      >
                        <TrashIcon width={16} height={16} />
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                  {release.version && (
                    <p className="mt-1.5 text-xs text-on-surface-variant">
                      {t('downloads.version')} {release.version}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-4 text-sm text-on-surface-variant">{t('downloads.notAvailable')}</p>
              )}

              {user.role === 'admin' && (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder={t('downloads.versionPlaceholder')}
                    value={versionDrafts[key] ?? ''}
                    onChange={(e) => setVersionDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                    disabled={uploading === key}
                    className="block w-full rounded border border-outline px-2.5 py-1.5 text-xs disabled:opacity-60"
                  />
                  <label className="block text-xs text-on-surface-variant">
                    {release ? t('downloads.replaceFile') : t('downloads.uploadFile')} :
                    <input
                      type="file"
                      accept={key === 'windows' ? '.exe' : '.apk'}
                      disabled={uploading === key}
                      onChange={(e) => pickFile(key, e.target.files?.[0])}
                      className="mt-1.5 block w-full text-xs text-on-surface-variant file:mr-3 file:rounded file:border file:border-outline file:bg-surface-container file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-on-surface"
                    />
                  </label>
                  {file && (
                    <p className="text-xs text-on-surface-variant">
                      {t('downloads.chosenFile')} {file.name}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePublish(key)}
                    disabled={uploading === key || !file}
                    className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
                  >
                    <UploadCloudIcon width={14} height={14} />
                    {uploading === key ? t('downloads.publishing') : t('downloads.publish')}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <p className="mt-6 max-w-2xl text-xs text-on-surface-variant">{t('downloads.iosNotice')}</p>

      {toDelete && (
        <Modal
          title={t('downloads.deleteInstallerTitle')}
          icon={<AlertTriangleIcon width={22} height={22} className="text-error" />}
          onClose={() => setToDelete(null)}
        >
          <p className="text-sm text-on-surface-variant">
            {t('downloads.deleteConfirmText', { platform: platformLabel })}
          </p>
          {deleteError && <p className="mt-2 text-sm text-error">{deleteError}</p>}
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
              {deleting ? t('downloads.deleting') : t('common.delete')}
            </button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}
