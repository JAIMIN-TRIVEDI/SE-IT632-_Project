import { Box, Card, CardContent, Typography } from '@mui/material'

function StudentStatCard({ icon: Icon, gradient, label, value, sub }) {
  return (
    <Card
      sx={{
        flex: 1,
        borderRadius: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: 'visible',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Icon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Typography
          fontSize={12}
          color="#94a3b8"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing={0.5}
        >
          {label}
        </Typography>
        <Typography fontSize={26} fontWeight={900} color="#0f172a" lineHeight={1.2} mt={0.3}>
          {value}
        </Typography>
        <Typography fontSize={12} color="#64748b" mt={0.3}>
          {sub}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default StudentStatCard
