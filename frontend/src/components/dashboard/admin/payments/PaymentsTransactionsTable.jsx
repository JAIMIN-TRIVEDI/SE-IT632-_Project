import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { Visibility } from '@mui/icons-material'
import { formatCurrency, formatDate, getStatusChipColor, toTitleCase } from './paymentHelpers'

const getInitials = (name) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'NA'
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('')
}

function PaymentsTransactionsTable({ payments, total, page, totalPages, loading, onPageChange }) {
  const pageRows = payments

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Recent Transactions
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          Showing {pageRows.length} of {total} results
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Tenant</TableCell>
              <TableCell>Hostel</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{payment.transactionId}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
                      {getInitials(payment.tenantName)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.tenantName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.tenantEmail}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {payment.hostelName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Room: {payment.roomNumber}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={toTitleCase(payment.status)}
                    color={getStatusChipColor(payment.status)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={toTitleCase(payment.type)} variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View details">
                    <IconButton size="small" color="primary">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {!loading && pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No payments found for the selected filters.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading payments...
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ px: 2.5, py: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}`, overflowX: 'auto' }}>
        <Pagination
          page={page}
          onChange={(_, value) => onPageChange(value)}
          count={Math.max(1, totalPages)}
          color="primary"
          size="small"
        />
      </Box>
    </Box>
  )
}

export default PaymentsTransactionsTable
