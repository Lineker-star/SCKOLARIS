import { useEffect, useState } from 'react'
import { Animated, AppState, View, Text, Pressable, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Logo from './Logo'
import ThemeSwitcher from './ThemeSwitcher'
import LanguageSwitcher from './LanguageSwitcher'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import BottomTabBar from './BottomTabBar'
import NavDrawer from './NavDrawer'
import { useAuth } from '../context/AuthContext'
import { syncLibrary } from '../services/librarySync'
import { getNotifications, markNotificationRead, deleteNotification } from '../services/notifications'
import { checkForUpdate, getKnownUpdate, dismissUpdate } from '../services/updateCheck'
import { MenuIcon, DownloadIcon, XIcon, BellIcon, CameraIcon, TrashIcon, LogOutIcon } from './icons'

// Coquille commune à tous les écrans (publics et authentifiés) : en-tête
// (marque + thème + connexion/inscription ou menu-burger) + contenu +
// barre d'onglets persistante en bas. Remplace PublicHeader, AppHeader et
// DashboardShell, unifiés en un seul composant pour que la barre
// d'onglets et le tiroir de navigation soient cohérents partout, y
// compris en profondeur dans le tableau de bord.
export default function AppShell({ title, children }) {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [update, setUpdate] = useState(getKnownUpdate())
  const [notifications, setNotifications] = useState([])
  const [marquee] = useState(() => new Animated.Value(0))
  const profileIsComplete = Boolean(
    user?.first_name?.trim()
      && user?.last_name?.trim()
      && user?.avatar_url
      && (user?.role === 'admin' || user?.program?.trim()),
  )

  // Une fois par session (par utilisateur connecté) : aligne la
  // bibliothèque hors-ligne de cet appareil sur celle du serveur.
  useEffect(() => {
    if (user?.id) syncLibrary(user.id)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setNotifications([])
      return
    }

    const loadNotifications = () => {
      getNotifications().then((response) => setNotifications(response.data.notifications ?? [])).catch(() => {})
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 60 * 1000)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadNotifications()
    })

    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user || profileIsComplete) return undefined
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(marquee, { toValue: -420, duration: 11000, useNativeDriver: true }),
        Animated.timing(marquee, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [user, profileIsComplete, marquee])

  // Vérification de version — publique, ne dépend pas de la connexion.
  // Le contrôle est périodique et relancé au retour au premier plan afin
  // qu'une release publiée pendant l'utilisation soit détectée même dans
  // un tableau de bord déjà ouvert.
  useEffect(() => {
    checkForUpdate().then(() => setUpdate(getKnownUpdate()))

    const interval = setInterval(() => {
      checkForUpdate().then(() => setUpdate(getKnownUpdate()))
    }, 5 * 60 * 1000)

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkForUpdate().then(() => setUpdate(getKnownUpdate()))
      }
    })

    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [])

  function handleDismissUpdate() {
    dismissUpdate()
    setUpdate(null)
  }

  function handleLogout() {
    logout()
  }

  async function readNotification(notification) {
    if (!notification.read_at) {
      await markNotificationRead(notification.id).catch(() => {})
      setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
    }
  }

  async function removeNotification(notification) {
    await deleteNotification(notification.id).catch(() => {})
    setNotifications((items) => items.filter((item) => item.id !== notification.id))
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-surface dark:bg-surface-night">
      <View className="flex-row flex-wrap items-center justify-between border-b border-outline-variant dark:border-outline-variant-night bg-surface dark:bg-surface-night px-4 py-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          {user ? (
            <Pressable onPress={() => setDrawerOpen(true)} accessibilityLabel={t('nav.openMenu')}>
              <MenuIcon width={22} height={22} className="text-on-surface dark:text-on-surface-night" />
            </Pressable>
          ) : null}
          <Logo size={28} />
          <View className="min-w-0 flex-1">
            <Text className="text-lg font-bold text-primary dark:text-primary-night leading-tight">
              {BRAND_NAME}
            </Text>
            <Text className="text-[10px] text-on-surface-variant dark:text-on-surface-variant-night leading-tight">
              {BRAND_TAGLINE}
            </Text>
          </View>
        </View>

        <View className="shrink-0 flex-row flex-wrap items-center justify-end gap-2">
          {!user ? (
            <>
              <Pressable
                onPress={() => navigation.navigate('Register')}
                className="rounded border border-outline dark:border-outline-night px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-on-surface dark:text-on-surface-night">{t('nav.register')}</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                className="rounded bg-primary dark:bg-primary-night px-3 py-1.5"
              >
                <Text className="text-xs font-semibold text-on-primary dark:text-on-primary-night">{t('nav.login')}</Text>
              </Pressable>
            </>
          ) : null}
          <LanguageSwitcher />
          <ThemeSwitcher />
          {user ? (
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel={t('nav.logout')}
              className="rounded p-2"
            >
              <LogOutIcon width={20} height={20} className="text-on-surface-variant dark:text-on-surface-variant-night" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {update ? (
        <View className="flex-row items-center justify-between gap-2 bg-primary-container dark:bg-primary-container-night px-4 py-2.5">
          <Text className="flex-1 text-xs font-semibold text-on-primary-container dark:text-on-primary-container-night">
            {t('appShell.updateAvailable', { version: update.version })}
          </Text>
          <Pressable
            onPress={() => Linking.openURL(update.url)}
            className="flex-row items-center gap-1 rounded bg-primary dark:bg-primary-night px-2.5 py-1"
          >
            <DownloadIcon width={14} height={14} className="text-on-primary dark:text-on-primary-night" />
            <Text className="text-xs font-semibold text-on-primary dark:text-on-primary-night">{t('appShell.update')}</Text>
          </Pressable>
          <Pressable onPress={handleDismissUpdate} accessibilityLabel={t('common.close')}>
            <XIcon width={16} height={16} className="text-on-primary-container dark:text-on-primary-container-night" />
          </Pressable>
        </View>
      ) : null}

      {user && !profileIsComplete ? (
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          className="overflow-hidden border-b border-secondary/40 bg-secondary-container dark:bg-secondary-container-night px-4 py-2.5"
        >
          <View className="flex-row items-center gap-2">
            <CameraIcon width={18} height={18} className="shrink-0 text-on-secondary-container dark:text-on-secondary-container-night" />
            <View className="flex-1 overflow-hidden">
              <Animated.Text
                numberOfLines={1}
                className="text-xs font-semibold text-on-secondary-container dark:text-on-secondary-container-night"
                style={{ transform: [{ translateX: marquee }] }}
              >
                Votre profil est important pour {BRAND_NAME}. Vérifiez et complétez vos informations personnelles afin de garder votre compte à jour. Touchez ici pour ouvrir votre profil.
              </Animated.Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      {notifications.length > 0 ? (
        <View className="border-b border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-4">
          <View className="flex-row items-center gap-2">
            <BellIcon width={19} height={19} className="text-primary dark:text-primary-night" />
            <Text className="text-base font-semibold text-on-surface dark:text-on-surface-night">{t('dashboard.notifications')}</Text>
          </View>
          {notifications.slice(0, 5).map((notification) => (
            <Pressable
              key={notification.id}
              className={`mt-2 flex-row items-center gap-2 rounded border p-2.5 ${notification.read_at ? 'border-outline-variant dark:border-outline-variant-night' : 'border-primary/40 bg-surface-container dark:bg-surface-container-night'}`}
            >
              <Pressable onPress={() => readNotification(notification)} className="flex-1">
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">
                  {notification.data?.kind === 'course_available' ? 'Nouveau support disponible' : 'Décision sur votre demande de suppression'}
                </Text>
                {notification.data?.title ? <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{` — ${notification.data.title}`}</Text> : null}
              </Pressable>
              <Pressable onPress={() => removeNotification(notification)} accessibilityLabel="Supprimer la notification">
                <TrashIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
              </Pressable>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View className="flex-1">{children}</View>

      <BottomTabBar />

      {user ? <NavDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} role={user.role} /> : null}
    </SafeAreaView>
  )
}
