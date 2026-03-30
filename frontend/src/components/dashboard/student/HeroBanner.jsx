import { Box, Button } from '@mui/material'
import { ArrowForwardIos } from '@mui/icons-material'
import { Typography } from '@mui/material'

function HeroBanner() {
  return (
    <Box
      sx={{
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          right: -40,
          top: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: 60,
          bottom: -60,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />
      <Box>
        <Typography
          fontSize={12}
          fontWeight={700}
          color="#a5b4fc"
          letterSpacing={1}
          textTransform="uppercase"
          mb={0.5}
        >
          🎯 This Month's Goal
        </Typography>
        <Typography fontSize={20} fontWeight={900} color="#fff" lineHeight={1.3}>
          Maintain 90%+ attendance
          <br />
          <Box component="span" sx={{ color: '#a5b4fc', fontSize: 15, fontWeight: 600 }}>
            You're currently at 86% — keep going!
          </Box>
        </Typography>
      </Box>
      <Button
        endIcon={<ArrowForwardIos sx={{ fontSize: '12px !important' }} />}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          fontSize: 13,
          color: '#312e81',
          bgcolor: '#fff',
          borderRadius: 3,
          px: 2.5,
          py: 1.2,
          flexShrink: 0,
          '&:hover': { bgcolor: '#e0e7ff' },
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        View Details
      </Button>
    </Box>
  )
}

export default HeroBanner
