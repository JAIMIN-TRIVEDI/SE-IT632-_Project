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
import { paymentRecords } from './data'

export default function PaymentRecordsTable() {
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
            {paymentRecords.map((payment) => (
              <TableRow
                key={payment.id}
                sx={{
                  '&:last-child td': { borderBottom: 0 },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {payment.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {payment.date}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{payment.description}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {payment.amount}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={payment.status}
                    size="small"
                    sx={{
                      bgcolor:
                        payment.status === 'Paid'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(234, 179, 8, 0.1)',
                      color:
                        payment.status === 'Paid'
                          ? 'success.main'
                          : 'warning.main',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: 4,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
