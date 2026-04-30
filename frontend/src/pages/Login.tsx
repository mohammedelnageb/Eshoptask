import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
  Alert,
} from '@mui/material'
import { AppDispatch } from '../store'
import { loginSuccess, loginFailure, setLoading } from '../store/slices/authSlice'
import { authAPI } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoadingState] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoadingState(true)
    dispatch(setLoading(true))

    try {
      const response = await authAPI.login(email, password)
      const { user, token, refreshToken } = response.data

      dispatch(
        loginSuccess({
          user,
          token,
          refreshToken,
        })
      )

      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
      setError(errorMessage)
      dispatch(loginFailure(errorMessage))
    } finally {
      setLoadingState(false)
      dispatch(setLoading(false))
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Stack>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer' }}
            >
              Register here
            </Link>
          </Typography>
        </Box>

        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #ddd', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Demo Credentials:
          </Typography>
          <Typography variant="caption" display="block">
            Email: demo@techshop.com
          </Typography>
          <Typography variant="caption" display="block">
            Password: Demo123!
          </Typography>
        </Box>
      </Card>
    </Container>
  )
}
