import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { TablePagination } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UserEditDialog from './UserEditDialog';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    // const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    // const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [filters, setFilters] = useState({
        role: '',
        department: ''
    });

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        // fetchDepartments();
        fetchRoles();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [filters, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/users');

            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Error fetching users');
            setSnackbar({
                open: true,
                message: 'Error fetching users',
                severity: 'error'
            });
        }
    };

    // const fetchDepartments = async () => {
    //     try {
    //         const response = await axios.get('http://174.129.138.174:8080/api/departments');
    //         setDepartments(response.data);
    //     } catch (err) {
    //         console.error('Error fetching departments:', err);
    //         setSnackbar({
    //             open: true,
    //             message: 'Error fetching departments',
    //             severity: 'error'
    //         });
    //     }
    // };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/roles');
            setRoles(response.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setSnackbar({
                open: true,
                message: 'Error fetching roles',
                severity: 'error'
            });
        }
    };

    const filterUsers = () => {
        let filtered = [...users];
        if (filters.role) {
            filtered = filtered.filter(user => user.roleName === filters.role);
        }
        // if (filters.department) {
        //     filtered = filtered.filter(user => user.departmentName === filters.department);
        // }
        setFilteredUsers(filtered);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0); // Reset to first page when filter changes
    };

    const handleEditUser = async (user) => {
        try {
            const response = await axios.get(`http://174.129.138.174:8080/api/users/${user.userId}`);
            console.log('User response data:', response.data); // Debug log
            setSelectedUser({
                ...response.data,
                roles: {
                    roleId: response.data.roles?.roleId || response.data.roleId,
                    roleName: response.data.roles?.roleName || response.data.roleName
                }
            });
            setEditDialogOpen(true);
        } catch (err) {
            console.error('Error fetching user details:', err);
            setSnackbar({
                open: true,
                message: 'Failed to fetch user details',
                severity: 'error'
            });
        }
    };

    // Add handleEditDialogClose:
    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    // Add handleUpdateSuccess:
    const handleUpdateSuccess = () => {
        setSnackbar({
            open: true,
            message: 'User updated successfully',
            severity: 'success'
        });
        fetchUsers();
    };

    const handleCloseDialog = () => {
        // setOpenDialog(false);
        setEditingUser(null);
        fetchUsers();
    };

    const handleDelete = (userId) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://174.129.138.174:8080/api/users/${userToDelete}`);
            setSnackbar({
                open: true,
                message: 'User deleted successfully',
                severity: 'success'
            });
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            setSnackbar({
                open: true,
                message: 'Error deleting user',
                severity: 'error'
            });
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                        User Management Dashboard
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/signup')}
                        sx={{
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d1b5e',
                            }
                        }}
                    >
                        Create New User
                    </Button>
                </Box>

                {/* Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Role</InputLabel>
                        <Select
                            value={filters.role}
                            label="Filter by Role"
                            name="role"
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {roles.map(role => (
                                <MenuItem key={role.roleId} value={role.roleName}>
                                    {role.roleName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Department</InputLabel>
                        <Select
                            value={filters.department}
                            label="Filter by Department"
                            name="department"
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map(dept => (
                                <MenuItem key={dept.deptId} value={dept.deptName}>
                                    {dept.deptName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl> */}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Users Table */}
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell sx={{ color: 'white' }}>User ID</TableCell>
                                <TableCell sx={{ color: 'white' }}>First Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Last Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                                <TableCell sx={{ color: 'white' }}>Email</TableCell>
                                <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
                                <TableCell sx={{ color: 'white' }}>Role</TableCell>
                                {/* <TableCell sx={{ color: 'white' }}>Department</TableCell> */}
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((user) => (
                                    <TableRow key={user.userId} sx={{ backgroundColor: '#F7F6FE' }}>
                                        <TableCell>{user.userId}</TableCell>
                                        <TableCell>{user.firstName}</TableCell>
                                        <TableCell>{user.lastName}</TableCell>
                                        <TableCell>{user.gender}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    backgroundColor: user.roleName === 'Admin' ? '#e8f5e9' : '#fff3e0',
                                                    color: user.roleName === 'Admin' ? '#2e7d32' : '#e65100',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {user.roleName}
                                            </Box>
                                        </TableCell>
                                        {/* <TableCell>{user.departmentName}</TableCell> */}
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(user.userId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>

                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredUsers.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this user?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
            <UserEditDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                user={selectedUser}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </Box>

    );
};

export default AdminDashboard;