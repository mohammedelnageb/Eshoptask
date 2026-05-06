import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Rating,
  Chip,
  Stack,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'
import { AppDispatch } from '../store'
import { Product } from '../store/slices/productSlice'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import { useIntlSettings } from '../i18n/IntlContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { formatMoney, t } = useIntlSettings()

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        productName: product.name,
        productImageUrl: product.thumbnailUrl,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.discountedPrice || product.price,
        totalPrice: product.discountedPrice || product.price,
      })
    )
  }

  const discountPercentage = product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {discountPercentage > 0 && (
        <Chip
          label={`-${discountPercentage}%`}
          color="error"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
          }}
        />
      )}

      <CardMedia
        component={RouterLink}
        to={`/products/${product.id}`}
        sx={{
          height: 200,
          backgroundImage: `url(${product.thumbnailUrl || product.imageUrl})`,
          backgroundSize: 'cover',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      />

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to={`/products/${product.id}`}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            '&:hover': { color: 'primary.main' },
          }}
        >
          {product.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Rating value={product.averageRating} readOnly size="small" />
          <Typography variant="caption" color="text.secondary">
            ({product.reviewCount})
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" noWrap>
          {product.brand}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
          {product.discountedPrice ? (
            <>
              <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                {formatMoney(product.price)}
              </Typography>
              <Typography variant="h6" color="error">
                {formatMoney(product.discountedPrice)}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">{formatMoney(product.price)}</Typography>
          )}
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddShoppingCartIcon />}
          onClick={handleAddToCart}
          fullWidth
          sx={{ mt: 1 }}
        >
          {t('products.addToCart')}
        </Button>
      </CardContent>
    </Card>
  )
}
