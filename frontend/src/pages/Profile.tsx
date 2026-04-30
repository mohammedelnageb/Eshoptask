import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Container,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { RootState, AppDispatch } from '../store'
import { updateUser } from '../store/slices/authSlice'
import { authAPI, userAPI } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile() {
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [addresses, setAddresses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false)
  const [openAddressDialog, setOpenAddressDialog] = useState(false)
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      })
    }
    loadAddresses()
  }, [user])

  const loadAddresses = async () => {
    try {
      const response = await userAPI.getAddresses()
      setAddresses(response.data || [])
    } catch (err) {
      console.error('Failed to load addresses', err)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      await authAPI.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      })
      dispatch(
        updateUser({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        })
      )
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await authAPI.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setSuccess('Password changed successfully!')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setOpenPasswordDialog(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async () => {
    setLoading(true)
    setError(null)
    try {
      await userAPI.addAddress(newAddress)
      setSuccess('Address added successfully!')
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '' })
      setOpenAddressDialog(false)
      loadAddresses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add address')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await userAPI.deleteAddress(addressId)
      setSuccess('Address deleted successfully!')
      loadAddresses()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete address')
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        My Profile
      </Typography>

      {error && <ErrorMessage message={error} sx={{ mb: 2 }} />}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Profile Section */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Personal Information
        </Typography>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First Name"
              fullWidth
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
            />
            <TextField
              label="Last Name"
              fullWidth
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
            />
          </Stack>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={profileData.email}
            disabled
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleUpdateProfile} disabled={loading}>
            Update Profile
          </Button>
          <Button
            variant="outlined"
            onClick={() => setOpenPasswordDialog(true)}
          >
            Change Password
          </Button>
        </Stack>
      </Card>

      {/* Addresses Section */}
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Saved Addresses
          </Typography>
          <Button variant="outlined" onClick={() => setOpenAddressDialog(true)}>
            Add Address
          </Button>
        </Box>

        {addresses.length === 0 ? (
          <Typography color="text.secondary">No saved addresses</Typography>
        ) : (
          <Stack spacing={2}>
            {addresses.map((address) => (
              <Card key={address.id} sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="body2">
                  {address.street}, {address.city}, {address.state} {address.zipCode},{' '}
                  {address.country}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteAddress(address.id)}
                  sx={{ mt: 1 }}
                >
                  Delete
                </Button>
              </Card>
            ))}
          </Stack>
        )}
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
              }
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={loading}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Address Dialog */}
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Street Address"
              fullWidth
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="City"
                fullWidth
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <TextField
                label="State"
                fullWidth
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="ZIP Code"
                fullWidth
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
              />
              <TextField
                label="Country"
                fullWidth
                value={newAddress.country}
                onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAddress} variant="contained" disabled={loading}>
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
