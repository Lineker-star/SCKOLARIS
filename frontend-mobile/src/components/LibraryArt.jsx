import { Image, View } from 'react-native'

const campusImage = require('../../assets/student-reading-online.jpeg')

export default function LibraryArt({ className = '', style }) {
  return (
    <View className={`overflow-hidden rounded-lg border border-outline-variant dark:border-outline-variant-night ${className}`} style={style}>
      <Image source={campusImage} accessibilityLabel="Étudiants consultant des ressources numériques sur le campus" resizeMode="cover" className="h-full w-full" />
    </View>
  )
}
