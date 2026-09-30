import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'

export default function LegalPage({ title, updatedAt, children }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">{title}</h1>
          <p className="mt-2 text-sm text-on-surface-variant">{t('legal.lastUpdated')} {updatedAt}</p>

          <div className="mt-8 space-y-6 text-on-surface leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-on-surface">
            {children}
          </div>
        </section>
      </main>
    </div>
  )
}
