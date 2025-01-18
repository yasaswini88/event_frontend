/**
 * AdminDashboard component for managing users.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * return <AdminDashboard />
 *
 * @description
 * This component fetches and displays a list of users, allowing for filtering by role,
 * sorting, pagination, and editing user details. It also includes a snackbar for notifications
 * and a dialog for confirming user deletions.
 *
 * @function
 * @name AdminDashboard
 *
 * @property {function} toggleDrawer - Toggles the state of the drawer.
 * @property {function} fetchUsers - Fetches the list of users from the API.
 * @property {function} fetchRoles - Fetches the list of roles from the API.
 * @property {function} filterUsers - Filters the list of users based on selected filters.
 * @property {function} handleChangePage - Handles the change of the current page in pagination.
 * @property {function} handleChangeRowsPerPage - Handles the change of rows per page in pagination.
 * @property {function} handleSort - Handles sorting of the user list based on a key.
 * @property {function} handleFilterChange - Handles the change of filter values.
 * @property {function} handleEditUser - Fetches user details and opens the edit dialog.
 * @property {function} handleEditDialogClose - Closes the edit dialog.
 * @property {function} handleUpdateSuccess - Handles successful user update.
 * @property {function} handleCloseDialog - Closes the delete confirmation dialog.
 * @property {function} handleDelete - Opens the delete confirmation dialog for a user.
 * @property {function} handleConfirmDelete - Confirms and deletes a user.
 * @property {function} handleCloseSnackbar - Closes the snackbar notification.
 *
 * @property {Array} users - The list of users.
 * @property {Array} filteredUsers - The filtered list of users.
 * @property {Array} roles - The list of roles.
 * @property {Object} filters - The current filter values.
 * @property {Object} sortConfig - The current sorting configuration.
 * @property {Object} snackbar - The snackbar notification state.
 * @property {boolean} editDialogOpen - The state of the edit dialog.
 * @property {Object} selectedUser - The currently selected user for editing.
 * @property {boolean} drawerOpen - The state of the drawer.
 * @property {boolean} deleteDialogOpen - The state of the delete confirmation dialog.
 * @property {number} page - The current page in pagination.
 * @property {number} rowsPerPage - The number of rows per page in pagination.
 * @property {string} error - The error message, if any.
 */
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
import { TextField } from '@mui/material';
import { TablePagination } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UserEditDialog from './UserEditDialog';   // Make sure the path is correct
import Layout from './Layout';
import MenuIcon from '@mui/icons-material/Menu';
import { sortData } from '../utils/utilities';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roles, setRoles] = useState([]);
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
    const [filters, setFilters] = useState({ role: '', department: '' ,firstName: ''});
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'userId', order: 'asc' });

    // Toggle the drawer open/close
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    // Load initial data (users + roles)
    useEffect(() => {
        fetchUsers();
        fetchRoles();
        // fetchDepartments(); // if needed
    }, []);

    // Re-filter users whenever filters or the users array changes
    useEffect(() => {
        filterUsers();
    }, [filters, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
            setFilteredUsers(response.data); // initially, no filter is applied
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

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/roles');
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

    // Example: fetchDepartments if needed
    // const fetchDepartments = async () => {
    //   ...
    // };

    // Filter the users array based on selected role (and optionally department)
    const filterUsers = () => {
        let filtered = [...users];

        // if (filters.role) {
        //     filtered = filtered.filter(user => user.roles?.roleName === filters.role);
        // }
        if (filters.role) {
            filtered = filtered.filter(user =>
              Array.isArray(user.roles)
                ? user.roles.some(r => r.roleName === filters.role)
                : user.roles?.roleName === filters.role
            );
          }
          
        // if (filters.department) { ... }
        if (filters.firstName) {
            filtered = filtered.filter(user =>
              user.firstName.toLowerCase().includes(filters.firstName.toLowerCase())
            );
            }

        setFilteredUsers(filtered);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (event) => {
        const { name, value } = event.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0); // Reset to first page when filter changes
    };

    /**
     * Edit user: fetch user details from server, set selectedUser, open the dialog
     */
    const handleEditUser = async (user) => {
        try {
            const response = await axios.get(`/api/users/${user.userId}`);
            console.log('User response data:', response.data);

            // Flatten or adapt the user if needed
            setSelectedUser({
                ...response.data,
                roles: response.data.roles || []
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

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setSelectedUser(null);
    };

    // Called by UserEditDialog on a successful update
    const handleUpdateSuccess = () => {
        setSnackbar({
            open: true,
            message: 'User updated successfully',
            severity: 'success'
        });
        fetchUsers(); // reload user list
    };

    // For the delete confirmation
    const handleDelete = (userId) => {
        setUserToDelete(userId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/users/${userToDelete}`);
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
            {/* Drawer Toggle Button */}
           

            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                {/* Header */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        mt: 8,
                        ml: drawerOpen ? '240px' : 0,
                        transition: theme => theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                        User Management Dashboard
                    </Typography>
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
                     <TextField
    label="Search by First Name"
    variant="outlined"
    name="firstName"
    value={filters.firstName}
    onChange={handleFilterChange}
  />
                </Box>

                {/* Error Alert */}
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
                                <TableCell
                                    onClick={() => handleSort('userId')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    User ID {sortConfig.key === 'userId' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('firstName')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    First Name {sortConfig.key === 'firstName' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Last Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Gender</TableCell>
                                <TableCell sx={{ color: 'white' }}>Email</TableCell>
                                <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
                                <TableCell sx={{ color: 'white' }}>Role</TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortData(filteredUsers, sortConfig.key, sortConfig.order)
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(user => (
                                    <TableRow key={user.userId} sx={{ backgroundColor: '#F7F6FE' }}>
                                        <TableCell>{user.userId}</TableCell>
                                        <TableCell>{user.firstName}</TableCell>
                                        <TableCell>{user.lastName}</TableCell>
                                        <TableCell>{user.gender}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>
  {Array.isArray(user.roles) && user.roles.length > 0 ? (
    user.roles.map((r) => (
      <Box
        key={r.roleId}
        sx={{
          backgroundColor: r.roleName === 'Admin' ? '#e8f5e9' : '#fff3e0',
          color: r.roleName === 'Admin' ? '#2e7d32' : '#e65100',
          p: 1,
          borderRadius: 1,
          textAlign: 'center',
          mb: 0.5, // small spacing if multiple
        }}
      >
        {r.roleName}
      </Box>
    ))
  ) : (
    <Box>No Roles</Box>
  )}
</TableCell>

{/* <TableCell>
  {Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles.map((r) => r.roleName).join(', ')
    : 'No Roles'}
</TableCell> */}


                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton color="primary" onClick={() => handleEditUser(user)}>
                                                    <EditIcon />
                                                </IconButton>
                                                {/* <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(user.userId)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton> */}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    {/* Pagination */}
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
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
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
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>

            {/* The Edit Dialog: pass the roles array */}
            <UserEditDialog
                open={editDialogOpen}
                onClose={handleEditDialogClose}
                user={selectedUser}
                onUpdateSuccess={handleUpdateSuccess}
                roles={roles}
            />
        </Box>
    );
};

export default AdminDashboard;
