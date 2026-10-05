import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LibraryArt from '../components/LibraryArt'
import { BuildingIcon, BookOpenIcon, BadgeCheckIcon, UsersIcon } from '../components/icons'

export default function About() {
  const { t } = useTranslation()

  const mission = [
    { icon: BookOpenIcon, title: t('about.mission.access.title'), text: t('about.mission.access.text') },
    { icon: BadgeCheckIcon, title: t('about.mission.quality.title'), text: t('about.mission.quality.text') },
    { icon: UsersIcon, title: t('about.mission.community.title'), text: t('about.mission.community.text') },
  ]

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
              {t('about.hero.title')}
            </h1>
            <p className="mt-5 text-lg text-on-surface-variant leading-relaxed">
              {t('about.hero.text')}
            </p>
          </div>
          <LibraryArt className="h-72 md:h-96 w-full min-w-0" />
        </section>

        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 pb-12 grid md:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-lg border border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-4 p-10 text-center">
            <BuildingIcon width={40} height={40} className="text-primary" />
            <p className="font-semibold text-lg text-on-surface">{t('about.institution')}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary mb-3">{t('about.local.title')}</h2>
            <p className="text-on-surface-variant leading-relaxed">{t('about.local.text')}</p>
          </div>
        </section>

        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <div className="rounded-lg bg-surface-container-low border border-outline-variant p-8">
            <h2 className="text-center text-2xl font-bold text-primary mb-8">{t('about.missionTitle')}</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {mission.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center"
                >
                  <Icon width={28} height={28} className="mx-auto mb-3 text-secondary" />
                  <h3 className="font-semibold text-on-surface">{title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
