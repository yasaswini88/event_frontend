import React, { useState, useEffect } from 'react';
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
    TextField,
    MenuItem,
    Autocomplete,
    TablePagination


} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const PurchaserDashboard = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [newDeliveryStatus, setNewDeliveryStatus] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const deliveryStatusOptions = ['Processing', 'Shipped', 'Delivered'];
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);


    

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    // const fetchPurchaseOrders = async () => {
    //     try {
    //         const response = await axios.get('/api/purchase-orders');
    //         setPurchaseOrders(response.data);
    //     } catch (err) {
    //         console.error('Error fetching purchase orders:', err);
    //         setError('Error fetching purchase orders');
    //         setSnackbar({
    //             open: true,
    //             message: 'Error fetching purchase orders',
    //             severity: 'error'
    //         });
    //     }
    // };
    const fetchPurchaseOrders = async () => {
        try {
            // Get all approved proposals
            const proposalsResponse = await axios.get('/api/proposals/status/APPROVED');
            const approvedProposals = proposalsResponse.data;

            // Get existing purchase orders
            const ordersResponse = await axios.get('/api/purchase-orders');
            const existingOrders = ordersResponse.data;

            // Get departments
            const departmentsResponse = await axios.get('/api/departments');
            const departments = departmentsResponse.data;
            setDepartments(departments);

            // Combine the data - create a merged view of proposals and their purchase orders
            const combinedData = approvedProposals.map(proposal => {
                const matchingOrder = existingOrders.find(
                    order => order.proposalId === proposal.proposalId
                );

                // Find the department name
                const department = departments.find(dept => dept.deptId === proposal.departmentId);

                return {
                    proposalId: proposal.proposalId,
                    orderId: matchingOrder?.orderId,
                    itemName: proposal.itemName,
                    department: department?.deptName || 'Unknown Department',
                    quantity: proposal.quantity,
                    finalCost: proposal.estimatedCost,
                    orderStatus: matchingOrder ? 'ORDERED' : 'PENDING',
                    deliveryStatus: matchingOrder?.deliveryStatus || 'Not Started',
                    expectedDeliveryDate: matchingOrder?.expectedDeliveryDate,
                    purchaseOrderNumber: matchingOrder?.purchaseOrderNumber || 'Not Generated',
                    // Add any other fields you need
                };
            });

            setPurchaseOrders(combinedData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error fetching procurement data');
            setSnackbar({
                open: true,
                message: 'Error fetching procurement data',
                severity: 'error'
            });
        }
    };

    // Move this function outside fetchPurchaseOrders
    const getFilteredPurchaseOrders = () => {
        if (selectedDepartment === 'all' || selectedDepartment === 'All Departments') {
            return purchaseOrders;
        }
        return purchaseOrders.filter(order => order.department === selectedDepartment);
    };

    const paginatedPurchaseOrders = getFilteredPurchaseOrders().slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleCreatePurchaseOrder = async (proposalId) => {
        try {
            const response = await axios.post(`/api/purchase-orders/create/${proposalId}`);

            // Update the local state immediately
            setPurchaseOrders(prevOrders =>
                prevOrders.map(order => {
                    if (order.proposalId === proposalId) {
                        return {
                            ...order,
                            purchaseOrderNumber: response.data.purchaseOrderNumber,
                            orderId: response.data.orderId, // Make sure to update orderId if needed
                            orderStatus: 'ORDERED', // Update order status
                            deliveryStatus: 'Not Started'
                        };
                    }
                    return order;
                })
            );

            setSnackbar({
                open: true,
                message: 'Purchase order created successfully',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error creating purchase order:', err);
            setSnackbar({
                open: true,
                message: 'Error creating purchase order',
                severity: 'error'
            });
        }
    };
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/api/purchase-orders/${orderId}/order-status`, null, {
                params: { newOrderStatus: newStatus }
            });
            setSnackbar({
                open: true,
                message: 'Order status updated successfully',
                severity: 'success'
            });
            fetchPurchaseOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            setSnackbar({
                open: true,
                message: 'Error updating order status',
                severity: 'error'
            });
        }
    };

    const handleUpdateDeliveryStatus = async () => {
        try {
            if (!newDeliveryStatus || !expectedDeliveryDate) {
                setSnackbar({
                    open: true,
                    message: 'Please fill in all fields',
                    severity: 'error'
                });
                return;
            }

            await axios.put(`/api/purchase-orders/${selectedOrder.orderId}/delivery-status`, null, {
                params: {
                    newStatus: newDeliveryStatus,
                    expectedDeliveryDate: expectedDeliveryDate
                }
            });
            setSnackbar({
                open: true,
                message: 'Delivery status updated successfully',
                severity: 'success'
            });
            setOpenDialog(false);
            fetchPurchaseOrders();
        } catch (err) {
            console.error('Error updating delivery status:', err);
            setSnackbar({
                open: true,
                message: 'Error updating delivery status',
                severity: 'error'
            });
        }
    };

    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setExpectedDeliveryDate('');
        setNewDeliveryStatus('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedOrder(null);
        setExpectedDeliveryDate('');
        setNewDeliveryStatus('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
                    Purchase Order Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <Autocomplete
                        id="department-filter"
                        options={[{ deptId: 'all', deptName: 'All Departments' }, ...departments]}
                        getOptionLabel={(option) => option.deptName || ''}
                        value={departments.find(d => d.deptName === selectedDepartment) ||
                            { deptId: 'all', deptName: 'All Departments' }}
                        onChange={(event, newValue) => {
                            setSelectedDepartment(newValue ? newValue.deptName : 'all');
                        }}
                        sx={{
                            minWidth: 300,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#1a237e',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#1a237e',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#1a237e',
                                },
                            },
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Filter by Department"
                                variant="outlined"
                            />
                        )}
                    />
                </Box>
                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
                                <TableCell sx={{ color: 'white' }}>Item</TableCell>
                                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                                <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                                <TableCell sx={{ color: 'white' }}>Cost</TableCell>
                                <TableCell sx={{ color: 'white' }}>Order Status</TableCell>
                                <TableCell sx={{ color: 'white' }}>Delivery Status</TableCell>
                                <TableCell sx={{ color: 'white' }}>Tracking Number</TableCell>
                                <TableCell sx={{ color: 'white' }}>Expected Delivery</TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedPurchaseOrders.map((item) => (
                                <TableRow key={item.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                                    {/* Changed order to match header */}
                                    <TableCell>{item.orderId || item.proposalId}</TableCell>
                                    <TableCell>{item.itemName}</TableCell>
                                    <TableCell>{item.department}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${item.finalCost.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            backgroundColor: item.orderStatus === 'ORDERED' ? '#e8f5e9' : '#fff3e0',
                                            color: item.orderStatus === 'ORDERED' ? '#2e7d32' : '#e65100',
                                            p: 1,
                                            borderRadius: 1,
                                            textAlign: 'center'
                                        }}>
                                            {item.orderStatus}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            backgroundColor:
                                                item.deliveryStatus === 'Delivered' ? '#e8f5e9' :
                                                    item.deliveryStatus === 'Shipped' ? '#e3f2fd' :
                                                        '#fff3e0',
                                            color:
                                                item.deliveryStatus === 'Delivered' ? '#2e7d32' :
                                                    item.deliveryStatus === 'Shipped' ? '#1565c0' :
                                                        '#e65100',
                                            p: 1,
                                            borderRadius: 1,
                                            textAlign: 'center'
                                        }}>
                                            {item.deliveryStatus || 'Not Started'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.purchaseOrderNumber || 'Not Generated'}</TableCell>
                                    <TableCell>{item.expectedDeliveryDate ? formatDate(item.expectedDeliveryDate) : '-'}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {item.orderStatus === 'PENDING' && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleCreatePurchaseOrder(item.proposalId)}
                                                    sx={{ backgroundColor: '#1a237e' }}
                                                >
                                                    Place Order
                                                </Button>
                                            )}
                                            {item.orderStatus === 'ORDERED' && (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(item)}
                                                    sx={{ backgroundColor: '#1565c0' }}
                                                >
                                                    Update Delivery
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={getFilteredPurchaseOrders().length}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0); // Reset to first page
                    }}
                    rowsPerPageOptions={[5, 10, 15]}
                />


                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Update Delivery Status</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px', mt: 2 }}>
                            {/* Delivery Status Dropdown */}
                            <TextField
                                select
                                label="Delivery Status"
                                value={newDeliveryStatus}
                                onChange={(e) => setNewDeliveryStatus(e.target.value)}
                                fullWidth
                            >
                                {deliveryStatusOptions.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Expected Delivery Date Input */}
                            <TextField
                                label="Expected Delivery Date"
                                type="datetime-local"
                                value={expectedDeliveryDate}
                                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            onClick={handleUpdateDeliveryStatus}
                            variant="contained"
                            disabled={!newDeliveryStatus || !expectedDeliveryDate}
                        >
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>


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
        </Box>
    );
};

export default PurchaserDashboard;