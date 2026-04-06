import React from 'react'
import { Box } from '@mui/material'

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function HighlightMatch({ text = '', query = '', sx = {} }) {
  const value = String(text ?? '')
  const trimmedQuery = String(query ?? '').trim()

  if (!trimmedQuery) {
    return <>{value}</>
  }

  const parts = value.split(new RegExp(`(${escapeRegex(trimmedQuery)})`, 'gi'))

  return (
    <Box component="span" sx={sx}>
      {parts.map((part, index) => (
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <Box
            component="mark"
            key={`${part}-${index}`}
            sx={{
              px: 0.25,
              borderRadius: 0.5,
              bgcolor: 'warning.light',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            {part}
          </Box>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        )
      ))}
    </Box>
  )
}