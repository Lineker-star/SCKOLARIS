import { Trans, useTranslation } from 'react-i18next'
import LegalPage from '../../components/LegalPage'

const mailLink = <a href="mailto:contact@sckolaris.com" className="text-primary underline" />
const contactLink = <a href="/contact" className="text-primary underline" />
const termsLink = <a href="/conditions-utilisation" className="text-primary underline" />

export default function LegalNotice() {
  const { t } = useTranslation()

  return (
    <LegalPage title={t('legal.notice.title')} updatedAt={t('legal.updatedAt')}>
      <h2>{t('legal.notice.publisher')}</h2>
      <p>
        <Trans i18nKey="legal.notice.publisherText" components={{ strong: <strong /> }} />
      </p>
      <ul>
        <li>{t('legal.notice.address')}</li>
        <li>{t('legal.notice.registration')}</li>
        <li>{t('legal.notice.phone')} : +237 6 00 00 00 00</li>
        <li>
          <Trans i18nKey="legal.notice.email" components={{ mail: mailLink }} />
        </li>
        <li>{t('legal.notice.director')}</li>
      </ul>

      <h2>{t('legal.notice.hosting')}</h2>
      <p>{t('legal.notice.hostingIntro')}</p>
      <ul>
        <li>
          <Trans i18nKey="legal.notice.hostingWeb" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="legal.notice.hostingBackend" components={{ strong: <strong /> }} />
        </li>
      </ul>

      <h2>{t('legal.notice.ip')}</h2>
      <p>{t('legal.notice.ipText1')}</p>
      <p>
        <Trans i18nKey="legal.notice.ipText2" components={{ terms: termsLink, mail: mailLink }} />
      </p>

      <h2>{t('legal.notice.law')}</h2>
      <p>{t('legal.notice.lawText')}</p>

      <h2>{t('nav.contact')}</h2>
      <p>
        <Trans i18nKey="legal.notice.contactText" components={{ mail: mailLink, contact: contactLink }} />
      </p>
    </LegalPage>
  )
}
