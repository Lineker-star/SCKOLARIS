import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

const styles = {
  pending: 'bg-surface-container-high dark:bg-surface-container-high-night',
  validated: 'bg-success-container dark:bg-success-container-night',
  approved: 'bg-success-container dark:bg-success-container-night',
  rejected: 'bg-error-container dark:bg-error-container-night',
  deactivated: 'bg-surface-container-highest dark:bg-surface-container-highest-night',
}

const textStyles = {
  pending: 'text-on-surface-variant dark:text-on-surface-variant-night',
  validated: 'text-success dark:text-success-night',
  approved: 'text-success dark:text-success-night',
  rejected: 'text-on-error-container dark:text-on-error-container-night',
  deactivated: 'text-on-surface-variant dark:text-on-surface-variant-night',
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
    <View className={`self-start rounded-lg px-2.5 py-1 ${styles[status] ?? styles.pending} ${className}`}>
      <Text className={`text-xs font-semibold ${textStyles[status] ?? textStyles.pending}`}>
        {labels[status] ?? status}
      </Text>
    </View>
  )
}
