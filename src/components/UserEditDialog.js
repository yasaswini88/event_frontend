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

const UserEditDialog = ({ open, onClose, user, onUpdateSuccess }) => {
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
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false); // Properly define loading state

    const genders = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ];

    useEffect(() => {
        fetchRoles();
        if (user) {
            console.log('Setting user data:', user); // Debug log
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                gender: user.gender?.toLowerCase() || '',  
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                roles: {
                    roleId: user.roles?.roleId || user.roleId || '', // Try both paths
                    roleName: user.roles?.roleName || user.roleName || '' // Try both paths
                }
            });
        }
    }, [user]);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        
        if (name === "roles") {
            const roleId = parseInt(value);
            const selectedRole = roles.find(role => role.roleId === roleId);
            if (selectedRole) {
                setFormData(prev => ({
                    ...prev,
                    roles: {
                        roleId: selectedRole.roleId,
                        roleName: selectedRole.roleName
                    }
                }));
            }
            console.log('Selected role:', selectedRole); // Debug log
        } else {
            setFormData(prev => ({
                    ...prev,
                    [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`http://174.129.138.174:8080/api/users/${user.userId}`, formData);
            console.log('User update response:', response.data);
            if (response.data) {
                onUpdateSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error updating user:', error);
        } finally {
            setLoading(false);
        }
    };

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
                style: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: '1px solid #e0e0e0',
                backgroundColor: '#f5f5f5' 
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <Typography variant="h6">Edit User</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 2, pb: 3 }}>
                    <Box sx={{ 
                        display: 'grid', 
                        gap: 2, 
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        '& .MuiFormControl-root': {
                            minWidth: '100%'
                        }
                    }}>
                        <TextField
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
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
                        <TextField
                            label="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            type="email"
                        />
                        <TextField
                            label="Phone Number"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                       <FormControl fullWidth>
    <InputLabel>Role</InputLabel>
    <Select
        name="roles"
        value={formData.roles.roleId || ''} // Add fallback empty string
        onChange={handleChange}
        label="Role"
        required
    >
        {roles.map((role) => (
            <MenuItem key={role.roleId} value={role.roleId}>
                {role.roleName}
            </MenuItem>
        ))}
    </Select>
</FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    borderTop: '1px solid #e0e0e0',
                    padding: 2
                }}>
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