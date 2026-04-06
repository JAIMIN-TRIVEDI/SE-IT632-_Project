import React from 'react'
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import HighlightMatch from '../../../HighlightMatch.jsx'

export default function PaymentRecordsTable({ payments = [], searchQuery = '' }) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Payment Records
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                DATE
              </TableCell>
              <TableCell
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                DESCRIPTION
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                AMOUNT
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                }}
              >
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No payment records available.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const isHostelPayment = payment.type === 'hostel' || payment.type === 'room_request'
                const displayStatus = isHostelPayment
                  ? payment.status === 'success'
                    ? 'Paid'
                    : payment.status || 'Pending'
                  : 'N/A'
                return (
                  <TableRow
                    key={payment._id || payment.orderId}
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        <HighlightMatch text={payment.orderId || payment._id} query={searchQuery} />
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        <HighlightMatch
                          text={payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                          query={searchQuery}
                        />
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        <HighlightMatch text={payment.purpose || payment.type || 'Room payment'} query={searchQuery} />
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        <HighlightMatch text={`₹${Number(payment.amount || 0).toFixed(2)}`} query={searchQuery} />
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={displayStatus}
                        size="small"
                        sx={{
                          bgcolor:
                            displayStatus === 'Paid'
                              ? 'rgba(34, 197, 94, 0.1)'
                              : displayStatus === 'N/A'
                              ? 'rgba(107, 114, 128, 0.12)'
                              : 'rgba(234, 179, 8, 0.1)',
                          color:
                            displayStatus === 'Paid'
                              ? 'success.main'
                              : displayStatus === 'N/A'
                              ? 'text.secondary'
                              : 'warning.main',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          borderRadius: 4,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
