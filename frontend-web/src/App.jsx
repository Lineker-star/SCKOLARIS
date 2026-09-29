import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TermsOfUse from './pages/legal/TermsOfUse'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import LegalNotice from './pages/legal/LegalNotice'
import ErrorBoundary from './components/ErrorBoundary'
import UpdatePrompt from './components/UpdatePrompt'
import CookieConsent from './components/CookieConsent'
import PageviewTracker from './components/PageviewTracker'
import Chatbot from './components/Chatbot'
import ConnectionStatusBanner from './components/ConnectionStatusBanner'

// Chargées à la demande : ces pages ne servent qu'une fois connecté, pas
// besoin d'en payer le poids au tout premier chargement d'un visiteur
// anonyme sur l'accueil. Le lecteur (pdf.js, ~1,2 Mo) n'est plus une route
// séparée ici : c'est un modal (ReaderModal, voir MyLibrary.jsx et
// DocumentDetail.jsx), lui-même chargé à la demande depuis ces pages.
const PendingAccount = lazy(() => import('./pages/PendingAccount'))
const AccessDenied = lazy(() => import('./pages/AccessDenied'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Guide = lazy(() => import('./pages/Guide'))
const Catalog = lazy(() => import('./pages/Catalog'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const MyLibrary = lazy(() => import('./pages/MyLibrary'))
const MyDeposits = lazy(() => import('./pages/MyDeposits'))
const DepositCourse = lazy(() => import('./pages/DepositCourse'))
const EditDeposit = lazy(() => import('./pages/EditDeposit'))
const Domains = lazy(() => import('./pages/Domains'))
const Statistics = lazy(() => import('./pages/Statistics'))
const StatisticsSummary = lazy(() => import('./pages/StatisticsSummary'))
const Downloads = lazy(() => import('./pages/Downloads'))
const PendingAccounts = lazy(() => import('./pages/PendingAccounts'))
const Users = lazy(() => import('./pages/Users'))
const UserDetail = lazy(() => import('./pages/UserDetail'))
const PendingDeletionRequests = lazy(() => import('./pages/PendingDeletionRequests'))
const DeletionRequestDetail = lazy(() => import('./pages/DeletionRequestDetail'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <p className="text-sm text-on-surface-variant">Chargement...</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <AuthProvider>
        <ConnectionStatusBanner />
        <UpdatePrompt />
        <CookieConsent />
        <PageviewTracker />
        <Chatbot />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/inscription" element={<Register />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
            <Route path="/conditions-utilisation" element={<TermsOfUse />} />
            <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
            <Route path="/mentions-legales" element={<LegalNotice />} />

            <Route
              path="/compte-en-attente"
              element={
                <RequireAuth allowPending>
                  <PendingAccount />
                </RequireAuth>
              }
            />
            <Route
              path="/acces-refuse"
              element={
                <RequireAuth allowPending>
                  <AccessDenied />
                </RequireAuth>
              }
            />

            <Route
              path="/tableau-de-bord"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/profil"
              element={
                <RequireAuth allowPending>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/guide"
              element={
                <RequireAuth>
                  <Guide />
                </RequireAuth>
              }
            />
            <Route
              path="/catalogue"
              element={
                <RequireAuth allowPending>
                  <Catalog />
                </RequireAuth>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <RequireAuth allowPending>
                  <DocumentDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/ma-bibliotheque"
              element={
                <RequireAuth >
                  <MyLibrary />
                </RequireAuth>
              }
            />

            <Route
              path="/telecharger-l-application"
              element={
                <RequireAuth allowPending>
                  <Downloads />
                </RequireAuth>
              }
            />

            <Route
              path="/mes-depots"
              element={
                <RequireAuth roles={['teacher', 'admin']} >
                  <MyDeposits />
                </RequireAuth>
              }
            />
            <Route
              path="/deposer-un-support"
              element={
                <RequireAuth roles={['teacher', 'admin']} >
                  <DepositCourse />
                </RequireAuth>
              }
            />
            <Route
              path="/mes-depots/:id/modifier"
              element={
                <RequireAuth roles={['teacher', 'admin']} >
                  <EditDeposit />
                </RequireAuth>
              }
            />

            <Route
              path="/domaines"
              element={
                <RequireAuth roles={['admin']}>
                  <Domains />
                </RequireAuth>
              }
            />
            <Route
              path="/statistiques"
              element={
                <RequireAuth roles={['admin']}>
                  <Statistics />
                </RequireAuth>
              }
            />
            <Route
              path="/statistiques/conclusions"
              element={
                <RequireAuth roles={['admin']}>
                  <StatisticsSummary />
                </RequireAuth>
              }
            />
            <Route
              path="/utilisateurs"
              element={
                <RequireAuth roles={['admin']}>
                  <Users />
                </RequireAuth>
              }
            />
            <Route
              path="/utilisateurs/:id"
              element={
                <RequireAuth roles={['admin']}>
                  <UserDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/comptes-en-attente"
              element={
                <RequireAuth roles={['admin']}>
                  <PendingAccounts />
                </RequireAuth>
              }
            />
            <Route
              path="/demandes-de-suppression"
              element={
                <RequireAuth roles={['admin']}>
                  <PendingDeletionRequests />
                </RequireAuth>
              }
            />
            <Route
              path="/demandes-de-suppression/:id"
              element={
                <RequireAuth roles={['admin']}>
                  <DeletionRequestDetail />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
