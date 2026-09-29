import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import DocumentCard from '../components/DocumentCard'
import { useAuth } from '../context/AuthContext'
import { getCatalog } from '../services/catalog'
import { getDomains } from '../services/domains'
import { SearchIcon, ChevronRightIcon, ArrowLeftIcon } from '../components/icons'

export default function Catalog() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [domains, setDomains] = useState([])

  const page = Number(searchParams.get('page') ?? 1)
  const domainId = searchParams.get('domain_id') ?? ''
  const subdomainId = searchParams.get('subdomain_id') ?? ''
  const selectedDomain = domains.find((d) => String(d.id) === domainId)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
  }, [])

  useEffect(() => {
    setLoading(true)
    getCatalog({
      search: searchParams.get('search') ?? undefined,
      domain_id: domainId || undefined,
      subdomain_id: subdomainId || undefined,
      page,
    })
      .then((res) => setResults(res.data))
      .finally(() => setLoading(false))
  }, [searchParams])

  function handleSearch(e) {
    e.preventDefault()
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (search) params.search = search
    else delete params.search
    setSearchParams(params)
  }

  function handleDomainChange(e) {
    const params = Object.fromEntries(searchParams)
    delete params.page
    delete params.subdomain_id
    if (e.target.value) params.domain_id = e.target.value
    else delete params.domain_id
    setSearchParams(params)
  }

  function handleSubdomainChange(e) {
    const params = Object.fromEntries(searchParams)
    delete params.page
    if (e.target.value) params.subdomain_id = e.target.value
    else delete params.subdomain_id
    setSearchParams(params)
  }

  function goToPage(nextPage) {
    const params = Object.fromEntries(searchParams)
    setSearchParams({ ...params, page: nextPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <DashboardLayout role={user.role}>
      <h1 className="text-3xl font-bold text-primary">{t('nav.catalog')}</h1>
      <p className="mt-2 text-on-surface-variant">{t('catalog.intro')}</p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <SearchIcon
            width={18}
            height={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
            className="w-full rounded border border-outline bg-surface-container-lowest py-3 pl-11 pr-4 focus:outline-none focus:border-2 focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-primary px-6 font-semibold text-on-primary hover:bg-primary-container transition-colors"
        >
          {t('common.search')}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-3">
        <select
          value={domainId}
          onChange={handleDomainChange}
          className="rounded border border-outline bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-2 focus:border-primary"
        >
          <option value="">{t('catalog.allDomains')}</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
        <select
          value={subdomainId}
          onChange={handleSubdomainChange}
          disabled={!selectedDomain}
          className="rounded border border-outline bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-2 focus:border-primary disabled:opacity-50"
        >
          <option value="">{t('catalog.allSubdomains')}</option>
          {selectedDomain?.subdomains.map((subdomain) => (
            <option key={subdomain.id} value={subdomain.id}>
              {subdomain.name}
            </option>
          ))}
        </select>
      </div>

      {!loading && results && (
        <p className="mt-6 text-sm text-on-surface-variant">
          {t('catalog.resultCount', { count: results.total })}
        </p>
      )}

      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading &&
          results?.data.map((doc) => (
            <DocumentCard
              key={doc.id}
              title={doc.title}
              author={doc.author}
              subject={doc.subdomain?.name}
              coverUrl={doc.cover_url}
              onClick={() => navigate(`/documents/${doc.id}`)}
            />
          ))}
      </div>

      {!loading && results?.data.length === 0 && (
        <p className="mt-6 text-on-surface-variant text-sm">{t('catalog.noResults')}</p>
      )}

      {!loading && results && results.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            disabled={!results.prev_page_url}
            onClick={() => goToPage(page - 1)}
            className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface disabled:opacity-40"
          >
            <ArrowLeftIcon width={16} height={16} />
            {t('common.previous')}
          </button>
          <span className="text-sm text-on-surface-variant">
            {t('catalog.pageOf', { current: results.current_page, last: results.last_page })}
          </span>
          <button
            disabled={!results.next_page_url}
            onClick={() => goToPage(page + 1)}
            className="inline-flex items-center gap-1.5 rounded border border-outline px-3 py-2 text-sm font-semibold text-on-surface disabled:opacity-40"
          >
            {t('common.next')}
            <ChevronRightIcon width={16} height={16} />
          </button>
        </div>
      )}
    </DashboardLayout>
  )
}
