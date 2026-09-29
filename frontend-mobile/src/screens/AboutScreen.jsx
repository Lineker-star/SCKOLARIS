import { View, Text, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import LibraryArt from '../components/LibraryArt'
import { BuildingIcon, BookOpenIcon, BadgeCheckIcon, UsersIcon } from '../components/icons'

// Portage de About.jsx (web).
export default function AboutScreen() {
  const { t } = useTranslation()

  const mission = [
    { icon: BookOpenIcon, title: t('about.mission.access.title'), text: t('about.mission.access.text') },
    { icon: BadgeCheckIcon, title: t('about.mission.quality.title'), text: t('about.mission.quality.text') },
    { icon: UsersIcon, title: t('about.mission.community.title'), text: t('about.mission.community.text') },
  ]

  return (
    <AppShell title={t('nav.about')}>
      <ScrollView>
        <View className="px-4 py-8 gap-6">
          <Text className="text-2xl font-bold text-primary dark:text-primary-night leading-tight">
            {t('about.hero.title')}
          </Text>
          <Text className="text-base text-on-surface-variant dark:text-on-surface-variant-night leading-relaxed">
            {t('about.hero.text')}
          </Text>
          <LibraryArt style={{ height: 200 }} />
        </View>

        <View className="px-4 gap-6">
          <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-low dark:bg-surface-container-low-night items-center gap-4 p-10">
            <BuildingIcon width={40} height={40} className="text-primary dark:text-primary-night" />
            <Text className="font-semibold text-lg text-on-surface dark:text-on-surface-night text-center">
              {t('about.institution')}
            </Text>
          </View>
          <View>
            <Text className="text-xl font-semibold text-primary dark:text-primary-night mb-3">
              {t('about.local.title')}
            </Text>
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night leading-relaxed">
              {t('about.local.text')}
            </Text>
          </View>
        </View>

        <View className="px-4 py-8">
          <View className="rounded-lg bg-surface-container-low dark:bg-surface-container-low-night border border-outline-variant dark:border-outline-variant-night p-6 gap-5">
            <Text className="text-center text-2xl font-bold text-primary dark:text-primary-night">
              {t('about.missionTitle')}
            </Text>
            {mission.map(({ icon: Icon, title, text }) => (
              <View
                key={title}
                className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-6 items-center"
              >
                <Icon width={28} height={28} className="text-secondary dark:text-secondary-night mb-3" />
                <Text className="font-semibold text-on-surface dark:text-on-surface-night">{title}</Text>
                <Text className="mt-2 text-sm text-on-surface-variant dark:text-on-surface-variant-night text-center leading-relaxed">
                  {text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  )
}
