import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import TextField from '../components/TextField'
import { useAuth } from '../context/AuthContext'
import { createDocument } from '../services/documents'
import { getDomains } from '../services/domains'
import { UploadCloudIcon, InfoIcon, CameraIcon } from '../components/icons'

export default function DepositCourse() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const coverInputRef = useRef(null)
  const [domains, setDomains] = useState([])
  const [selectedDomainId, setSelectedDomainId] = useState('')
  const [customProgramSelected, setCustomProgramSelected] = useState(false)
  const [form, setForm] = useState({ title: '', subdomain_id: '', program: '', summary: '' })
  const [file, setFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
  }, [])

  const selectedDomain = domains.find((d) => String(d.id) === selectedDomainId)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function pickFile(fileList) {
    if (fileList?.[0]) setFile(fileList[0])
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

    if (!file) {
      setErrors({ file: t('deposit.fileRequired') })
      return
    }

    setSubmitting(true)
    try {
      await createDocument({
        ...form,
        author: `${user.first_name} ${user.last_name}`,
        file,
        cover: coverFile,
      })
      navigate('/mes-depots')
    } catch (err) {
      const response = err.response
      if (response?.status === 422) {
        const fieldErrors = {}
        for (const [field, messages] of Object.entries(response.data.errors ?? {})) {
          fieldErrors[field] = messages[0]
        }
        setErrors(fieldErrors)
      } else {
        setFormError(t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('deposit.title')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('deposit.intro')}</p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 grid lg:grid-cols-2 gap-8"
      >
        <div className="space-y-5">
          {formError && <p className="rounded bg-error-container text-on-error-container text-sm p-3">{formError}</p>}

          <TextField
            label={t('deposit.titleLabel')}
            required
            placeholder={t('deposit.titlePlaceholder')}
            value={form.title}
            onChange={update('title')}
            error={errors.title}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.domain')}</span>
              <select
                required
                value={selectedDomainId}
                onChange={(e) => {
                  setSelectedDomainId(e.target.value)
                  setCustomProgramSelected(false)
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

          <label className="block">
            <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.program')}</span>
            <select
              required
              value={customProgramSelected ? 'other' : form.program}
              onChange={(event) => {
                const isOther = event.target.value === 'other'
                setCustomProgramSelected(isOther)
                setForm((current) => ({ ...current, program: isOther ? '' : event.target.value }))
              }}
              disabled={!selectedDomain}
              className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary disabled:opacity-50"
            >
              <option value="">{selectedDomain ? t('deposit.select') : t('profile.selectDomainFirst')}</option>
              {selectedDomain?.subdomains.map((subdomain) => <option key={subdomain.id} value={subdomain.name}>{subdomain.name}</option>)}
              {selectedDomain ? <option value="other">{t('profile.other')}</option> : null}
            </select>
            {customProgramSelected ? <TextField className="mt-2" placeholder={t('profile.otherProgramPlaceholder')} value={form.program} onChange={update('program')} error={errors.program} /> : null}
            {errors.program && <span className="block text-sm text-error mt-1">{errors.program}</span>}
          </label>

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

          <div className="flex gap-3 rounded-md bg-surface-container-high p-4 text-sm text-on-surface-variant">
            <InfoIcon width={20} height={20} className="shrink-0 mt-0.5" />
            <p>{t('deposit.indexNotice')}</p>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="block text-sm font-semibold text-on-surface mb-1.5">{t('deposit.attachedFiles')}</span>
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              pickFile(e.dataTransfer.files)
            }}
            className={`flex flex-1 min-h-64 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-surface-container' : 'border-outline-variant'
            }`}
          >
            <UploadCloudIcon width={40} height={40} className="text-on-surface-variant" />
            {file ? (
              <p className="font-semibold text-on-surface">{file.name}</p>
            ) : (
              <>
                <p className="font-semibold text-on-surface">{t('deposit.dropHere')}</p>
                <p className="text-sm text-on-surface-variant">{t('deposit.acceptedFormats')}</p>
              </>
            )}
            <span className="mt-2 inline-flex items-center rounded border border-outline px-4 py-2 text-sm font-semibold text-on-surface">
              {t('deposit.browseFiles')}
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.pptx"
              className="hidden"
              onChange={(e) => pickFile(e.target.files)}
            />
          </label>
          {errors.file && <span className="text-sm text-error mt-1">{errors.file}</span>}

          <div className="flex justify-end gap-3 mt-6">
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
              {submitting ? t('deposit.publishing') : t('deposit.publish')}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
