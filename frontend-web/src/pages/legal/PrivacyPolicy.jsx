import { Trans, useTranslation } from 'react-i18next'
import LegalPage from '../../components/LegalPage'

const mailLink = <a href="mailto:contact@sckolaris.com" className="text-primary underline" />
const contactLink = <a href="/contact" className="text-primary underline" />
const legalNoticeLink = <a href="/mentions-legales" className="text-primary underline" />

export default function PrivacyPolicy() {
  const { t } = useTranslation()

  return (
    <LegalPage title={t('legal.privacy.title')} updatedAt={t('legal.updatedAt')}>
      <h2>{t('legal.privacy.controller')}</h2>
      <p>
        <Trans i18nKey="legal.privacy.controllerText" components={{ mail: mailLink }} />
      </p>

      <h2>{t('legal.privacy.dataCollected')}</h2>
      <ul>
        <li>
          <Trans i18nKey="legal.privacy.accountData" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="legal.privacy.usageData" components={{ strong: <strong /> }} />
        </li>
        <li>
          <Trans i18nKey="legal.privacy.browsingData" components={{ strong: <strong /> }} />
        </li>
      </ul>

      <h2>{t('legal.privacy.purposes')}</h2>
      <ul>
        <li>{t('legal.privacy.purpose1')}</li>
        <li>{t('legal.privacy.purpose2')}</li>
        <li>{t('legal.privacy.purpose3')}</li>
        <li>{t('legal.privacy.purpose4')}</li>
      </ul>

      <h2>{t('legal.privacy.cookies')}</h2>
      <p>{t('legal.privacy.cookiesText1')}</p>
      <p>{t('legal.privacy.cookiesText2')}</p>

      <h2>{t('legal.privacy.retention')}</h2>
      <p>{t('legal.privacy.retentionText')}</p>

      <h2>{t('legal.privacy.recipients')}</h2>
      <p>
        <Trans i18nKey="legal.privacy.recipientsText" components={{ legal: legalNoticeLink }} />
      </p>

      <h2>{t('legal.privacy.security')}</h2>
      <p>{t('legal.privacy.securityText')}</p>

      <h2>{t('legal.privacy.rights')}</h2>
      <p>
        <Trans i18nKey="legal.privacy.rightsText" components={{ mail: mailLink, contact: contactLink }} />
      </p>
    </LegalPage>
  )
}
