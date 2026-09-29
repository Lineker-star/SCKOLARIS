import { ScrollView, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { BookOpenIcon, ShieldCheckIcon, UploadCloudIcon, UsersIcon } from '../components/icons'

function Topic({ title, icon, children }) {
  return (
    <View className="rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night p-5">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="flex-1 text-lg font-semibold text-on-surface dark:text-on-surface-night">{title}</Text>
      </View>
      <Text className="mt-3 text-sm leading-6 text-on-surface-variant dark:text-on-surface-variant-night">{children}</Text>
    </View>
  )
}

export default function GuideScreen() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  return (
    <AppShell title={t('nav.guide')}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <View>
          <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.guide')}</Text>
          <Text className="mt-2 text-sm leading-6 text-on-surface-variant dark:text-on-surface-variant-night">
            {isAdmin ? 'Guide complet: espace commun, étudiant, enseignant et administration.' : isTeacher ? 'Guide de l’espace enseignant et des fonctionnalités communes.' : 'Guide de l’espace étudiant et des fonctionnalités communes.'}
          </Text>
        </View>

        <Topic title="Fonctionnalités communes" icon={<BookOpenIcon width={20} height={20} className="text-primary dark:text-primary-night" />}>
          Consultez le catalogue, recherchez par titre, auteur, filière, domaine ou sous-domaine, puis ouvrez un document pour le lire en ligne. Le téléchargement et Ma bibliothèque sont disponibles après validation du compte. Depuis Profil, vous pouvez modifier vos informations, votre photo et votre mot de passe.
        </Topic>

        {(isStudent || isAdmin) ? (
          <Topic title="Espace étudiant" icon={<BookOpenIcon width={20} height={20} className="text-primary dark:text-primary-night" />}>
            L’étudiant utilise le Tableau de bord, le Catalogue, Ma bibliothèque, Profil et Télécharger l’application. Il ne peut pas déposer de support, gérer les comptes, les domaines, les demandes de suppression ni les statistiques.
          </Topic>
        ) : null}

        {(isTeacher || isAdmin) ? (
          <Topic title="Espace enseignant" icon={<UploadCloudIcon width={20} height={20} className="text-primary dark:text-primary-night" />}>
            Après validation, l’enseignant peut déposer un support en précisant la filière et le sous-domaine, modifier ses propres dépôts et demander leur suppression avec une justification. Seul un administrateur traite la demande de suppression.
          </Topic>
        ) : null}

        {isAdmin ? (
          <Topic title="Administration" icon={<ShieldCheckIcon width={20} height={20} className="text-primary dark:text-primary-night" />}>
            L’administrateur valide ou rejette les comptes, change les rôles, active ou désactive les comptes, gère les domaines et sous-domaines, traite les demandes de suppression, consulte les statistiques et publie les releases Windows et Android.
          </Topic>
        ) : null}

        <Topic title="Accès et sécurité" icon={<UsersIcon width={20} height={20} className="text-primary dark:text-primary-night" />}>
          Un compte en attente peut consulter et lire le catalogue, mais ne peut pas télécharger ni déposer. Les actions d’administration restent réservées au rôle administrateur.
        </Topic>
      </ScrollView>
    </AppShell>
  )
}
