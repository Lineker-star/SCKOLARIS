import './global.css'
import './src/nativewindInterop'
import './src/i18n/config'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from './src/context/AuthContext'
import { ThemeProvider } from './src/context/ThemeContext'
import { AiChatProvider } from './src/context/AiChatContext'
import RootNavigator from './src/navigation/RootNavigator'
import ConnectionStatusBanner from './src/components/ConnectionStatusBanner'

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AiChatProvider>
            <RootNavigator />
            <ConnectionStatusBanner />
            <StatusBar style="auto" />
          </AiChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
