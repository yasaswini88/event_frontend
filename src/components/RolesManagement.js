import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

const RolesManagement = () => {
    const [roles, setRoles] = useState([]);
    const [editRole, setEditRole] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/roles');
            setRoles(response.data);
        } catch (error) {
            showSnackbar('Error fetching roles', 'error');
        }
    };

    const handleEditClick = (role) => {
        setEditRole({ ...role });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditRole(null);
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        try {
            await axios.put(
                `/api/roles/${editRole.roleId}`,
                editRole
            );
            showSnackbar('Role updated successfully', 'success');
            fetchRoles();
            handleEditClose();
        } catch (error) {
            showSnackbar('Error updating role', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    return (
        <Box>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1a237e' }}>
                            <TableCell sx={{ color: 'white' }}>Role ID</TableCell>
                            <TableCell sx={{ color: 'white' }}>Role Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.roleId}>
                                <TableCell>{role.roleId}</TableCell>
                                <TableCell>{role.roleName}</TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEditClick(role)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Role Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditClose}>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Role Name"
                        fullWidth
                        value={editRole?.roleName || ''}
                        onChange={(e) => setEditRole({
                            ...editRole,
                            roleName: e.target.value
                        })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button
                        onClick={handleEditSave}
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RolesManagement;