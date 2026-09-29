// Enregistre une seule fois les composants tiers (react-native-svg,
// expo-image) auprès de NativeWind pour que `className="..."` fonctionne
// dessus. Importé une seule fois, pour effet de bord, depuis App.js.
import Svg from 'react-native-svg'
import { Image } from 'expo-image'
import { cssInterop } from 'nativewind'

cssInterop(Svg, { className: 'style' })
cssInterop(Image, { className: 'style' })
