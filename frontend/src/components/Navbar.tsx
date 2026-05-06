import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  FormControl,
  Select,
  Tooltip,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { RootState, AppDispatch } from '../store'
import { logout } from '../store/slices/authSlice'
import { useIntlSettings } from '../i18n/IntlContext'

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { itemCount } = useSelector((state: RootState) => state.cart)
  const { language, currency, setLanguage, setCurrency, t } = useIntlSettings()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    handleMenuClose()
  }

  return (
    <AppBar position="sticky" sx={{ boxShadow: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          TechShop
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button color="inherit" component={RouterLink} to="/">
            {t('nav.home')}
          </Button>
          <Button color="inherit" component={RouterLink} to="/products">
            {t('nav.products')}
          </Button>

          {user?.roles?.includes('ADMIN') && (
            <Button color="inherit" component={RouterLink} to="/admin">
              {t('nav.admin')}
            </Button>
          )}

          <Tooltip title={t('settings.language')}>
            <FormControl size="small" sx={{ minWidth: 76 }}>
              <Select
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'en' | 'ar')}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="en">EN</MenuItem>
                <MenuItem value="ar">AR</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>

          <Tooltip title={t('settings.currency')}>
            <FormControl size="small" sx={{ minWidth: 88 }}>
              <Select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as 'USD' | 'EUR' | 'EGP')}
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.6)' },
                  '.MuiSvgIcon-root': { color: 'white' },
                }}
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="EGP">EGP</MenuItem>
              </Select>
            </FormControl>
          </Tooltip>

          <Button
            color="inherit"
            component={RouterLink}
            to="/cart"
            sx={{ position: 'relative' }}
          >
            <Badge badgeContent={itemCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </Button>

          {user ? (
            <>
              <Button
                onClick={handleMenuOpen}
                color="inherit"
                startIcon={<Avatar sx={{ width: 32, height: 32 }} />}
              >
                {user.firstName}
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                  {t('nav.profile')}
                </MenuItem>
                <MenuItem component={RouterLink} to="/orders" onClick={handleMenuClose}>
                  {t('nav.orders')}
                </MenuItem>
                <MenuItem onClick={handleLogout}>{t('nav.logout')}</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                {t('nav.login')}
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
                component={RouterLink}
                to="/register"
              >
                {t('nav.register')}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
