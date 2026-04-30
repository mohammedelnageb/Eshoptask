import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingSpinnerProps {
  message?: string
  fullHeight?: boolean
}

export default function LoadingSpinner({ message = 'Loading...', fullHeight = true }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height: fullHeight ? '100%' : 'auto',
        minHeight: fullHeight ? '400px' : 'auto',
      }}
    >
      <CircularProgress />
      <Typography>{message}</Typography>
    </Box>
  )
}
