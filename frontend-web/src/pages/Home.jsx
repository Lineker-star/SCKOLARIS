import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import LibraryArt from '../components/LibraryArt'
import { SearchIcon, BookOpenIcon, DownloadIcon } from '../components/icons'

export default function Home() {
  const { t } = useTranslation()

  const tools = [
    { icon: SearchIcon, title: t('home.tools.search.title'), text: t('home.tools.search.text') },
    { icon: BookOpenIcon, title: t('home.tools.read.title'), text: t('home.tools.read.text') },
    { icon: DownloadIcon, title: t('home.tools.download.title'), text: t('home.tools.download.text') },
  ]

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight tracking-tight">
              {t('home.hero.title')}
            </h1>
            <p className="mt-5 text-lg text-on-surface-variant leading-relaxed">
              {t('home.hero.text')}
            </p>
            <Link
              to="/catalogue"
              className="mt-7 inline-flex items-center rounded bg-primary px-6 py-3 font-semibold text-on-primary hover:bg-primary-container transition-colors"
            >
              {t('home.hero.cta')}
            </Link>
          </div>
          <LibraryArt className="h-72 md:h-96 w-full min-w-0" />
        </section>

        <section className="max-w-(--container-max-width) min-w-0 mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-primary mb-8">
            {t('home.toolsTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {tools.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container">
                  <Icon className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-on-surface">{title}</h3>
                <p className="mt-2 text-on-surface-variant text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
