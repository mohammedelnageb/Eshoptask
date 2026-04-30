import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  productId: number
  productName: string
  productImageUrl?: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  totalAmount: number
  itemCount: number
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice
      } else {
        state.items.push(action.payload)
      }
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.productId !== action.payload)
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    updateQuantity: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const item = state.items.find(item => item.productId === action.payload.productId)
      if (item) {
        item.quantity = action.payload.quantity
        item.totalPrice = item.quantity * item.unitPrice
      }
      state.totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    clearCart: (state) => {
      state.items = []
      state.totalAmount = 0
      state.itemCount = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer