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
    TablePagination,
    Chip


} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { sortData } from '../utils/utilities';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
    DateRangePicker,
    SingleInputDateRangeField
} from '@mui/x-date-pickers-pro';
import moment from 'moment-timezone';
import OrderTimeline from './OrderTimeline';
import DeliveryTimeline from './DeliveryTimeline';
import InfoIcon from '@mui/icons-material/Info';
import CommentIcon from '@mui/icons-material/Comment';


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
    const [trackingNumber, setTrackingNumber] = useState('');

    // const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');

    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [proposalHistory, setProposalHistory] = useState([]);
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [commentText, setCommentText] = useState('');


    const [dateRange, setDateRange] = useState([null, null]);

    const navigate = useNavigate();

    const [orderNotes, setOrderNotes] = useState([]);
    const [noteText, setNoteText] = useState('');



    const [openOrderTimelineDialog, setOpenOrderTimelineDialog] = useState(false);
    const [openDeliveryTimelineDialog, setOpenDeliveryTimelineDialog] = useState(false);





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

                    // Add these lines:
                    description: proposal.description,            // from your new backend field
                    requesterName: proposal.requesterName,        // from your new backend field
                    approverName: proposal.approverName,


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

            // let dateMatch = true;
            // if (startDate && endDate && order.expectedDeliveryDate) {
            //     const orderDate = new Date(order.expectedDeliveryDate);
            //     const sDate = new Date(startDate);      // e.g. 2025-01-10 => JS date
            //     const eDate = new Date(endDate);        // e.g. 2025-01-20 => JS date

            //     // Check if orderDate is >= sDate AND <= eDate
            //     dateMatch = (orderDate >= sDate && orderDate <= eDate);
            // }

            let dateMatch = true;
            const [start, end] = dateRange;
            if (start && end && order.expectedDeliveryDate) {
                const orderDate = new Date(order.expectedDeliveryDate);
                const sDate = new Date(start);
                const eDate = new Date(end);
                dateMatch = (orderDate >= sDate && orderDate <= eDate);
            }

            return (
                departmentMatch &&
                orderStatusMatch &&
                deliveryStatusMatch &&
                dateMatch
            );
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



    const getLocalDateTimeString = () => {
        const date = new Date();
        const year = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const HH = String(date.getHours()).padStart(2, '0');
        const MM = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${mm}-${dd}T${HH}:${MM}:${ss}`;
    };


    const handleCreatePurchaseOrder = async (proposalId) => {
        try {
            const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
            const createdBy = `${loggedUser.firstName} ${loggedUser.lastName}` || 'Anonymous';
            const createdTime = moment().tz("America/New_York").format("YYYY-MM-DDTHH:mm:ss");


            const response = await axios.post(
                `/api/purchase-orders/create/${proposalId}`,
                null,
                {
                    params: {
                        createdBy,
                        createdTime
                    }
                }
            );

            // Update the local state immediately
            setPurchaseOrders(prevOrders =>
                prevOrders.map(order => {
                    if (order.proposalId === proposalId) {
                        return {
                            ...order,
                            // purchaseOrderNumber: response.data.purchaseOrderNumber,
                            purchaseOrderNumber: trackingNumber,
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

            // 1) Grab user from local storage
            const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
            const updatedBy = `${loggedUser.firstName} ${loggedUser.lastName}` || 'Anonymous';
            // 2) use local system time => in ISO
            const updatedTime = moment().tz("America/New_York").format("YYYY-MM-DDTHH:mm:ss");


            await axios.put(
                `/api/purchase-orders/${selectedOrder.orderId}/delivery-status`,
                null,
                {
                    params: {
                        newStatus: newDeliveryStatus,
                        expectedDeliveryDate,
                        purchaseOrderNumber: trackingNumber,
                        updatedBy,       // pass the user
                        updatedTime      // pass the local time
                    }
                }
            );

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


    const fetchOrderNotes = async (orderId) => {
        try {
            const response = await axios.get(`/api/purchase-orders/${orderId}/notes`);
            setOrderNotes(response.data); // store the notes in state
        } catch (err) {
            console.error('Error fetching order notes:', err);
            setSnackbar({
                open: true,
                message: 'Error fetching delivery notes.',
                severity: 'error'
            });
        }
    };


    const handleOpenDialog = (order) => {
        setSelectedOrder(order);
        setExpectedDeliveryDate(order.expectedDeliveryDate || '');
        setNewDeliveryStatus(order.deliveryStatus || '');
        setTrackingNumber(order.purchaseOrderNumber !== 'Not Generated' ? order.purchaseOrderNumber : '');
        fetchOrderNotes(order.orderId);
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


    const handleAddNote = async () => {
        if (!noteText.trim()) return;  // don't submit empty note

        try {

            const loggedUser = JSON.parse(localStorage.getItem('user')) || {};

            const createdBy = `${loggedUser.firstName} ${loggedUser.lastName}` || 'Anonymous';

            const createdDate = moment()
                .tz("America/New_York")
                .format("YYYY-MM-DDTHH:mm:ss");


            const response = await axios.post(
                `/api/purchase-orders/${selectedOrder.orderId}/notes`,
                null,  // no request body, just query params
                {
                    params: {
                        noteText: noteText,
                        createdBy: createdBy,
                        createdDate: createdDate,
                    }
                }
            );

            // The response will be the newly created PurchaseOrderNoteDTO
            setOrderNotes((prevNotes) => [...prevNotes, response.data]);
            setNoteText(''); // clear the input

            setSnackbar({
                open: true,
                message: 'Note added successfully.',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error adding note:', err);
            setSnackbar({
                open: true,
                message: 'Error adding note.',
                severity: 'error'
            });
        }
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

        // Convert to local timezone
        const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localTime = new Date(date - offset).toISOString().slice(0, 16);

        return localTime;
    };

    function formatDateTimeEST(dateTimeString) {
        if (!dateTimeString) return '';
        return new Date(dateTimeString).toLocaleString('en-US', {
            timeZone: 'America/New_York',
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    const handleExpectedDeliveryDateChange = (e) => {
        const inputDate = new Date(e.target.value);
        const currentDate = new Date();

        // Ensure the input date is in the future
        if (inputDate >= currentDate) {
            setExpectedDeliveryDate(e.target.value);
        } else {
            setSnackbar({
                open: true,
                message: 'Expected delivery date must be in the future',
                severity: 'error',
            });
        }
    };

    const handleOpenHistoryDialog = async (proposalId) => {
        try {
            setSelectedProposalId(proposalId);  // which proposal are we viewing?

            // 1) Fetch approval history from the backend:
            const response = await axios.get(`/api/proposals/${proposalId}/history`);
            // 2) Store it in state:
            setProposalHistory(response.data);

            // 3) Reset any existing comment text:
            setCommentText('');

            // 4) Open the dialog:
            setOpenHistoryDialog(true);
        } catch (err) {
            console.error('Error fetching proposal history:', err);
            setSnackbar({
                open: true,
                message: 'Error fetching proposal history',
                severity: 'error'
            });
        }
    };


    const handleAddComment = async () => {
        try {
            if (!commentText.trim()) return;

            // 1) Get currentUser from localStorage:
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            const currentUserId = loggedUser.userId;
            const actionDate = moment()
                .tz("America/New_York")
                .format("YYYY-MM-DDTHH:mm:ss");

            // 2) Call the backend endpoint:
            await axios.put(`/api/proposals/${selectedProposalId}/comment`, null, {
                params: {
                    currentUserId: currentUserId,
                    comments: commentText,
                    // optional: fundingSourceId => for purchaser, typically null or pass some if needed
                    actionDate: actionDate

                }
            });

            // 3) Clear the text field after success:
            setCommentText('');

            // 4) Refresh the history to show the new comment
            const response = await axios.get(`/api/proposals/${selectedProposalId}/history`);
            setProposalHistory(response.data);

            setSnackbar({
                open: true,
                message: 'Comment added successfully!',
                severity: 'success'
            });

        } catch (error) {
            console.error('Error adding comment:', error);
            setSnackbar({
                open: true,
                message: 'Failed to add comment.',
                severity: 'error'
            });
        }
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

                {/* <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: isMobile ? '100%' : 200 }}
                /> */}

                {/* NEW: End date filter */}
                {/* <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: isMobile ? '100%' : 200 }}
                /> */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DateRangePicker
                        slots={{ field: SingleInputDateRangeField }}
                        value={dateRange}
                        onChange={(newValue) => setDateRange(newValue)}
                        slotProps={{
                            textField: {
                                label: 'Filter by Expected Delivery Date',
                                variant: 'outlined',
                                fullWidth: isMobile
                            }
                        }}
                    />

                    <Typography
                        variant="body2"
                        sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                        onClick={() => setDateRange([null, null])}
                    >
                        Clear
                    </Typography>
                </Box>



            </Box>
            <TableContainer
    component={Paper}
    sx={{
        mb: 4,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto', // Keep scrolling
        padding: 2, // Add padding for more spacing
        width: '100%', // Stretch the table
        // minWidth: '1200px' // Ensure table size is adequate for content
    }}
>

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

                            {/* NEW: Requester */}
                            <TableCell sx={{ color: 'white' }}>Requester</TableCell>

                            {/* NEW: Approver */}
                            <TableCell sx={{ color: 'white' }}>Approver</TableCell>
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
                                <TableCell>
                                    <Link
                                        to={`/proposal/${item.proposalId}`}
                                        style={{ textDecoration: 'none', color: '#1a237e', cursor: 'pointer' }}
                                    >
                                        {item.itemName}
                                    </Link>
                                </TableCell>

                                <TableCell>{item.department}</TableCell>


                                <TableCell>
                                    {item.requesterName ? (
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.requesterName}&su=Hello%20Requester&body=Hi%20there!`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', color: '#1a237e' }}
                                        >
                                            {item.requesterName}
                                            {/* or item.requesterEmail if you just want to show the email address directly */}
                                        </a>
                                    ) : (
                                        item.requesterName || '—'
                                    )}
                                </TableCell>


                                {/* NEW: Show the approver's name */}
                                {/* <TableCell>{item.approverName}</TableCell> */}

                                <TableCell>
                                    {item.approverName ? (
                                        <a
                                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.approverName}&su=Hello%20Approver&body=Hi%20there!`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', color: '#1a237e' }}
                                        >
                                            {item.approverName}
                                        </a>
                                    ) : (
                                        item.approverName || '—'
                                    )}
                                </TableCell>


                                {/* <TableCell>
                                    <Box sx={{
                                        backgroundColor: item.orderStatus === 'ORDERED' ? '#e8f5e9' : '#fff3e0',
                                        color: item.orderStatus === 'ORDERED' ? '#2e7d32' : '#e65100',
                                        p: 1,
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}>
                                        {item.orderStatus}
                                    </Box>
                                </TableCell> */}
                                <TableCell align="center">
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row', // Change this to 'row' for horizontal layout
                                            alignItems: 'center',
                                            justifyContent: 'center', // Optional: center-align horizontally
                                            gap: 1, // Add spacing between the elements
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: item.orderStatus === 'ORDERED' ? '#e8f5e9' : '#fff3e0',
                                                color: item.orderStatus === 'ORDERED' ? '#2e7d32' : '#e65100',
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: 'center',
                                                minWidth: 80, // Ensures consistent width for the status box
                                            }}
                                        >
                                            {item.orderStatus}
                                        </Box>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedOrderStatus(item.orderStatus);
                                                setOpenOrderTimelineDialog(true);
                                            }}
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>



                                {/* <TableCell>

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
                                </TableCell> */}
                                <TableCell align="center">
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row', // Change this to 'row' for horizontal layout
                                            alignItems: 'center',
                                            justifyContent: 'center', // Optional: center-align horizontally
                                            gap: 1, // Add some space between the buttons
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor:
                                                    item.deliveryStatus === 'Delivered'
                                                        ? '#e8f5e9'
                                                        : item.deliveryStatus === 'Shipped'
                                                            ? '#e3f2fd'
                                                            : '#fff3e0',
                                                color:
                                                    item.deliveryStatus === 'Delivered'
                                                        ? '#2e7d32'
                                                        : item.deliveryStatus === 'Shipped'
                                                            ? '#1565c0'
                                                            : '#e65100',
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: 'center',
                                                minWidth: 80, // Optional: Ensures a consistent width for the label box
                                            }}
                                        >
                                            {item.deliveryStatus}
                                        </Box>
                                        <IconButton
                                            onClick={() => {
                                                setSelectedDeliveryStatus(item.deliveryStatus);
                                                setOpenDeliveryTimelineDialog(true);
                                            }}
                                        >
                                            <InfoIcon />
                                        </IconButton>
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
                                        <IconButton
                                            onClick={() => handleOpenHistoryDialog(item.proposalId)}
                                            sx={{
                                                backgroundColor: '#386641',
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: '#95d5b2'
                                                },
                                                borderRadius: '4px',
                                                padding: '8px' // Adjust as needed for spacing
                                            }}
                                        >
                                            <CommentIcon />
                                        </IconButton>

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
                            onChange={handleExpectedDeliveryDateChange}
                            fullWidth
                            InputProps={{
                                inputProps: {
                                    min: formatDateForInput(new Date()), // Use the current local time
                                },
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Tracking Number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            fullWidth
                        />

                        {/* NEW SECTION: DELIVERY NOTES */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Delivery Notes
                            </Typography>

                            {/* List existing notes */}
                            <Box
                                sx={{
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    p: 1,
                                    mb: 2
                                }}
                            >
                                {orderNotes && orderNotes.length > 0 ? (
                                    orderNotes.map((note) => (
                                        <Box
                                            key={note.noteId}
                                            sx={{
                                                mb: 1,
                                                p: 1,
                                                border: '1px solid #eee',
                                                borderRadius: 1,
                                                backgroundColor: '#fafafa'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {note.createdBy || 'Unknown User'} on{" "}
                                                {new Date(note.createdDate).toLocaleString()}
                                            </Typography>

                                            <Typography variant="body2">
                                                {note.noteText}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        No notes yet.
                                    </Typography>
                                )}
                            </Box>

                            {/* Add new note */}
                            <TextField
                                label="Add a new note"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                multiline
                                minRows={2}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAddNote}
                                sx={{ mt: 1 }}
                                disabled={!noteText.trim()}
                            >
                                Add Note
                            </Button>
                        </Box>

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


            <Dialog
                open={openHistoryDialog}
                onClose={() => setOpenHistoryDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Proposal History (Comments)</DialogTitle>
                <DialogContent>
                    {proposalHistory.length === 0 ? (
                        <Typography>No history found.</Typography>
                    ) : (
                        <Box
                            sx={{
                                maxHeight: 300,
                                overflowY: 'auto',
                                p: 2,
                                backgroundColor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                            }}
                        >
                            {/* {proposalHistory.map((entry, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        backgroundColor: 'background.default',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        Comment by {entry.approverName || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {formatDateTimeEST(entry.actionDate)}
                                    </Typography>
                                    {entry.oldStatus !== entry.newStatus && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Status changed from <strong>{entry.oldStatus}</strong> to <strong>{entry.newStatus}</strong>
                                        </Typography>
                                    )}
                                    {entry.comments && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {entry.comments}
                                        </Typography>
                                    )}
                                </Box>
                            ))} */}

                            {proposalHistory.map((entry, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 3,
                                        p: 2,
                                        backgroundColor: 'background.default',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                Comment by {entry.approverName || 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {formatDateTimeEST(entry.actionDate)}
                                            </Typography>
                                        </Box>

                                        {/* Show role on the right (Chip) */}
                                        {entry.approverRole && (
                                            <Chip
                                                label={entry.approverRole}
                                                color="primary"
                                                size="small"
                                                sx={{ alignSelf: 'center' }}
                                            />
                                        )}
                                    </Box>

                                    {entry.oldStatus !== entry.newStatus && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Status changed from <strong>{entry.oldStatus}</strong> to{' '}
                                            <strong>{entry.newStatus}</strong>
                                        </Typography>
                                    )}
                                    {entry.comments && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {entry.comments}
                                        </Typography>
                                    )}
                                </Box>
                            ))}

                        </Box>
                    )}


                    {/* Add comment text field + button */}
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Add a comment"
                            fullWidth
                            multiline
                            minRows={2}
                            maxRows={4}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />

                        <Button
                            variant="contained"
                            sx={{ mt: 1 }}
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                        >
                            Post Comment
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryDialog(false)} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openOrderTimelineDialog}
                onClose={() => setOpenOrderTimelineDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Order Status Timeline</DialogTitle>
                <DialogContent>
                    <OrderTimeline orderStatus={selectedOrderStatus} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOrderTimelineDialog(false)} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={openDeliveryTimelineDialog}
                onClose={() => setOpenDeliveryTimelineDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Delivery Status Timeline</DialogTitle>
                <DialogContent>
                    <DeliveryTimeline deliveryStatus={selectedDeliveryStatus} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeliveryTimelineDialog(false)} variant="outlined">
                        Close
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