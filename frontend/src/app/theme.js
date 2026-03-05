import { createTheme } from '@mui/material/styles'

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2f61ff',
      },
      secondary: {
        main: '#0ea5e9',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: mode === 'dark' ? '#cbd5f5' : '#475569',
      },
      background: {
        default: mode === 'dark' ? '#0b1224' : '#f6f8fb',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
      },
      divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)',
    },
    typography: {
      fontFamily: '"Manrope", "Segoe UI", sans-serif',
      h1: {
        fontWeight: 800,
        fontSize: '3.2rem',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 800,
        fontSize: '2.2rem',
        letterSpacing: '-0.01em',
      },
      h5: {
        fontWeight: 700,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
  })

export default getTheme
