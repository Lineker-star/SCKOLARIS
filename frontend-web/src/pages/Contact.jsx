import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TextField from '../components/TextField'
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, SendIcon, CheckIcon } from '../components/icons'
import { BRAND_NAME, CONTACT_EMAIL, CONTACT_PHONES } from '../config/brand'

const initialForm = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const hours = [
    [t('contact.hoursTitle'), t('contact.hours.available')],
  ]

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const payload = new FormData()
    payload.append('Nom_complet', form.name)
    payload.append('Adresse_email', form.email)
    payload.append('Sujet', form.subject)
    payload.append('Message', form.message)
    payload.append('Origine', `Formulaire de contact — ${BRAND_NAME}`)
    payload.append('_subject', `${BRAND_NAME} — Nouveau message : ${form.subject}`)
    payload.append('_template', 'table')
    payload.append('_captcha', 'false')
    payload.append(
      '_autoresponse',
      `Bonjour,\n\nNous avons bien reçu votre message et vous répondrons dans les plus brefs délais.\n\nL'équipe ${BRAND_NAME}`,
    )
    payload.append('_honey', '')

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: payload,
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('sent')
      setForm(initialForm)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 py-12 md:py-16 grid md:grid-cols-2 gap-10">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{t('contact.title')}</h1>
            <p className="mt-4 text-on-surface-variant leading-relaxed max-w-md">{t('contact.intro')}</p>

            <div className="mt-8 space-y-4">
              <InfoBlock icon={<MapPinIcon />} title={t('contact.addressTitle')}>
                {t('contact.addressLine1')}
                <br />
                {t('contact.addressLine2')}
                <br />
                {t('footer.location')}
              </InfoBlock>

              <InfoBlock icon={<PhoneIcon />} title={t('contact.assistanceTitle')}>
                {CONTACT_PHONES.map((phone) => (
                  <a key={phone} href={`tel:+237${phone.replaceAll(' ', '')}`} className="flex items-center gap-2 hover:text-primary">
                    <PhoneIcon width={16} height={16} /> {phone}
                  </a>
                ))}
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2 hover:text-primary mt-1">
                  <MailIcon width={16} height={16} /> {CONTACT_EMAIL}
                </a>
              </InfoBlock>

              <InfoBlock icon={<ClockIcon />} title={t('contact.hoursTitle')}>
                <dl className="divide-y divide-outline-variant">
                  {hours.map(([day, time]) => (
                    <div key={day} className="flex min-w-0 justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                      <dt className="font-medium text-on-surface">{day}</dt>
                      <dd>{time}</dd>
                    </div>
                  ))}
                </dl>
              </InfoBlock>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-outline-variant min-h-80">
            <iframe
              title="Localisation SCKOLARIS, Bertoua, Cameroun"
              className="w-full h-full min-h-80"
              src="https://www.google.com/maps?q=Bertoua,Cameroun&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        <section className="max-w-(--container-max-width) mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <div className="min-w-0 rounded-lg border border-outline shadow-sm bg-surface-container-lowest overflow-hidden md:grid md:grid-cols-5">
            <div className="bg-footer text-on-footer p-8 md:p-10 md:col-span-2 flex flex-col justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-on-footer/10">
                <SendIcon width={22} height={22} />
              </span>
              <h2 className="mt-5 text-2xl font-bold">{t('contact.formTitle')}</h2>
              <p className="mt-3 text-sm text-on-footer-muted leading-relaxed">{t('contact.formIntro')}</p>

              <div className="mt-8 pt-6 border-t border-on-footer/10 space-y-3 text-sm">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-2.5 text-on-footer-muted hover:text-on-footer transition-colors"
                >
                  <MailIcon width={16} height={16} /> {CONTACT_EMAIL}
                </a>
                <a
                  href={`tel:+237${CONTACT_PHONES[0].replaceAll(' ', '')}`}
                  className="flex items-center gap-2.5 text-on-footer-muted hover:text-on-footer transition-colors"
                >
                  <PhoneIcon width={16} height={16} /> {CONTACT_PHONES.join(' / ')}
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="min-w-0 p-6 sm:p-8 md:col-span-3 space-y-5">
              {status === 'sent' ? (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-container text-success">
                    <CheckIcon width={24} height={24} />
                  </span>
                  <p className="font-semibold text-on-surface text-lg">{t('contact.sentTitle')}</p>
                  <p className="text-sm text-on-surface-variant max-w-sm">{t('contact.sentText')}</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-2 text-sm font-semibold text-primary hover:underline"
                  >
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <TextField
                      label={t('contact.fields.name')}
                      required
                      value={form.name}
                      onChange={update('name')}
                    />
                    <TextField
                      label={t('contact.fields.email')}
                      type="email"
                      required
                      value={form.email}
                      onChange={update('email')}
                    />
                  </div>

                  <TextField
                    label={t('contact.fields.subject')}
                    required
                    placeholder={t('contact.fields.subjectPlaceholder')}
                    value={form.subject}
                    onChange={update('subject')}
                  />

                  <label className="block">
                    <span className="block text-sm font-semibold text-on-surface mb-1.5">
                      {t('contact.fields.message')}
                    </span>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={update('message')}
                      placeholder={t('contact.fields.messagePlaceholder')}
                      className="w-full rounded border border-outline px-3 py-2.5 focus:outline-none focus:border-2 focus:border-primary"
                    />
                  </label>

                  {status === 'error' && (
                    <p className="rounded bg-error-container text-on-error-container text-sm p-3">
                      {t('contact.errorText', { email: CONTACT_EMAIL })}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors disabled:opacity-60"
                  >
                    <SendIcon width={16} height={16} />
                    {status === 'sending' ? t('contact.sending') : t('contact.submit')}
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function InfoBlock({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-on-surface">{title}</p>
        <div className="mt-1 text-sm text-on-surface-variant leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
