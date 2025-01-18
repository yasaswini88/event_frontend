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
  Typography,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

/**
 * UserEditDialog
 *
 * @param {boolean} open - Whether the dialog is open.
 * @param {function} onClose - Called when dialog closes.
 * @param {object} user - The user object to edit. Contains userId, roles[], etc.
 * @param {function} onUpdateSuccess - Callback function to refresh user list in the parent.
 * @param {Array} roles - The array of all possible roles from your backend.
 */
const UserEditDialog = ({
  open,
  onClose,
  user,
  onUpdateSuccess,
  roles = []
}) => {
  // Local state for basic user info (excluding roles).
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: ''
  });

  // We'll keep the user's roles in a separate state array so we can add/remove easily.
  const [userRoles, setUserRoles] = useState([]);

  // This is the role we want to add (by roleId) from the dropdown
  const [roleToAdd, setRoleToAdd] = useState('');

  const [loading, setLoading] = useState(false);

  const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  // -------------------------------
  // Populate form data on open
  // -------------------------------
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender?.toLowerCase() || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || ''
      });

      // user.roles should be an array. We'll store it in userRoles state:
      setUserRoles(Array.isArray(user.roles) ? user.roles : []);
    }
  }, [user]);

  // -------------------------------
  // Handle field changes
  // -------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // -------------------------------
  // Save (PUT) the user's info
  // -------------------------------
  const handleSaveUserInfo = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Make a copy of current formData so we can PUT it
      // But do NOT include roles here, because we're using separate add/remove calls
      const payload = { ...formData };

      // PUT /api/users/{userId} with the basic user info
      const response = await axios.put(`/api/users/${user.userId}`, payload);

      if (response.data) {
        onUpdateSuccess(); // e.g. refresh user list, show success msg
        onClose();         // close dialog
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      // You could show a snackbar or alert
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Remove a role from the user
  // -------------------------------
  const handleRemoveRole = async (roleId) => {
    if (!user) return;
    try {
      await axios.delete(`/api/users/${user.userId}/roles/${roleId}`);
      // Locally remove the role from userRoles
      setUserRoles(prev => prev.filter(r => r.roleId !== roleId));
      onUpdateSuccess(); // optional: to refresh entire user list
    } catch (error) {
      console.error('Error removing role:', error);
    }
  };

  // -------------------------------
  // Add a new role to the user
  // -------------------------------
  const handleAddRole = async () => {
    if (!roleToAdd || !user) return;
    try {
      // PUT /api/users/{userId}/roles/{roleId}
      await axios.put(`/api/users/${user.userId}/roles/${roleToAdd}`, {});

      // Find the role object for roleToAdd from the roles array
      const addedRoleObj = roles.find(r => r.roleId === parseInt(roleToAdd, 10));
      if (addedRoleObj) {
        // Add it to local userRoles state
        setUserRoles(prev => [...prev, addedRoleObj]);
      }

      // Clear the dropdown
      setRoleToAdd('');

      // If you want to refresh the main user list:
      onUpdateSuccess();
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  if (!user) {
    return null; // If no user is selected, don't render
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
      {/* Dialog Title */}
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit User</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Form for Basic User Info */}
      <form onSubmit={handleSaveUserInfo}>
        <DialogContent sx={{ pt: 2, pb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: 'repeat(2, 1fr)'
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
          </Box>

          {/* Roles Management Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Current Roles
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userRoles && userRoles.length > 0 ? (
                userRoles.map(role => (
                  <Box
                    key={role.roleId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 2,
                      px: 1,
                      py: 0.5
                    }}
                  >
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {role.roleName}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveRole(role.roleId)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No roles assigned.</Typography>
              )}
            </Box>

            {/* Add a Role */}
            <Box sx={{ mt: 3 }}>
              <FormControl sx={{ minWidth: 200, mr: 2 }}>
                <InputLabel>Add Role</InputLabel>
                <Select
                  label="Add Role"
                  value={roleToAdd}
                  onChange={(e) => setRoleToAdd(e.target.value)}
                >
                  <MenuItem value="">Select a Role</MenuItem>
                  {/* Filter out roles the user already has, so we don't add duplicates */}
                  {roles
                    .filter(r => !userRoles.some(ur => ur.roleId === r.roleId))
                    .map(r => (
                      <MenuItem key={r.roleId} value={r.roleId}>
                        {r.roleName}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleAddRole}
                disabled={!roleToAdd}
              >
                Add
              </Button>
            </Box>
          </Box>
        </DialogContent>

        {/* Actions */}
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
