import { cloneElement } from 'react'
import { View, Text } from 'react-native'

// Portage de InfoCallout.jsx (web). Contrairement au web, RN ne propage
// pas la couleur d'un View vers ses enfants (pas d'équivalent de l'héritage
// CSS `color` sur <svg stroke="currentColor">) : on injecte donc la classe
// couleur directement sur l'icône via cloneElement plutôt que de compter
// sur un simple wrapper coloré.
export default function InfoCallout({ icon, children }) {
  return (
    <View className="flex-row gap-3 rounded-md bg-surface-container-high dark:bg-surface-container-high-night border border-outline-variant dark:border-outline-variant-night p-4">
      {icon && cloneElement(icon, { className: 'text-primary dark:text-primary-night' })}
      <Text className="flex-1 text-sm text-on-surface-variant dark:text-on-surface-variant-night">{children}</Text>
    </View>
  )
}
