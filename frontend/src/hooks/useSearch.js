import { useCallback, useEffect, useMemo, useState } from 'react'

const normalizeSearch = (value = '') => value.trim()

export function useSearch(initialValue = '', delay = 400) {
  const [search, setSearch] = useState(initialValue)
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, delay])

  const normalizedSearch = useMemo(() => normalizeSearch(search), [search])
  const normalizedDebouncedSearch = useMemo(() => normalizeSearch(debouncedSearch), [debouncedSearch])

  const isDebouncing = normalizedSearch !== normalizedDebouncedSearch

  const buildSearchParams = useCallback(
    (extraParams = {}) => {
      const params = { ...extraParams }

      if (normalizedDebouncedSearch) {
        params.search = normalizedDebouncedSearch
      }

      return params
    },
    [normalizedDebouncedSearch]
  )

  return {
    search,
    setSearch,
    debouncedSearch: normalizedDebouncedSearch,
    isDebouncing,
    buildSearchParams,
  }
}
