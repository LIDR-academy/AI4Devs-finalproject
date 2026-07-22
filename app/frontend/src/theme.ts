import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6c63ff',
      light: '#9ca5ff',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#2dd4bf',
    },
    background: {
      default: '#06091a',
      paper: '#0e1330',
    },
    text: {
      primary: '#e7ebff',
      secondary: '#aab5dd',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Manrope', 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at 15% 15%, rgba(108,99,255,0.22) 0%, rgba(6,9,26,0) 45%), radial-gradient(circle at 85% 25%, rgba(45,212,191,0.14) 0%, rgba(6,9,26,0) 40%), #06091a',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, rgba(18, 25, 58, 0.9), rgba(11, 16, 38, 0.9))',
          border: '1px solid rgba(139, 158, 255, 0.2)',
          backdropFilter: 'blur(6px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha('#9ca5ff', 0.45)}`,
          background: alpha('#6c63ff', 0.2),
        },
      },
    },
  },
})