import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Grid,
  Box,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { RootState, AppDispatch } from '../store'
import { fetchProducts, fetchCategories, setPage } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SkeletonLoader from '../components/SkeletonLoader'

export default function ProductList() {
  const dispatch = useDispatch<AppDispatch>()
  const { products, categories, loading, error, page, totalPages } = useSelector(
    (state: RootState) => state.products
  )
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    dispatch(fetchCategories() as any)
  }, [dispatch])

  useEffect(() => {
    dispatch(
      fetchProducts({
        page,
        size: 12,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      }) as any
    )
  }, [dispatch, page, selectedCategory, searchQuery])

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Products
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              dispatch(setPage(0))
              setSearchQuery(e.target.value)
            }}
            sx={{ flex: 1 }}
            size="small"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => {
                dispatch(setPage(0))
                setSelectedCategory(e.target.value)
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <ErrorMessage message={error} sx={{ mb: 2 }} />

      {loading ? (
        <SkeletonLoader count={12} />
      ) : (
        <>
          {products.length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: 'center', py: 4 }}>
              No products found
            </Typography>
          ) : (
            <>
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page + 1}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  )
}
