import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { getDocument } from '../services/catalog'
import { updateDocument } from '../services/documents'
import { getDomains } from '../services/domains'
import { UploadCloudIcon, CameraIcon } from '../components/icons'

export default function EditDeposit() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const coverInputRef = useRef(null)
  const [domains, setDomains] = useState([])
  const [selectedDomainId, setSelectedDomainId] = useState('')
  const [form, setForm] = useState(null)
  const [file, setFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
    getDocument(id).then((res) => {
      const doc = res.data.document
      setForm({ title: doc.title, subdomain_id: doc.subdomain_id ?? '', program: doc.program ?? '', summary: doc.summary ?? '' })
      if (doc.subdomain?.domain_id) setSelectedDomainId(String(doc.subdomain.domain_id))
      if (doc.cover_url) setCoverPreview(doc.cover_url)
    })
  }, [id])

  const selectedDomain = domains.find((d) => String(d.id) === selectedDomainId)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function pickCover(e) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setCoverFile(picked)
    setCoverPreview(URL.createObjectURL(picked))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      await updateDocument(id, { ...form, ...(file ? { file } : {}), ...(coverFile ? { cover: coverFile } : {}) })
      navigate('/mes-depots')
    } catch (err) {
      const response = err.response
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else if (response?.status === 403) {
        setFormError(t('editDeposit.forbidden'))
      } else {
        setFormError(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return (
      <DashboardLayout role={user.role}>
        <p className="text-on-surface-variant">{t('common.loading')}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('editDeposit.title')}</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-xl rounded-lg border border-outline-variant bg-surface-container-lowest p-6 space-y-5"
      >
        {formError && <p className="rounded bg-error-container text-on-error-container text-sm p-3">{formError}</p>}

        <TextField label={t('deposit.titleLabel')} required value={form.title} onChange={update('title')} error={errors.title} />

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.domain')}</span>
            <select
              required
              value={selectedDomainId}
              onChange={(e) => {
                setSelectedDomainId(e.target.value)
                setForm((f) => ({ ...f, subdomain_id: '' }))
              }}
              className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary"
            >
              <option value="">{t('deposit.select')}</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.subdomain')}</span>
            <select
              required
              value={form.subdomain_id}
              onChange={update('subdomain_id')}
              disabled={!selectedDomain}
              className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary disabled:opacity-50"
            >
              <option value="">{t('deposit.select')}</option>
              {selectedDomain?.subdomains.map((subdomain) => (
                <option key={subdomain.id} value={subdomain.id}>
                  {subdomain.name}
                </option>
              ))}
            </select>
            {errors.subdomain_id && <span className="block text-sm text-error mt-1">{errors.subdomain_id}</span>}
          </label>
        </div>

        <TextField label={t('deposit.program')} value={form.program} onChange={update('program')} error={errors.program} />

        <label className="block">
          <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.summary')}</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={update('summary')}
            className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary"
          />
        </label>

        <div>
          <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.coverImage')}</span>
          <div className="flex items-center gap-4">
            {coverPreview && (
              <img src={coverPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            )}
            <div>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container"
              >
                <CameraIcon width={16} height={16} />
                {coverPreview ? t('deposit.changeImage') : t('deposit.addImage')}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={pickCover}
                className="hidden"
              />
              <p className="mt-1.5 text-xs text-on-surface-variant">{t('deposit.coverHint')}</p>
              {errors.cover && <p className="mt-1 text-xs text-error">{errors.cover}</p>}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('editDeposit.replaceFile')}</span>
          <input
            type="file"
            accept=".pdf,.docx,.pptx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-on-surface-variant file:mr-3 file:rounded file:border file:border-outline file:bg-surface-container-lowest file:px-3 file:py-2 file:text-sm file:font-semibold"
          />
          {errors.file && <span className="block text-sm text-error mt-1">{errors.file}</span>}
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/mes-depots')}
            className="rounded border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface hover:bg-surface-container"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60"
          >
            <UploadCloudIcon width={16} height={16} />
            {submitting ? t('editDeposit.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}
