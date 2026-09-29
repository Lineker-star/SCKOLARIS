import { Image } from 'expo-image'
import logo from '../assets/logo.png'

// Taille dynamique par prop → on reste sur `style` uniquement pour cet
// élément (pas de className NativeWind ici : les deux se marchent dessus
// dès qu'un style littéral {width, height} est mêlé à des classes gérées
// par cssInterop sur le web).
export default function Logo({ size = 32, style }) {
  return (
    <Image
      source={logo}
      accessibilityLabel="SCKOLARIS — Bibliothèque universitaire"
      style={[{ width: size, height: size, borderRadius: 8 }, style]}
      contentFit="cover"
    />
  )
}
