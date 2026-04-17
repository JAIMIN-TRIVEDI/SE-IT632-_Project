import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchStudentsRecords } from '../services/messRecordsService'

export function useStudents({ enabled, search }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('latest')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [stats, setStats] = useState({ total: 0 })

  const hasLoadedRef = useRef(false)
  const lastQueryKeyRef = useRef('')

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 10,
      sort,
    }

    if (search?.trim()) params.search = search.trim()
    if (status !== 'all') params.status = status

    return params
  }, [page, search, sort, status])

  const queryKey = useMemo(() => JSON.stringify(queryParams), [queryParams])

  const fetchData = useCallback(async ({ force = false } = {}) => {
    if (!enabled) return
    if (!force && hasLoadedRef.current && lastQueryKeyRef.current === queryKey) return

    try {
      setLoading(true)
      setError('')
      const response = await fetchStudentsRecords(queryParams)
      setItems(response.items)
      setPagination(response.pagination)
      setStats({
        total: response.stats?.total || response.pagination?.totalRecords || 0,
      })
      hasLoadedRef.current = true
      lastQueryKeyRef.current = queryKey
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }, [enabled, queryKey, queryParams])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    items,
    loading,
    error,
    page,
    setPage,
    status,
    setStatus,
    sort,
    setSort,
    pagination,
    stats,
    refresh: () => fetchData({ force: true }),
  }
}
