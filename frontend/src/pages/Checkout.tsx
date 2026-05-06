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
import { inventoryAPI, orderAPI } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'
import { useIntlSettings } from '../i18n/IntlContext'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { items, totalAmount } = useSelector((state: RootState) => state.cart)
  const { user } = useSelector((state: RootState) => state.auth)
  const { convertMoney, currency, formatMoney, t } = useIntlSettings()
  const steps = [t('checkout.shipping'), t('checkout.payment'), t('checkout.review')]

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
          {t('checkout.loginRequired')}{' '}
          <Button onClick={() => navigate('/login')}>{t('checkout.goToLogin')}</Button>
        </Alert>
      </Container>
    )
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          {t('checkout.emptyCart')}{' '}
          <Button onClick={() => navigate('/products')}>{t('cart.continue')}</Button>
        </Alert>
      </Container>
    )
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!shippingAddress.street || !shippingAddress.city) {
        setError(t('checkout.validation.shipping'))
        return
      }
    }
    setError(null)
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const validateStock = async () => {
    const productIds = items.map((item) => item.productId)
    const response = await inventoryAPI.getInventoriesByProducts(productIds)
    const inventoryByProduct = new Map(
      response.data.map((inventory) => [inventory.productId, inventory])
    )

    for (const item of items) {
      const inventory = inventoryByProduct.get(item.productId)
      if (!inventory) {
        throw new Error(t('checkout.validation.stockMissing', { product: item.productName }))
      }
      if (inventory.availableQuantity < item.quantity) {
        throw new Error(
          t('checkout.validation.stock', {
            product: item.productName,
            available: inventory.availableQuantity,
          })
        )
      }
    }
  }

  const reserveCartStock = async () => {
    const reservedItems: Array<{ productId: number; quantity: number; productName: string }> = []
    let currentItemName = 'selected product'

    try {
      for (const item of items) {
        currentItemName = item.productName
        await inventoryAPI.reserveStock(item.productId, item.quantity)
        reservedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.productName,
        })
      }
      return reservedItems
    } catch (err: any) {
      await releaseReservedStock(reservedItems)
      throw new Error(
        t('checkout.validation.stockReserve', {
          product: currentItemName,
        })
      )
    }
  }

  const releaseReservedStock = async (
    reservedItems: Array<{ productId: number; quantity: number }>
  ) => {
    await Promise.allSettled(
      reservedItems.map((item) => inventoryAPI.releaseStock(item.productId, item.quantity))
    )
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError(null)
    let reservedItems: Array<{ productId: number; quantity: number }> = []
    try {
      await validateStock()
      reservedItems = await reserveCartStock()

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
          unitPrice: convertMoney(item.unitPrice),
          totalPrice: convertMoney(item.totalPrice),
        })),
        shippingAddress: addressString,
        paymentMethod,
        currency,
      })

      dispatch(clearCart())
      navigate(`/order-confirmation/${response.data.id}`)
    } catch (err: any) {
      if (reservedItems.length > 0) {
        await releaseReservedStock(reservedItems)
      }
      setError(err.message || err.response?.data?.message || t('checkout.error.placeOrder'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        {t('checkout.title')}
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
                {t('checkout.shipping')}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label={t('checkout.street')}
                  fullWidth
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label={t('checkout.city')}
                    fullWidth
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                  />
                  <TextField
                    label={t('checkout.state')}
                    fullWidth
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label={t('checkout.zip')}
                    fullWidth
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                  />
                  <TextField
                    label={t('checkout.country')}
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
                {t('checkout.payment')}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label={t('checkout.cardholder')}
                  fullWidth
                  value={cardDetails.cardholderName}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cardholderName: e.target.value })
                  }
                />
                <TextField
                  label={t('checkout.cardNumber')}
                  fullWidth
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                  }
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label={t('checkout.expiry')}
                    placeholder="MM/YY"
                    fullWidth
                    value={cardDetails.expiryDate}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiryDate: e.target.value })
                    }
                  />
                  <TextField
                    label={t('checkout.cvv')}
                    type="password"
                    fullWidth
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {t('checkout.demoNote')}
                </Typography>
              </Stack>
            </Card>
          )}

          {/* Step 2: Review */}
          {activeStep === 2 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('checkout.review')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{t('checkout.shippingAddress')}:</Typography>
                <Typography variant="body2">
                  {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state}{' '}
                  {shippingAddress.zipCode}, {shippingAddress.country}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">{t('checkout.paymentMethod')}:</Typography>
                <Typography variant="body2">{paymentMethod}</Typography>
              </Box>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              {t('checkout.back')}
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                {t('checkout.next')}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{ flexGrow: 1 }}
              >
                {loading ? t('checkout.placingOrder') : t('checkout.placeOrder')}
              </Button>
            )}
          </Stack>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('checkout.summary')}
            </Typography>
            <Stack spacing={2}>
              {items.map((item) => (
                <Box key={item.productId} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.productName} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">{formatMoney(item.totalPrice)}</Typography>
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
                  {t('cart.total')}:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatMoney(totalAmount)}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
