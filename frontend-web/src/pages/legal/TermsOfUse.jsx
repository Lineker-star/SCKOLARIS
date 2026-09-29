import { Trans, useTranslation } from 'react-i18next'
import LegalPage from '../../components/LegalPage'

const mailLink = <a href="mailto:contact@sckolaris.com" className="text-primary underline" />

export default function TermsOfUse() {
  const { t } = useTranslation()

  return (
    <LegalPage title={t('legal.terms.title')} updatedAt={t('legal.updatedAt')}>
      <h2>{t('legal.terms.purpose')}</h2>
      <p>{t('legal.terms.purposeText')}</p>

      <h2>{t('legal.terms.access')}</h2>
      <p>{t('legal.terms.accessText1')}</p>
      <p>
        <Trans i18nKey="legal.terms.accessText2" components={{ mail: mailLink }} />
      </p>

      <h2>{t('legal.terms.catalogUse')}</h2>
      <p>{t('legal.terms.catalogUseText1')}</p>
      <p>{t('legal.terms.catalogUseText2')}</p>

      <h2>{t('legal.terms.deposit')}</h2>
      <p>{t('legal.terms.depositText')}</p>

      <h2>{t('legal.terms.prohibited')}</h2>
      <ul>
        <li>{t('legal.terms.prohibited1')}</li>
        <li>{t('legal.terms.prohibited2')}</li>
        <li>{t('legal.terms.prohibited3')}</li>
        <li>{t('legal.terms.prohibited4')}</li>
      </ul>

      <h2>{t('legal.terms.availability')}</h2>
      <p>{t('legal.terms.availabilityText')}</p>

      <h2>{t('legal.terms.suspension')}</h2>
      <p>{t('legal.terms.suspensionText')}</p>

      <h2>{t('legal.terms.changes')}</h2>
      <p>{t('legal.terms.changesText')}</p>

      <h2>{t('legal.terms.law')}</h2>
      <p>{t('legal.terms.lawText')}</p>
    </LegalPage>
  )
}
