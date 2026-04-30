import { useEffect } from 'react'
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
  Chip,
  Button,
  Pagination,
} from '@mui/material'
import { useState } from 'react'
import { RootState, AppDispatch } from '../store'
import { setLoading, setError, setOrders, setCurrentPage } from '../store/slices/orderSlice'
import { orderAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const statusColors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info' } = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'error',
  FAILED: 'error',
}

export default function Orders() {
  const dispatch = useDispatch<AppDispatch>()
  const { orders, isLoading, error, totalOrders, currentPage, pageSize } = useSelector(
    (state: RootState) => state.orders
  )

  useEffect(() => {
    loadOrders()
  }, [currentPage])

  const loadOrders = async () => {
    dispatch(setLoading(true))
    try {
      const response = await orderAPI.getOrders(currentPage, pageSize)
      dispatch(setOrders({ orders: response.data.orders, total: response.data.total }))
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || 'Failed to load orders'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setCurrentPage(value - 1))
  }

  if (isLoading && orders.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        My Orders
      </Typography>

      <ErrorMessage message={error} sx={{ mb: 2 }} />

      {orders.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No orders found</Typography>
        </Card>
      ) : (
        <>
          <TableContainer component={Card}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{order.id}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 'bold' }}>
                        ${order.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={statusColors[order.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // TODO: Navigate to order detail
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {totalOrders > pageSize && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(totalOrders / pageSize)}
                page={currentPage + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}
