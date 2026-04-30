import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

export interface Product {
  id: number
  sku: string
  name: string
  description: string
  price: number
  discountedPrice?: number
  brand: string
  category: string
  subCategory?: string
  imageUrl?: string
  thumbnailUrl?: string
  images?: string[]
  featured: boolean
  averageRating: number
  reviewCount: number
}

interface ProductState {
  products: Product[]
  featuredProducts: Product[]
  categories: string[]
  brands: string[]
  currentProduct: Product | null
  loading: boolean
  error: string | null
  page: number
  totalPages: number
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  categories: [],
  brands: [],
  currentProduct: null,
  loading: false,
  error: null,
  page: 0,
  totalPages: 0,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; size?: number; category?: string; search?: string }) => {
    const response = await axios.get('/api/v1/products', { params })
    return response.data
  }
)

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    const response = await axios.get('/api/v1/products/featured')
    return response.data
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number) => {
    const response = await axios.get(`/api/v1/products/${id}`)
    return response.data
  }
)

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const response = await axios.get('/api/v1/products/categories')
    return response.data
  }
)

export const fetchBrandsByCategory = createAsyncThunk(
  'products/fetchBrandsByCategory',
  async (category: string) => {
    const response = await axios.get(`/api/v1/products/categories/${category}/brands`)
    return response.data
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.content
        state.page = action.payload.number
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.content
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProduct = action.payload
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchBrandsByCategory.fulfilled, (state, action) => {
        state.brands = action.payload
      })
  },
})

export const { clearCurrentProduct, setPage } = productSlice.actions
export default productSlice.reducer
