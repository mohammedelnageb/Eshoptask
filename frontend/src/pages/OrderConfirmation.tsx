import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { RootState, AppDispatch } from '../store'
import { setCurrentOrder, setLoading, setError } from '../store/slices/orderSlice'
import { orderAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const orderSteps = ['Order Confirmed', 'Processing', 'Shipped', 'Delivered']

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { currentOrder, isLoading, error } = useSelector((state: RootState) => state.orders)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    dispatch(setLoading(true))
    try {
      const response = await orderAPI.getOrderById(orderId!)
      dispatch(setCurrentOrder(response.data))
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to load order'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !currentOrder) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={error || 'Order not found'} />
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </Container>
    )
  }

  const getStepIndex = (status: string) => {
    const statusMap: { [key: string]: number } = {
      CONFIRMED: 0,
      PROCESSING: 1,
      SHIPPED: 2,
      DELIVERED: 3,
    }
    return statusMap[status] || 0
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Order Confirmed!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Thank you for your order. Order ID: <strong>{currentOrder.id}</strong>
        </Typography>
      </Box>

      {/* Order Status */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
          Order Status
        </Typography>
        <Stepper activeStep={getStepIndex(currentOrder.status)} sx={{ mb: 3 }}>
          {orderSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Current Status: <strong>{currentOrder.status}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Created: {new Date(currentOrder.createdAt).toLocaleString()}
          </Typography>
        </Box>
      </Card>

      {/* Order Items */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Order Items
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentOrder.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Order Summary */}
      <Card sx={{ p: 3, mb: 4 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal:</Typography>
            <Typography>${currentOrder.total.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Shipping:</Typography>
            <Typography>FREE</Typography>
          </Box>
          <Box
            sx={{
              borderTop: '1px solid #ddd',
              pt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
            }}
          >
            <Typography>Total:</Typography>
            <Typography sx={{ fontSize: '1.2rem' }}>${currentOrder.total.toFixed(2)}</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Shipping & Payment Info */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Shipping Address
          </Typography>
          <Typography variant="body2">{currentOrder.shippingAddress}</Typography>
        </Card>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Payment Method
          </Typography>
          <Typography variant="body2">{currentOrder.paymentMethod}</Typography>
        </Card>
      </Box>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
        <Button variant="outlined" onClick={() => navigate('/orders')}>
          View All Orders
        </Button>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </Stack>

      {/* Email Notification */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          A confirmation email has been sent to your registered email address.
        </Typography>
      </Box>
    </Container>
  )
}
