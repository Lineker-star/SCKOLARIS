import { View, Text, Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import LibraryArt from '../components/LibraryArt'
import { useAuth } from '../context/AuthContext'
import { SearchIcon, BookOpenIcon, DownloadIcon } from '../components/icons'

// Portage de Home.jsx (web).
export default function HomeScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { user } = useAuth()

  const tools = [
    { icon: SearchIcon, title: t('home.tools.search.title'), text: t('home.tools.search.text') },
    { icon: BookOpenIcon, title: t('home.tools.read.title'), text: t('home.tools.read.text') },
    { icon: DownloadIcon, title: t('home.tools.download.title'), text: t('home.tools.download.text') },
  ]

  // Le catalogue exige un compte (BF07 : consultable même en attente, mais
  // pas anonyme — la route API est derrière auth:sanctum) : un visiteur non
  // connecté est envoyé s'inscrire/se connecter plutôt que planter sur un
  // écran qui suppose un `user` non nul.
  function handleExploreCatalog() {
    navigation.navigate(user ? 'Catalog' : 'Login')
  }

  return (
    <AppShell title="SCKOLARIS">
      <ScrollView>
        <View className="px-4 py-8 gap-6">
          <Text className="text-3xl font-bold text-primary dark:text-primary-night leading-tight">
            {t('home.hero.title')}
          </Text>
          <Text className="text-base text-on-surface-variant dark:text-on-surface-variant-night leading-relaxed">
            {t('home.hero.text')}
          </Text>
          <Pressable
            onPress={handleExploreCatalog}
            className="self-start rounded bg-primary dark:bg-primary-night px-6 py-3"
          >
            <Text className="font-semibold text-on-primary dark:text-on-primary-night">
              {t('home.hero.cta')}
            </Text>
          </Pressable>

          <LibraryArt style={{ height: 220 }} />
        </View>

        <View className="px-4 pb-8 gap-5">
          <Text className="text-center text-2xl font-bold text-primary dark:text-primary-night">
            {t('home.toolsTitle')}
          </Text>
          {tools.map(({ icon: Icon, title, text }) => (
            <View
              key={title}
              className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 items-center"
            >
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night mb-4">
                <Icon className="text-primary dark:text-primary-night" />
              </View>
              <Text className="font-semibold text-lg text-on-surface dark:text-on-surface-night">{title}</Text>
              <Text className="mt-2 text-center text-on-surface-variant dark:text-on-surface-variant-night text-sm leading-relaxed">
                {text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppShell>
  )
}
