import { View, Text, Pressable, Modal as RNModal, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import { useAuth } from '../context/AuthContext'
import { navForRole, subtitleForRole } from '../navigation/dashboardNav'
import { XIcon, GlobeIcon, LogOutIcon, UserIcon } from './icons'

// Tiroir latéral (équivalent mobile de la barre latérale de
// DashboardLayout.jsx sur le web), extrait en composant autonome pour être
// ouvert depuis n'importe quel écran authentifié via AppShell — pas
// seulement depuis le tableau de bord.
export default function NavDrawer({ visible, onClose, role }) {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { logout } = useAuth()

  function go(screen) {
    onClose()
    navigation.navigate(screen)
  }

  function handleLogout() {
    onClose()
    logout()
  }

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <View className="w-72 bg-surface-container-lowest dark:bg-surface-container-lowest-night">
          <SafeAreaView edges={['top', 'bottom']} className="flex-1">
            <View className="flex-row items-center gap-2 px-4 py-5">
              <Logo size={32} />
              <View>
                <Text className="text-lg font-bold text-primary dark:text-primary-night leading-none">{BRAND_NAME}</Text>
                <Text className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-night mt-1 leading-tight">{BRAND_TAGLINE}</Text>
                <Text className="text-xs text-on-surface-variant dark:text-on-surface-variant-night mt-1">
                  {subtitleForRole(role, t)}
                </Text>
              </View>
            </View>

            <ScrollView className="flex-1 px-3">
              <View className="gap-1">
                {navForRole(role, t).map(({ screen, label, icon: Icon }) => (
                  <Pressable
                    key={screen}
                    onPress={() => go(screen)}
                    className="flex-row items-center gap-3 rounded px-3 py-2.5"
                  >
                    <Icon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                    <Text className="text-sm font-medium text-on-surface-variant dark:text-on-surface-variant-night">
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View className="gap-1 border-t border-outline-variant dark:border-outline-variant-night px-3 py-4">
              <View className="flex-row items-center gap-2 px-3 pb-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </View>
              <Pressable onPress={() => go('Home')} className="flex-row items-center gap-3 rounded px-3 py-2.5">
                <GlobeIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-sm font-medium text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('nav.viewSite')}
                </Text>
              </Pressable>
              <Pressable onPress={() => go('Profile')} className="flex-row items-center gap-3 rounded px-3 py-2.5">
                <UserIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-sm font-medium text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('nav.profile')}
                </Text>
              </Pressable>
              <Pressable onPress={handleLogout} className="flex-row items-center gap-3 rounded px-3 py-2.5">
                <LogOutIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-sm font-medium text-on-surface-variant dark:text-on-surface-variant-night">
                  {t('nav.logout')}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <Pressable className="flex-1 bg-inverse-surface/50 dark:bg-inverse-surface-night/50" onPress={onClose}>
          <View className="absolute right-3 top-14">
            <Pressable onPress={onClose} accessibilityLabel={t('nav.closeMenu')} className="p-2">
              <XIcon width={22} height={22} color="#fff" />
            </Pressable>
          </View>
        </Pressable>
      </View>
    </RNModal>
  )
}
