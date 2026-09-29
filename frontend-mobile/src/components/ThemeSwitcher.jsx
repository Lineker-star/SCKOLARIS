import { Pressable, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'
import { SunIcon, MoonIcon } from './icons'

export default function ThemeSwitcher({ className = '' }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityLabel={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
      className={`flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-2.5 py-1.5 ${className}`}
    >
      {theme === 'dark' ? (
        <SunIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
      ) : (
        <MoonIcon width={16} height={16} className="text-on-surface-variant dark:text-on-surface-variant-night" />
      )}
      <Text className="text-xs font-semibold text-on-surface-variant dark:text-on-surface-variant-night">
        {theme === 'dark' ? t('common.light') : t('common.dark')}
      </Text>
    </Pressable>
  )
}
