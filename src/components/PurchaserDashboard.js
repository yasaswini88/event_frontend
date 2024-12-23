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
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { sortData } from '../utils/utilities';

const PurchaserDashboard = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [newDeliveryStatus, setNewDeliveryStatus] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sortConfig, setSortConfig] = useState({ key: 'proposalId', order: 'desc' });

    const [selectedOrderStatus, setSelectedOrderStatus] = useState('all');
    const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState('all');

    const orderStatusOptions = ['all', 'PENDING', 'ORDERED'];
    const deliveryStatusOptions = ['all', 'Not Started', 'Processing', 'Shipped', 'Delivered'];




    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
        }));
    };





    const fetchPurchaseOrders = async () => {
        try {
            // Get all approved proposals
            const proposalsResponse = await axios.get('/api/proposals/status/APPROVED');
            console.log("Approved Proposals:", proposalsResponse.data);
            const approvedProposals = proposalsResponse.data;

            // Get existing purchase orders
            const ordersResponse = await axios.get('/api/purchase-orders');
            console.log("Existing Orders:", ordersResponse.data);
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
            console.log("Combined Data:", combinedData);

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

    const getFilteredPurchaseOrders = () => {
        return purchaseOrders.filter(order => {
            const departmentMatch =
                selectedDepartment === 'all' ||
                selectedDepartment === 'All Departments' ||
                order.department === selectedDepartment;

            const orderStatusMatch =
                selectedOrderStatus === 'all' ||
                order.orderStatus === selectedOrderStatus;

            const deliveryStatusMatch =
                selectedDeliveryStatus === 'all' ||
                order.deliveryStatus === selectedDeliveryStatus;

            return departmentMatch && orderStatusMatch && deliveryStatusMatch;
        });
    };


    const sortedPurchaseOrders = sortData(
        getFilteredPurchaseOrders(),
        sortConfig.key,
        sortConfig.order
    );

    const paginatedPurchaseOrders = sortedPurchaseOrders.slice(
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
        setExpectedDeliveryDate(order.expectedDeliveryDate || '');
        setNewDeliveryStatus(order.deliveryStatus || '');
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format: YYYY-MM-DDThh:mm
        return date.toISOString().slice(0, 16);
    };

    return (
        <Box sx={{
            p: isMobile ? 1 : 3,
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <Typography
                variant={isMobile ? "h6" : "h5"}
                sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}
            >
                Purchase Order Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                mb: 3,
                alignItems: isMobile ? 'stretch' : 'center'
            }}>
                <Autocomplete
                    id="department-filter"
                    options={[{ deptId: 'all', deptName: 'All Departments' }, ...departments]}
                    getOptionLabel={(option) => option.deptName || ''}
                    value={departments.find(d => d.deptName === selectedDepartment) ||
                        { deptId: 'all', deptName: 'All Departments' }}
                    onChange={(event, newValue) => {
                        setSelectedDepartment(newValue ? newValue.deptName : 'all');
                    }}
                    sx={{ minWidth: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Filter by Department" variant="outlined" />
                    )}
                />

                <TextField
                    select
                    label="Order Status"
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    sx={{ minWidth: isMobile ? '100%' : 200 }}
                >
                    <MenuItem value="all">All Order Status</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="ORDERED">Ordered</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Delivery Status"
                    value={selectedDeliveryStatus}
                    onChange={(e) => setSelectedDeliveryStatus(e.target.value)}
                    sx={{ minWidth: isMobile ? '100%' : 200 }}
                >
                    <MenuItem value="all">All Delivery Status</MenuItem>
                    {deliveryStatusOptions.filter(status => status !== 'all').map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1a237e' }}>
                            {/* <TableCell
            sx={{ color: 'white', cursor: 'pointer' }}
            onClick={() => handleSort('orderId')}
        >
            Order ID {sortConfig.key === 'orderId' && (sortConfig.order === 'asc' ? '↑' : '↓')}
        </TableCell> */}
                            <TableCell
                                sx={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => handleSort('itemName')}
                            >
                                Item {sortConfig.key === 'itemName' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => handleSort('department')}
                            >
                                Department {sortConfig.key === 'department' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => handleSort('quantity')}
                            >
                                Quantity {sortConfig.key === 'quantity' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', cursor: 'pointer' }}
                                onClick={() => handleSort('finalCost')}
                            >
                                Cost {sortConfig.key === 'finalCost' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                            </TableCell>
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
                                {/* <TableCell>{item.orderId || item.proposalId}</TableCell> */}
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
                    setPage(0);
                }}
                rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 15]}
                labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
            />


            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        width: isMobile ? '100%' : '400px',
                        margin: isMobile ? 0 : 2
                    }
                }}
            >
                <DialogTitle>Update Delivery Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '300px', mt: 2 }}>
                        <TextField
                            select
                            label="Delivery Status"
                            value={newDeliveryStatus}
                            onChange={(e) => setNewDeliveryStatus(e.target.value)}
                            fullWidth
                        >
                            {deliveryStatusOptions
                                .filter((status) => status !== 'all') // Exclude 'all' from the options
                                .map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                        </TextField>


                        <TextField
                            label="Expected Delivery Date"
                            type="datetime-local"
                            value={formatDateForInput(expectedDeliveryDate)}
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

    );
};

export default PurchaserDashboard;