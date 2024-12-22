import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

/**
 * UserEditDialog
 *
 * @param {boolean} open - Whether the dialog is open.
 * @param {function} onClose - Called when dialog closes.
 * @param {object} user - The user object to edit.
 * @param {function} onUpdateSuccess - Callback function to indicate a successful update in the parent.
 * @param {Array} roles - The array of roles fetched in the parent.
 */
const UserEditDialog = ({ open, onClose, user, onUpdateSuccess, roles = [] }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    roles: {
      roleId: '',
      roleName: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  /**
   * Populate form data when the `user` prop changes
   */
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender?.toLowerCase() || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        roles: {
          roleId: user.roles?.roleId || '',
          roleName: user.roles?.roleName || ''
        }
      });
    }
  }, [user]);

  /**
   * Handle all normal text field changes (firstName, email, etc.)
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Handle the role dropdown specially
    if (name === 'roles') {
      const roleId = parseInt(value, 10);
      const selectedRole = roles.find(role => role.roleId === roleId);

      setFormData(prev => ({
        ...prev,
        roles: {
          roleId: selectedRole?.roleId || '',
          roleName: selectedRole?.roleName || ''
        }
      }));
    } else {
      // For gender, email, phoneNumber, etc.
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  /**
   * Handle form submission (PUT request to backend)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Send a PUT request to update user
      const response = await axios.put(`/api/users/${user.userId}`, formData);
      console.log('User update response:', response.data);

      if (response.data) {
        onUpdateSuccess(); // Refresh user list, show success snackbar, etc.
        onClose();         // Close the dialog
      }
    } catch (error) {
      console.error('Error updating user:', error);
      // Optionally show an error message/snackbar
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // If no user is selected, don't render anything
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: 'white',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
      BackdropProps={{
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit User</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2, pb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(2, 1fr)',
              '& .MuiFormControl-root': {
                minWidth: '100%'
              }
            }}
          >
            {/* First Name */}
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Last Name */}
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Gender */}
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                label="Gender"
                required
              >
                {genders.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Email */}
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              type="email"
            />

            {/* Phone Number */}
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Role Dropdown */}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="roles"
                value={formData.roles.roleId || ''}
                onChange={handleChange}
                label="Role"
                required
              >
                <MenuItem value="">--Select Role--</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', padding: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d1b5e',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserEditDialog;
