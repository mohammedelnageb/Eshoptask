import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Stack,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { useState } from 'react'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { RootState, AppDispatch } from '../store'
import { fetchProductById } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import { productAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { useIntlSettings } from '../i18n/IntlContext'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { formatMoney, t } = useIntlSettings()
  const { currentProduct, loading, error } = useSelector((state: RootState) => state.products)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(parseInt(id)) as any)
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentProduct?.id) {
      loadReviews()
    }
  }, [currentProduct?.id])

  const loadReviews = async () => {
    if (!currentProduct) return
    try {
      setReviewLoading(true)
      const response = await productAPI.getProductReviews(currentProduct.id)
      setReviews(response.data || [])
    } catch (err) {
      console.error('Failed to load reviews', err)
    } finally {
      setReviewLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (currentProduct) {
      dispatch(
        addToCart({
          productId: currentProduct.id,
          productName: currentProduct.name,
          productImageUrl: currentProduct.thumbnailUrl,
          sku: currentProduct.sku,
          quantity,
          unitPrice: currentProduct.discountedPrice || currentProduct.price,
          totalPrice: (currentProduct.discountedPrice || currentProduct.price) * quantity,
        })
      )
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    }
  }

  const handleAddReview = async () => {
    if (!currentProduct) return
    try {
      await productAPI.addReview(currentProduct.id, reviewForm)
      setReviewDialog(false)
      setReviewForm({ rating: 5, title: '', comment: '' })
      loadReviews()
    } catch (err) {
      console.error('Failed to add review', err)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !currentProduct) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorMessage message={error || 'Product not found'} />
        <Button onClick={() => navigate('/products')}>{t('product.back')}</Button>
      </Container>
    )
  }

  const discountPercentage = currentProduct.discountedPrice
    ? Math.round(((currentProduct.price - currentProduct.discountedPrice) / currentProduct.price) * 100)
    : 0

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button onClick={() => navigate('/products')} sx={{ mb: 2 }}>
        {t('product.back')}
      </Button>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={5}>
          <Box
            component="img"
            src={currentProduct.imageUrl || currentProduct.thumbnailUrl}
            alt={currentProduct.name}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 1,
              boxShadow: 2,
            }}
          />
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={7}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            {currentProduct.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Rating value={currentProduct.averageRating} readOnly />
            <Typography variant="body2" color="text.secondary">
              {currentProduct.reviewCount} {t('product.reviews')}
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('product.brand')}: <strong>{currentProduct.brand}</strong>
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('product.category')}: <strong>{currentProduct.category}</strong>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            SKU: {currentProduct.sku}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {currentProduct.description}
          </Typography>

          {/* Price */}
          <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
            {currentProduct.discountedPrice ? (
              <>
                <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                  {formatMoney(currentProduct.price)}
                </Typography>
                <Typography variant="h4" color="error" sx={{ fontWeight: 'bold' }}>
                  {formatMoney(currentProduct.discountedPrice)}
                </Typography>
                <Box
                  sx={{
                    backgroundColor: '#ff5252',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  Save {discountPercentage}%
                </Box>
              </>
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatMoney(currentProduct.price)}
              </Typography>
            )}
          </Stack>

          {/* Quantity and Add to Cart */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              type="number"
              label={t('product.quantity')}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              inputProps={{ min: 1 }}
              sx={{ width: 120 }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{ flexGrow: 1 }}
            >
              {t('products.addToCart')}
            </Button>
          </Stack>

          {addedToCart && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('product.added')}
            </Alert>
          )}
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          {t('product.reviews')}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setReviewDialog(true)}
          sx={{ mb: 3 }}
        >
          {t('product.writeReview')}
        </Button>

        <Stack spacing={2}>
          {reviews.length === 0 ? (
            <Typography color="text.secondary">No reviews yet</Typography>
          ) : (
            reviews.map((review: any) => (
              <Paper key={review.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{review.title}</Typography>
                  <Rating value={review.rating} readOnly size="small" />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  by {review.author} • {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">{review.comment}</Typography>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('product.writeReview')}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ mb: 1 }}>Rating</Typography>
              <Rating
                value={reviewForm.rating}
                onChange={(_, value) => setReviewForm({ ...reviewForm, rating: value || 5 })}
                size="large"
              />
            </Box>
            <TextField
              label="Title"
              fullWidth
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
            />
            <TextField
              label="Comment"
              fullWidth
              multiline
              rows={4}
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleAddReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
