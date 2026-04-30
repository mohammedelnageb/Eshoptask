import { Skeleton, Grid, Box } from '@mui/material'

interface SkeletonLoaderProps {
  count?: number
  variant?: 'product' | 'list' | 'table'
}

export default function SkeletonLoader({ count = 6, variant = 'product' }: SkeletonLoaderProps) {
  if (variant === 'product') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 1 }} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: count }).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </Box>
        ))}
      </Box>
    )
  }

  return null
}
