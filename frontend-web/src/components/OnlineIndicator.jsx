import { useTranslation } from 'react-i18next'

export default function OnlineIndicator({ online, className = '' }) {
  const { t } = useTranslation()
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}>
      <span
        className={`h-2 w-2 rounded-full ${online ? 'bg-success' : 'bg-outline'}`}
        aria-hidden="true"
      />
      <span className={online ? 'text-success' : 'text-on-surface-variant'}>
        {online ? t('status.online') : t('status.offline')}
      </span>
    </span>
  )
}
