import { Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'

function RecordsTable({
  columns,
  rows,
  loading,
  emptyMessage,
  page,
  rowsPerPage,
  totalRecords,
  onPageChange,
}) {
  const minTableWidth = Math.max(720, columns.length * 140)

  return (
    <TableContainer component={Paper} sx={{ boxShadow: '0 10px 30px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
      <Table sx={{ minWidth: minTableWidth }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align || 'left'}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell colSpan={columns.length}>
                  <Skeleton variant="text" height={34} />
                </TableCell>
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row._id || row.id} hover>
                {columns.map((column) => (
                  <TableCell key={`${row._id || row.id}-${column.key}`} align={column.align || 'left'}>
                    {column.render ? column.render(row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalRecords}
        page={Math.max(0, page - 1)}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
        rowsPerPageOptions={[rowsPerPage]}
      />
    </TableContainer>
  )
}

export default RecordsTable
