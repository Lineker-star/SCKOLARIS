import { useTranslation } from 'react-i18next'

const styles = {
  pending: 'bg-surface-container-high text-on-surface-variant',
  validated: 'bg-success-container text-success',
  approved: 'bg-success-container text-success',
  rejected: 'bg-error-container text-on-error-container',
  deactivated: 'bg-surface-container-highest text-on-surface-variant',
}

export default function StatusBadge({ status, className = '' }) {
  const { t } = useTranslation()
  const labels = {
    pending: t('status.pending'),
    validated: t('status.validated'),
    approved: t('status.approved'),
    rejected: t('status.rejected'),
    deactivated: t('status.deactivated'),
  }
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${styles[status] ?? styles.pending} ${className}`}
    >
      {labels[status] ?? status}
    </span>
  )
}
