import { createContext, useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useColorScheme as useNativeWindColorScheme } from 'nativewind'

const ThemeContext = createContext(null)

const THEME_KEY = 'e-biblio-theme'

export function ThemeProvider({ children }) {
  const { setColorScheme } = useNativeWindColorScheme()
  const [theme, setTheme] = useState(() => Appearance.getColorScheme() ?? 'light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY)
      const initial = stored === 'light' || stored === 'dark'
        ? stored
        : Appearance.getColorScheme() ?? 'light'
      setTheme(initial)
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    if (!ready) return
    // Pilote les classes `dark:` de NativeWind partout dans l'app.
    setColorScheme(theme)
    AsyncStorage.setItem(THEME_KEY, theme)
  }, [theme, ready, setColorScheme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
