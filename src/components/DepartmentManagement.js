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
    Alert,
    Fab
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Add as AddIcon 
} from '@mui/icons-material';
import axios from 'axios';

const DepartmentManagement = () => {
    const [departments, setDepartments] = useState([]);
    const [editDepartment, setEditDepartment] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newDepartment, setNewDepartment] = useState({ deptName: '' });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/departments');
            setDepartments(response.data);
        } catch (error) {
            showSnackbar('Error fetching departments', 'error');
        }
    };

    const handleEditClick = (department) => {
        setEditDepartment({ ...department });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDepartment(null);
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        try {
            await axios.put(
                `/api/departments/${editDepartment.deptId}`, 
                editDepartment
            );
            showSnackbar('Department updated successfully', 'success');
            fetchDepartments();
            handleEditClose();
        } catch (error) {
            showSnackbar('Error updating department', 'error');
        }
    };

    const handleDeleteClick = (department) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/departments/${departmentToDelete.deptId}`);
            showSnackbar('Department deleted successfully', 'success');
            fetchDepartments();
        } catch (error) {
            showSnackbar('Error deleting department', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setDepartmentToDelete(null);
        }
    };

    const handleAddClick = () => {
        setAddDialogOpen(true);
    };

    const handleAddSave = async () => {
        try {
            await axios.post('/api/departments', newDepartment);
            showSnackbar('Department added successfully', 'success');
            fetchDepartments();
            setAddDialogOpen(false);
            setNewDepartment({ deptName: '' });
        } catch (error) {
            showSnackbar('Error adding department', 'error');
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                    sx={{
                        backgroundColor: '#1a237e',
                        '&:hover': {
                            backgroundColor: '#0d1b5e',
                        }
                    }}
                >
                    Add Department
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1a237e' }}>
                            <TableCell sx={{ color: 'white' }}>Department ID</TableCell>
                            <TableCell sx={{ color: 'white' }}>Department Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {departments.map((department) => (
                            <TableRow key={department.deptId}>
                                <TableCell>{department.deptId}</TableCell>
                                <TableCell>{department.deptName}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(department)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    {/* <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteClick(department)}
                                    >
                                        <DeleteIcon />
                                    </IconButton> */}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Department Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditClose}>
                <DialogTitle>Edit Department</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Department Name"
                        fullWidth
                        value={editDepartment?.deptName || ''}
                        onChange={(e) => setEditDepartment({ 
                            ...editDepartment, 
                            deptName: e.target.value 
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

            {/* Add Department Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Department Name"
                        fullWidth
                        value={newDepartment.deptName}
                        onChange={(e) => setNewDepartment({ 
                            ...newDepartment, 
                            deptName: e.target.value 
                        })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAddSave} 
                        color="primary"
                        variant="contained"
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the department "{departmentToDelete?.deptName}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                    >
                        Delete
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

export default DepartmentManagement;