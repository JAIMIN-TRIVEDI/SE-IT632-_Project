import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchPaymentsRecords } from '../services/messRecordsService'

export function usePayments({ enabled, search }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('latest')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [stats, setStats] = useState({ total: 0, totalRevenue: 0 })

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
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate

    return params
  }, [endDate, page, search, sort, startDate, status])

  const queryKey = useMemo(() => JSON.stringify(queryParams), [queryParams])

  const fetchData = useCallback(async ({ force = false } = {}) => {
    if (!enabled) return
    if (!force && hasLoadedRef.current && lastQueryKeyRef.current === queryKey) return

    try {
      setLoading(true)
      setError('')
      const response = await fetchPaymentsRecords(queryParams)
      setItems(response.items)
      setPagination(response.pagination)
      setStats({
        total: response.stats?.total || response.pagination?.totalRecords || 0,
        totalRevenue: response.stats?.totalRevenue || response.totalRevenue || 0,
      })
      hasLoadedRef.current = true
      lastQueryKeyRef.current = queryKey
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }, [enabled, queryKey, queryParams])

  useEffect(() => {
    setPage(1)
  }, [search, status, sort, startDate, endDate])

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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pagination,
    stats,
    refresh: () => fetchData({ force: true }),
  }
}
