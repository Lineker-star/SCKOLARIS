import './global.css'
import './src/nativewindInterop'
import './src/i18n/config'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider } from './src/context/ThemeContext'
import RootNavigator from './src/navigation/RootNavigator'
import ConnectionStatusBanner from './src/components/ConnectionStatusBanner'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
          <ConnectionStatusBanner />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
