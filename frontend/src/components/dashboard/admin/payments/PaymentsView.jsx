import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import PaymentsKpiCards from './PaymentsKpiCards'
import PaymentsFiltersBar from './PaymentsFiltersBar'
import PaymentsTransactionsTable from './PaymentsTransactionsTable'
import { fetchAdminPayments } from '../../../../services/adminPaymentService'

const ROWS_PER_PAGE = 10

const buildCsvContent = (payments) => {
  const header = [
    'Transaction ID',
    'Tenant Name',
    'Tenant Email',
    'Hostel',
    'Room',
    'Date',
    'Amount',
    'Status',
    'Type',
    'Purpose',
  ]

  const rows = payments.map((item) => [
    item.transactionId,
    item.tenantName,
    item.tenantEmail,
    item.hostelName,
    item.roomNumber,
    item.date,
    item.amount,
    item.status,
    item.type,
    item.purpose,
  ])

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || '').replaceAll('"', '""')}"`).join(','))
    .join('\n')
}

const triggerDownload = (fileName, content) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.setAttribute('download', fileName)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function PaymentsView() {
  const isFirstLoad = useRef(true)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    pendingDues: 0,
    activeSubscriptions: 0,
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 350)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm, statusFilter, typeFilter])

  useEffect(() => {
    let isMounted = true

    const loadPayments = async () => {
      try {
        if (isFirstLoad.current) {
          setLoading(true)
        } else {
          setTableLoading(true)
        }
        setError('')

        const response = await fetchAdminPayments({
          page,
          limit: ROWS_PER_PAGE,
          search: debouncedSearchTerm,
          status: statusFilter,
          type: typeFilter,
        })

        if (!isMounted) return

        setPayments(response.data)
        setTotal(response.total)
        setTotalPages(response.totalPages)
        setMetrics(response.metrics)
      } catch (err) {
        if (!isMounted) return
        setError(err.response?.data?.message || 'Failed to load payment details.')
      } finally {
        if (isMounted) {
          setLoading(false)
          setTableLoading(false)
        }
        isFirstLoad.current = false
      }
    }

    loadPayments()
    return () => {
      isMounted = false
    }
  }, [page, debouncedSearchTerm, statusFilter, typeFilter])

  const handleExport = () => {
    const csvContent = buildCsvContent(payments)
    triggerDownload('hostezy-payments.csv', csvContent)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={0.5} sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800} color="text.primary">
          Payments Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor transactions, pending dues, and payment statuses across all hostels.
        </Typography>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button size="small" color="inherit" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <PaymentsKpiCards metrics={metrics} />

      <PaymentsFiltersBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        onExport={handleExport}
      />

      <PaymentsTransactionsTable
        payments={payments}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={tableLoading}
        onPageChange={setPage}
      />
    </Box>
  )
}

export default PaymentsView
