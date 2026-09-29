import { View, Text, Pressable, Modal as RNModal } from 'react-native'
import { useTranslation } from 'react-i18next'
import { XIcon } from './icons'

// Portage de Modal.jsx (web) sur le composant Modal natif de React Native
// (gère nativement l'overlay, le bouton retour Android, etc.)
export default function Modal({ title, icon, onClose, children, visible = true }) {
  const { t } = useTranslation()
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-inverse-surface/60 dark:bg-inverse-surface-night/60 p-4">
        <View className="w-full max-w-lg rounded-lg bg-surface-container-lowest dark:bg-surface-container-lowest-night">
          <View className="flex-row items-center justify-between border-b border-outline-variant dark:border-outline-variant-night px-6 py-4">
            <View className="flex-row items-center gap-2">
              {icon}
              <Text className="text-lg font-bold text-on-surface dark:text-on-surface-night">{title}</Text>
            </View>
            <Pressable onPress={onClose} accessibilityLabel={t('common.close')}>
              <XIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
            </Pressable>
          </View>
          <View className="px-6 py-5">{children}</View>
        </View>
      </View>
    </RNModal>
  )
}
