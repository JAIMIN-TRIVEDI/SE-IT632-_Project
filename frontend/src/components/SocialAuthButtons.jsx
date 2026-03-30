import { Button, Stack, Typography, Box } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'

function SocialAuthButtons() {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Or continue with
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
            },
          }}
          onClick={() => {
            // Handle Google OAuth
            console.log('Google OAuth')
          }}
        >
          Google
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={
            <Box
              component="span"
              sx={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}
            >
              Ⓜ
            </Box>
          }
          sx={{
            borderColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 600,
            borderRadius: 2,
            py: 1.2,
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'),
            },
          }}
          onClick={() => {
            // Handle Microsoft OAuth
            console.log('Microsoft OAuth')
          }}
        >
          Microsoft
        </Button>
      </Stack>
    </Box>
  )
}

export default SocialAuthButtons
