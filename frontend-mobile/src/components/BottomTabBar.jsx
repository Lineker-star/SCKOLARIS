import { View, Text, Pressable } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { HomeIcon, InfoIcon, MailIcon, SearchIcon, UserIcon } from './icons'

// Barre d'onglets persistante — rendue par AppShell sur tous les écrans
// (publics ET authentifiés, y compris les écrans profonds comme le
// tableau de bord ou "Mes dépôts") plutôt que via un vrai Tab.Navigator de
// React Navigation, pour éviter la complexité d'imbrication à 3 niveaux
// (Stack racine > Tabs > Stack par onglet) tout en gardant la barre
// visible partout, comme demandé.
export default function BottomTabBar() {
  const navigation = useNavigation()
  const route = useRoute()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { theme } = useTheme()
  const activeColor = theme === 'dark' ? '#aac7ff' : '#001c40'
  const inactiveColor = theme === 'dark' ? '#b3bac8' : '#43474f'

  const baseTabs = [
    { screen: 'Home', label: t('nav.home'), icon: HomeIcon },
    { screen: 'About', label: t('nav.about'), icon: InfoIcon },
    { screen: 'Contact', label: t('nav.contact'), icon: MailIcon },
  ]
  const authTabs = [
    { screen: 'Catalog', label: t('nav.catalog'), icon: SearchIcon },
    { screen: 'Profile', label: t('nav.profile'), icon: UserIcon },
  ]

  const tabs = user ? [...baseTabs, ...authTabs] : baseTabs

  return (
    <View className="flex-row border-t border-outline-variant dark:border-outline-variant-night bg-surface dark:bg-surface-night">
      {tabs.map(({ screen, label, icon: Icon }) => {
        const active = route.name === screen
        return (
          <Pressable
            key={screen}
            onPress={() => navigation.navigate(screen)}
            className="flex-1 items-center gap-0.5 py-2"
          >
            <Icon width={22} height={22} color={active ? activeColor : inactiveColor} />
            <Text
              className={`text-xs ${
                active
                  ? 'font-semibold text-primary dark:text-primary-night'
                  : 'text-on-surface-variant dark:text-on-surface-variant-night'
              }`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
