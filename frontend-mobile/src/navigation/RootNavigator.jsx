import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import TermsGateScreen from '../screens/TermsGateScreen'
import Chatbot from '../components/Chatbot'
import HomeScreen from '../screens/HomeScreen'
import AboutScreen from '../screens/AboutScreen'
import ContactScreen from '../screens/ContactScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import PendingAccountScreen from '../screens/PendingAccountScreen'
import AccessDeniedScreen from '../screens/AccessDeniedScreen'
import CatalogScreen from '../screens/CatalogScreen'
import DocumentDetailScreen from '../screens/DocumentDetailScreen'
import DocumentReaderScreen from '../screens/DocumentReaderScreen'
import MyLibraryScreen from '../screens/MyLibraryScreen'
import ProfileScreen from '../screens/ProfileScreen'
import StudentDashboardScreen from '../screens/dashboard/StudentDashboardScreen'
import TeacherDashboardScreen from '../screens/dashboard/TeacherDashboardScreen'
import AdminDashboardScreen from '../screens/dashboard/AdminDashboardScreen'
import MyDepositsScreen from '../screens/MyDepositsScreen'
import DepositCourseScreen from '../screens/DepositCourseScreen'
import EditDepositScreen from '../screens/EditDepositScreen'
import DomainsScreen from '../screens/DomainsScreen'
import StatisticsScreen from '../screens/StatisticsScreen'
import StatisticsSummaryScreen from '../screens/StatisticsSummaryScreen'
import UsersScreen from '../screens/UsersScreen'
import UserDetailScreen from '../screens/UserDetailScreen'
import PendingAccountsScreen from '../screens/PendingAccountsScreen'
import PendingDeletionRequestsScreen from '../screens/PendingDeletionRequestsScreen'
import DeletionRequestDetailScreen from '../screens/DeletionRequestDetailScreen'
import DownloadsScreen from '../screens/DownloadsScreen'
import GuideScreen from '../screens/GuideScreen'

const Stack = createNativeStackNavigator()
const navigationRef = createNavigationContainerRef()
const TERMS_ACCEPTED_KEY = 'e-biblio-terms-accepted'

const dashboardByRole = {
  student: StudentDashboardScreen,
  teacher: TeacherDashboardScreen,
  admin: AdminDashboardScreen,
}

function routeForUser(user) {
  if (user?.account_status === 'rejected') return 'AccessDenied'
  if (user?.account_status === 'pending') return 'PendingAccount'
  if (user?.account_status === 'validated') return 'Dashboard'
  return 'Home'
}

// Toutes les routes coexistent dans un seul Stack.Navigator (comme les
// routes React Router du web) ; seul l'écran de départ change selon le
// statut du compte. Ce changement est appliqué via navigationRef.reset()
// plutôt qu'en remontant le Stack.Navigator (via une prop `key`) : sur le
// web, React Navigation restaure l'état de navigation depuis l'URL du
// navigateur au moment du remontage, ce qui ramenait l'utilisateur sur
// l'écran précédent au lieu du nouvel écran attendu juste après la
// connexion/inscription.
//
// "Dashboard" rend l'écran adapté au rôle (student/teacher/admin) — un
// seul nom de route stable, résolu dynamiquement, pour que
// navigationRef.reset() n'ait pas besoin de connaître le rôle à l'avance.
export default function RootNavigator() {
  const { user, loading } = useAuth()
  const [containerReady, setContainerReady] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(null)
  const targetRoute = routeForUser(user)
  const DashboardComponent = dashboardByRole[user?.role] ?? StudentDashboardScreen

  useEffect(() => {
    AsyncStorage.getItem(TERMS_ACCEPTED_KEY).then((value) => setTermsAccepted(value === 'true'))
  }, [])

  useEffect(() => {
    if (loading || !containerReady || !navigationRef.isReady()) return
    navigationRef.reset({ index: 0, routes: [{ name: targetRoute }] })
  }, [targetRoute, loading, containerReady])

  // Écran d'acceptation des conditions, au tout premier lancement — voir
  // TermsGateScreen.jsx pour le pourquoi (aucun hook d'installation Android
  // ne permet d'y insérer un écran personnalisé).
  if (termsAccepted === false) {
    return (
      <TermsGateScreen
        onAccept={() => {
          AsyncStorage.setItem(TERMS_ACCEPTED_KEY, 'true')
          setTermsAccepted(true)
        }}
      />
    )
  }

  if (loading || termsAccepted === null) {
    return (
      <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-night">
        <ActivityIndicator />
        <Text className="mt-3 text-on-surface-variant dark:text-on-surface-variant-night">
          Chargement…
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
    <NavigationContainer ref={navigationRef} onReady={() => setContainerReady(true)}>
      <Stack.Navigator initialRouteName={targetRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="PendingAccount" component={PendingAccountScreen} />
        <Stack.Screen name="AccessDenied" component={AccessDeniedScreen} />
        <Stack.Screen name="Catalog" component={CatalogScreen} />
        <Stack.Screen name="DocumentDetail" component={DocumentDetailScreen} />
        <Stack.Screen name="DocumentReader" component={DocumentReaderScreen} />
        <Stack.Screen name="MyLibrary" component={MyLibraryScreen} />
        <Stack.Screen name="Dashboard" component={DashboardComponent} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="MyDeposits" component={MyDepositsScreen} />
        <Stack.Screen name="DepositCourse" component={DepositCourseScreen} />
        <Stack.Screen name="EditDeposit" component={EditDepositScreen} />
        <Stack.Screen name="Domains" component={DomainsScreen} />
        <Stack.Screen name="Statistics" component={StatisticsScreen} />
        <Stack.Screen name="StatisticsSummary" component={StatisticsSummaryScreen} />
        <Stack.Screen name="Users" component={UsersScreen} />
        <Stack.Screen name="UserDetail" component={UserDetailScreen} />
        <Stack.Screen name="PendingAccounts" component={PendingAccountsScreen} />
        <Stack.Screen name="PendingDeletionRequests" component={PendingDeletionRequestsScreen} />
        <Stack.Screen name="DeletionRequestDetail" component={DeletionRequestDetailScreen} />
        <Stack.Screen name="Downloads" component={DownloadsScreen} />
        <Stack.Screen name="Guide" component={GuideScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    <Chatbot />
    </View>
  )
}
