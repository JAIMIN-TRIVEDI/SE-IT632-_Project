import React from 'react'
import { Box, Card, Typography, Chip } from '@mui/material'
import {
  KingBed,
  Restaurant,
  CreditCard,
  CheckCircle,
} from '@mui/icons-material'
import { statusCards } from './data'

const iconMap = {
  KingBed: KingBed,
  Restaurant: Restaurant,
  CreditCard: CreditCard,
  CheckCircle: CheckCircle,
}

export default function StudentStatusCards() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
      {statusCards.map((card, idx) => {
        const IconComponent = iconMap[card.icon]
        return (
          <Card
            key={idx}
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'box-shadow 0.3s',
              '&:hover': { boxShadow: 4 },
            }}
          >
            {/* Header with Icon and Tag */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
              <Box
                sx={{
                  bgcolor: card.tagBg,
                  borderRadius: 1.5,
                  p: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconComponent sx={{ fontSize: 20, color: card.tagColor }} />
              </Box>
              <Chip
                label={card.tag}
                size="small"
                sx={{
                  color: card.tagColor,
                  bgcolor: card.tagBg,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: '22px',
                }}
              />
            </Box>

            {/* Value and Label */}
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ mt: 0.5 }}>
                {card.value}
              </Typography>
              {card.sub && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {card.sub}
                </Typography>
              )}
            </Box>
          </Card>
        )
      })}
    </Box>
  )
}
