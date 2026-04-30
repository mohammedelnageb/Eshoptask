import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { RootState, AppDispatch } from '../store'
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'

export default function Cart() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { items, totalAmount } = useSelector((state: RootState) => state.cart)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)

  const handleRemoveItem = (productId: number) => {
    dispatch(removeFromCart(productId))
  }

  const handleOpenDialog = (item: any) => {
    setSelectedItem(item)
    setQuantity(item.quantity)
    setOpenDialog(true)
  }

  const handleUpdateQuantity = () => {
    if (selectedItem) {
      dispatch(updateQuantity({ productId: selectedItem.productId, quantity }))
      setOpenDialog(false)
    }
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          Shopping Cart
        </Typography>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Your cart is empty
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Shopping Cart
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {item.productImageUrl && (
                      <Box
                        component="img"
                        src={item.productImageUrl}
                        alt={item.productName}
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {item.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {item.sku}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                <TableCell align="center">{item.quantity}</TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 'bold' }}>
                    ${item.totalPrice.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemoveItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Subtotal: <strong>${totalAmount.toFixed(2)}</strong>
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => dispatch(clearCart())}>
              Clear Cart
            </Button>
            <Button variant="contained" onClick={() => navigate('/checkout')} size="large">
              Proceed to Checkout
            </Button>
          </Stack>
        </Box>
      </Stack>

      {/* Edit Quantity Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Quantity</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Product: {selectedItem?.productName}</Typography>
          </Box>
          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1 }}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateQuantity} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

interface TextFieldProps {
  type?: string
  label?: string
  value?: any
  onChange?: (e: any) => void
  inputProps?: any
  fullWidth?: boolean
  sx?: any
}

function TextField({ type, label, value, onChange, inputProps, fullWidth, sx }: TextFieldProps) {
  return (
    <input
      type={type || 'text'}
      placeholder={label}
      value={value}
      onChange={onChange}
      style={{ width: fullWidth ? '100%' : 'auto', ...sx }}
    />
  )
}
