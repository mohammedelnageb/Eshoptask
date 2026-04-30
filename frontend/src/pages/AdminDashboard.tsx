import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  Container,
  Box,
  Grid,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { RootState } from '../store'
import { adminAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6B6B']

export default function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [productPerformance, setProductPerformance] = useState<any[]>([])
  const [orderStats, setOrderStats] = useState<any>(null)

  useEffect(() => {
    if (user?.roles?.includes('ADMIN')) {
      loadDashboardData()
    }
  }, [user, period])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [dashStats, revenue, performance, orders] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRevenueStats(period),
        adminAPI.getProductPerformance(),
        adminAPI.getOrderStats(),
      ])

      setStats(dashStats.data)
      setRevenueData(revenue.data || [])
      setProductPerformance(performance.data || [])
      setOrderStats(orders.data)
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user?.roles?.includes('ADMIN')) {
    return <Navigate to="/" />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Total Orders
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {stats?.totalOrders || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              ${stats?.totalRevenue?.toFixed(2) || '0.00'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Total Users
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {stats?.totalUsers || 0}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              Total Products
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {stats?.totalProducts || 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Revenue Trend
              </Typography>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select
                  value={period}
                  label="Period"
                  onChange={(e) => setPeriod(e.target.value as any)}
                  size="small"
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="year">Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {revenueData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        {/* Order Status Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Status Distribution
            </Typography>
            {orderStats && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: orderStats.pending },
                      { name: 'Processing', value: orderStats.processing },
                      { name: 'Shipped', value: orderStats.shipped },
                      { name: 'Delivered', value: orderStats.delivered },
                      { name: 'Cancelled', value: orderStats.cancelled },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Top Products */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Top Performing Products
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Units Sold</TableCell>
                <TableCell align="right">Revenue</TableCell>
                <TableCell align="right">Avg Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productPerformance.slice(0, 10).map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">{product.unitsSold}</TableCell>
                  <TableCell align="right">${product.revenue?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell align="right">{product.avgRating?.toFixed(2) || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  )
}
