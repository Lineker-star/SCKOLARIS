import { useCallback, useEffect, useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import AppShell from '../components/AppShell'
import DocumentCard from '../components/DocumentCard'
import { getCatalog } from '../services/catalog'
import { getDomains } from '../services/domains'
import { SearchIcon, ChevronRightIcon, ArrowLeftIcon } from '../components/icons'

// Portage de Catalog.jsx (web). La grille responsive du web devient une
// simple liste verticale (DocumentCard est déjà pensé pleine largeur). Pas
// de <select> en React Native : le choix domaine/sous-domaine se fait via
// deux rangées de puces (même pattern que le choix de rôle dans
// UserDetailScreen.jsx).
export default function CatalogScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute()
  const [search, setSearch] = useState(route.params?.search ?? '')
  const [appliedSearch, setAppliedSearch] = useState(route.params?.search ?? '')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [domains, setDomains] = useState([])
  const [domainId, setDomainId] = useState(null)
  const [subdomainId, setSubdomainId] = useState(null)

  const selectedDomain = domains.find((d) => d.id === domainId)

  useEffect(() => {
    getDomains().then((res) => setDomains(res.data.domains))
  }, [])

  useEffect(() => {
    setLoading(true)
    getCatalog({ search: appliedSearch || undefined, domain_id: domainId ?? undefined, subdomain_id: subdomainId ?? undefined, page })
      .then((res) => setResults(res.data))
      .finally(() => setLoading(false))
  }, [appliedSearch, domainId, subdomainId, page])

  const handleSearch = useCallback(() => {
    setPage(1)
    setAppliedSearch(search)
  }, [search])

  function selectDomain(id) {
    setPage(1)
    setSubdomainId(null)
    setDomainId((current) => (current === id ? null : id))
  }

  function selectSubdomain(id) {
    setPage(1)
    setSubdomainId((current) => (current === id ? null : id))
  }

  return (
    <AppShell title={t('nav.catalog')}>
      <FlatList
        data={loading ? [] : (results?.data ?? [])}
        keyExtractor={(doc) => String(doc.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View className="mb-4">
            <Text className="text-2xl font-bold text-primary dark:text-primary-night">{t('nav.catalog')}</Text>
            <Text className="mt-1 text-on-surface-variant dark:text-on-surface-variant-night">
              {t('catalog.intro')}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <View className="relative flex-1">
                <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                  <SearchIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                </View>
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={handleSearch}
                  placeholder={t('catalog.searchPlaceholder')}
                  placeholderTextColor="#8a90a0"
                  className="rounded border border-outline dark:border-outline-night bg-surface-container-lowest dark:bg-surface-container-lowest-night py-3 pl-10 pr-3 text-on-surface dark:text-on-surface-night"
                />
              </View>
              <Pressable onPress={handleSearch} className="rounded bg-primary dark:bg-primary-night px-5 items-center justify-center">
                <Text className="font-semibold text-on-primary dark:text-on-primary-night">{t('common.search')}</Text>
              </Pressable>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              {domains.map((domain) => (
                <Pressable
                  key={domain.id}
                  onPress={() => selectDomain(domain.id)}
                  className={`rounded-full px-3 py-1.5 ${
                    domainId === domain.id ? 'bg-primary dark:bg-primary-night' : 'bg-surface-container dark:bg-surface-container-night'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      domainId === domain.id
                        ? 'text-on-primary dark:text-on-primary-night'
                        : 'text-on-surface-variant dark:text-on-surface-variant-night'
                    }`}
                  >
                    {domain.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {selectedDomain ? (
              <View className="mt-2 flex-row flex-wrap gap-2">
                {selectedDomain.subdomains.map((subdomain) => (
                  <Pressable
                    key={subdomain.id}
                    onPress={() => selectSubdomain(subdomain.id)}
                    className={`rounded-full px-3 py-1.5 ${
                      subdomainId === subdomain.id ? 'bg-secondary-container dark:bg-secondary-container-night' : 'bg-surface-container dark:bg-surface-container-night'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        subdomainId === subdomain.id
                          ? 'text-on-secondary-container dark:text-on-secondary-container-night'
                          : 'text-on-surface-variant dark:text-on-surface-variant-night'
                      }`}
                    >
                      {subdomain.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {!loading && results ? (
              <Text className="mt-4 text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {t('catalog.resultCount', { count: results.total })}
              </Text>
            ) : null}

            {loading ? <ActivityIndicator className="mt-6" /> : null}
          </View>
        }
        renderItem={({ item: doc }) => (
          <DocumentCard
            title={doc.title}
            author={doc.author}
            subject={doc.subdomain?.name}
            coverUrl={doc.cover_url}
            onPress={() => navigation.navigate('DocumentDetail', { id: doc.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !loading ? (
            <Text className="text-on-surface-variant dark:text-on-surface-variant-night text-sm">
              {t('catalog.noResults')}
            </Text>
          ) : null
        }
        ListFooterComponent={
          !loading && results && results.last_page > 1 ? (
            <View className="mt-6 flex-row items-center justify-center gap-4">
              <Pressable
                disabled={!results.prev_page_url}
                onPress={() => setPage((p) => p - 1)}
                className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-2 disabled:opacity-40"
              >
                <ArrowLeftIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.previous')}</Text>
              </Pressable>
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">
                {t('catalog.pageOf', { current: results.current_page, last: results.last_page })}
              </Text>
              <Pressable
                disabled={!results.next_page_url}
                onPress={() => setPage((p) => p + 1)}
                className="flex-row items-center gap-1.5 rounded border border-outline dark:border-outline-night px-3 py-2 disabled:opacity-40"
              >
                <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{t('common.next')}</Text>
                <ChevronRightIcon width={16} height={16} className="text-on-surface dark:text-on-surface-night" />
              </Pressable>
            </View>
          ) : null
        }
      />
    </AppShell>
  )
}
