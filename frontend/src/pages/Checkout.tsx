import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { RootState, AppDispatch } from '../store'
import { clearCart } from '../store/slices/cartSlice'
import { orderAPI } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

const steps = ['Shipping Address', 'Payment Method', 'Review & Confirm']

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { items, totalAmount } = useSelector((state: RootState) => state.cart)
  const { user } = useSelector((state: RootState) => state.auth)

  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  })

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Please log in to proceed with checkout.{' '}
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </Alert>
      </Container>
    )
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Your cart is empty.{' '}
          <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
        </Alert>
      </Container>
    )
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!shippingAddress.street || !shippingAddress.city) {
        setError('Please fill in all shipping address fields')
        return
      }
    }
    setError(null)
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const addressString = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`

      const response = await orderAPI.createOrder({
        userId: Number(user.id),
        userEmail: user.email,
        items: items.map((item) => ({
          productId: item.productId,
          productSku: item.sku,
          productName: item.productName,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        shippingAddress: addressString,
        paymentMethod,
      })

      dispatch(clearCart())
      navigate(`/order-confirmation/${response.data.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Checkout
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <ErrorMessage message={error} sx={{ mb: 2 }} />

          {/* Step 0: Shipping Address */}
          {activeStep === 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shipping Address
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Street Address"
                  fullWidth
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="City"
                    fullWidth
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                  />
                  <TextField
                    label="State"
                    fullWidth
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                  />
                  <TextField
                    label="Country"
                    fullWidth
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          )}

          {/* Step 1: Payment Method */}
          {activeStep === 1 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Payment Method
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Cardholder Name"
                  fullWidth
                  value={cardDetails.cardholderName}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                  }
                />
                <TextField
                  label="Card Number"
                  fullWidth
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                  }
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Expiry Date"
                    placeholder="MM/YY"
                    fullWidth
                    value={cardDetails.expiryDate}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                    }
                  />
                  <TextField
                    label="CVV"
                    type="password"
                    fullWidth
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Note: This is a demo. Use test card: 4111 1111 1111 1111
                </Typography>
              </Stack>
            </Card>
          )}

          {/* Step 2: Review */}
          {activeStep === 2 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Review
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Shipping Address:</Typography>
                <Typography variant="body2">
                  {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state}{' '}
                  {shippingAddress.zipCode}, {shippingAddress.country}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Payment Method:</Typography>
                <Typography variant="body2">{paymentMethod}</Typography>
              </Box>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{ flexGrow: 1 }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            )}
          </Stack>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Summary
            </Typography>
            <Stack spacing={2}>
              {items.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.productName} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">${item.totalPrice.toFixed(2)}</Typography>
                </Box>
              ))}
              <Box
                sx={{
                  borderTop: '1px solid #ddd',
                  pt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
