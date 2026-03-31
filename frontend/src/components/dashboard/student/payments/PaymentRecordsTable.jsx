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

export default function PaymentRecordsTable({ payments = [] }) {
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
                const displayStatus = payment.status === 'success' ? 'Paid' : payment.status || 'Pending'
                return (
                  <TableRow
                    key={payment._id || payment.orderId}
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {payment.orderId || payment._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.purpose || payment.type || 'Room payment'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        ₹{Number(payment.amount || 0).toFixed(2)}
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
                              : 'rgba(234, 179, 8, 0.1)',
                          color: displayStatus === 'Paid' ? 'success.main' : 'warning.main',
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
