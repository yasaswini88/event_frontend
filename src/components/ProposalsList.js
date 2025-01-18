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
    Tabs,
    Tab,
    TextField,
    Chip
} from '@mui/material';
import { TablePagination } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import ProposalForm from './ProposalForm';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { sortData } from '../utils/utilities';
import FacultyMetrics from './FacultyMetrics';
import moment from 'moment-timezone';
import OrderTimeline from './OrderTimeline';
import DeliveryTimeline from './DeliveryTimeline';
import InfoIcon from '@mui/icons-material/Info';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsDialog from './CommentsDialog';




const ProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProposal, setEditingProposal] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);
    const [error, setError] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sortConfig, setSortConfig] = useState({ key: 'proposalId', order: 'desc' });
    const [tabValue, setTabValue] = useState(0);
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
    const [currentProposalId, setCurrentProposalId] = useState(null);
    //   formData.status?.toLowerCase() === 'approved' ||
    //   formData.status?.toLowerCase() === 'rejected';

    const [openOrderTimelineDialog, setOpenOrderTimelineDialog] = useState(false);
    const [openDeliveryTimelineDialog, setOpenDeliveryTimelineDialog] = useState(false);
    const [selectedOrderStatus, setSelectedOrderStatus] = useState(null);
    const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState(null);



    useEffect(() => {
        fetchProposals();
    }, []);



    // 1) In fetchProposals()
    const fetchProposals = async () => {
        try {
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            if (!loggedUser?.userId) {
                setError('User not found');
                return;
            }

            // Fetch proposals for the current user
            const response = await axios.get(`/api/proposals/user/${loggedUser.userId}`);
            const fetchedProposals = response.data;  // array of proposals

            // For each proposal, check if there's any history
            // (This will do an extra GET /history call per proposal)
            const withHistoryPromises = fetchedProposals.map(async (proposal) => {
                try {
                    const histResp = await axios.get(`/api/proposals/${proposal.proposalId}/history`);
                    // If length > 0, it means there's some history or comments
                    proposal.hasHistory = (histResp.data.length > 0);
                } catch (err) {
                    console.error('Error checking history for proposal', proposal.proposalId, err);
                    // If an error occurs, treat it as no history
                    proposal.hasHistory = false;
                }
                return proposal;
            });

            // Wait for all the history checks to complete
            const proposalsWithHistory = await Promise.all(withHistoryPromises);

            // Now store them in state
            setProposals(proposalsWithHistory);
        } catch (err) {
            console.error('Error fetching proposals:', err);
            setError('Error fetching proposals');
            setSnackbar({
                open: true,
                message: 'Error fetching proposals',
                severity: 'error'
            });
        }
    };


    const handleOpenDialog = async (proposal = null) => {
        try {
            if (proposal) {
                const loggedUser = JSON.parse(localStorage.getItem('user'));
                const response = await axios.get(`/api/proposals/${proposal.proposalId}`, {
                    params: { currentUserId: loggedUser.userId }
                });
                setEditingProposal(response.data);
            } else {
                setEditingProposal(null);
            }
            setOpenDialog(true);
        } catch (err) {
            console.error('Error fetching proposal details:', err);
            setSnackbar({
                open: true,
                message: 'Failed to fetch proposal details.',
                severity: 'error',
            });
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingProposal(null);
        fetchProposals();   // Refresh after closing
    };

    const handleDelete = (proposalId) => {
        setProposalToDelete(proposalId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/proposals/${proposalToDelete}`);
            setSnackbar({
                open: true,
                message: 'Proposal deleted successfully',
                severity: 'success',
            });
            fetchProposals();
        } catch (err) {
            console.error('Error deleting proposal:', err);
            setSnackbar({
                open: true,
                message: 'Error deleting proposal',
                severity: 'error',
            });
        } finally {
            setDeleteDialogOpen(false);
            setProposalToDelete(null);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            const newConfig = {
                key,
                order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
            };
            return newConfig;
        });
    };

    const getFilteredProposals = () => {
        let filtered = proposals;
        switch (tabValue) {
            case 1: // Pending
                return filtered.filter((proposal) => proposal.status?.toLowerCase() === 'pending');
            case 2: // Approved
                return filtered.filter((proposal) => proposal.status?.toLowerCase() === 'approved');
            case 3: // Rejected
                return filtered.filter((proposal) => proposal.status?.toLowerCase() === 'rejected');
            default: // All
                return filtered;
        }
    };

    const handleOpenCommentsDialog = (proposalId) => {
        setCurrentProposalId(proposalId);
        setOpenCommentsDialog(true);
    };




    const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    function formatDateTimeEST(dateTimeString) {
        if (!dateTimeString) return '';
        return new Date(dateTimeString).toLocaleString('en-US', {
            timeZone: 'America/New_York',
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    function formatLocalDate(dateOnlyString) {
        return moment(dateOnlyString, 'YYYY-MM-DD')
          .format('MMM D, YYYY');
      }

      
    return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
                {/* Header Section */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 2 : 0,
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'center',
                        mb: 3
                    }}
                >
                    <Typography
                        variant={isMobile ? 'h5' : 'h4'}
                        sx={{ fontWeight: 'bold', color: '#333' }}
                    >
                        My Procurement Requests
                    </Typography>
                    <Button
                        fullWidth={isMobile}
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        sx={{
                            backgroundColor: '#1a237e',
                            '&:hover': {
                                backgroundColor: '#0d1b5e',
                            }
                        }}
                    >
                        Submit New Request
                    </Button>
                </Box>

                {/* Metrics Dashboard */}
                <Box sx={{ mb: 4 }}>
                    <FacultyMetrics proposals={proposals} />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                        mb: 3,
                        borderBottom: '1px solid #e0e0e0',
                    }}
                    TabIndicatorProps={{
                        sx: { backgroundColor: '#1a237e' },
                    }}
                    variant={isMobile ? 'scrollable' : 'fullWidth'}
                    scrollButtons={isMobile ? 'auto' : false}
                    allowScrollButtonsMobile
                >
                    <Tab label={`All (${proposals.length})`} />
                    <Tab label={`Pending (${proposals.filter(p => p.status?.toLowerCase() === 'pending').length})`} />
                    <Tab label={`Approved (${proposals.filter(p => p.status?.toLowerCase() === 'approved').length})`} />
                    <Tab label={`Rejected (${proposals.filter(p => p.status?.toLowerCase() === 'rejected').length})`} />
                </Tabs>

                <TableContainer
                    component={Paper}
                    sx={{
                        mb: 4,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto',
                        width: '100%',
                    }}
                >
                    <Table

                    >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('proposalId')}
                                >
                                    Request ID
                                </TableCell>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('itemName')}
                                >
                                    Item Name
                                </TableCell>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('category')}
                                >
                                    Category
                                </TableCell>
                                {/* <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('description')}
                                >
                                    Description
                                </TableCell> */}
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('quantity')}
                                >
                                    Quantity
                                </TableCell>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('estimatedCost')}
                                >
                                    Estimated Cost
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    Request Date
                                </TableCell>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}
                                >
                                    Approver
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    Order Status
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    Delivery Status
                                </TableCell>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('expectedDueDate')}
                                >
                                    Expected Due Date
                                </TableCell>

                                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedProposals
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((proposal) => (
                                    <TableRow key={proposal.proposalId}>
                                        <TableCell align="center">{proposal.proposalId}</TableCell>
                                        <TableCell align="center">{proposal.itemName}</TableCell>
                                        <TableCell align="center">{proposal.category}</TableCell>
                                        {/* <TableCell align="center">{proposal.description}</TableCell> */}
                                        <TableCell align="center">{proposal.quantity}</TableCell>
                                        <TableCell align="center">
                                            {proposal.estimatedCost
                                                ? `$${proposal.estimatedCost.toFixed(2)}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        proposal.status?.toLowerCase() === 'approved'
                                                            ? '#e8f5e9'
                                                            : proposal.status?.toLowerCase() === 'pending'
                                                                ? '#fff3e0'
                                                                : proposal.status?.toLowerCase() === 'rejected'
                                                                    ? '#ffebee'
                                                                    : '#f5f5f5',
                                                    color:
                                                        proposal.status?.toLowerCase() === 'approved'
                                                            ? '#2e7d32'
                                                            : proposal.status?.toLowerCase() === 'pending'
                                                                ? '#e65100'
                                                                : proposal.status?.toLowerCase() === 'rejected'
                                                                    ? '#c62828'
                                                                    : '#333',
                                                    padding: '8px',
                                                    borderRadius: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {proposal.status || 'N/A'}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            {proposal.proposalDate
                                                ? formatDate(proposal.proposalDate)
                                                : '—'}
                                        </TableCell>
                                        {/* <TableCell align="center">
                                            {proposal.approverName || '—'}
                                        </TableCell> */}
                                        <TableCell align="center">
                                            {proposal.approverName ? (
                                                <a
                                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${proposal.approverName}&su=Hello&body=Hi!`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ textDecoration: 'none', color: '#1a237e' }} // optional styling
                                                >
                                                    {proposal.approverName}
                                                </a>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>

                                        {/* ============ ORDER STATUS (Color-coded) ============ */}
                                        {/* <TableCell align="center">
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        proposal.orderStatus?.toUpperCase() === 'ORDERED'
                                                            ? '#e8f5e9'
                                                            : proposal.orderStatus?.toUpperCase() === 'PENDING'
                                                                ? '#fff3e0'
                                                                : '#f5f5f5',
                                                    color:
                                                        proposal.orderStatus?.toUpperCase() === 'ORDERED'
                                                            ? '#2e7d32'
                                                            : proposal.orderStatus?.toUpperCase() === 'PENDING'
                                                                ? '#e65100'
                                                                : '#333',
                                                    padding: '8px',
                                                    borderRadius: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {proposal.orderStatus || '—'}
                                            </Box>
                                        </TableCell> */}

                                        {/* ============ DELIVERY STATUS (Color-coded) ============ */}
                                        {/* <TableCell align="center">
                                            <Box
                                                sx={{
                                                    backgroundColor:
                                                        proposal.deliveryStatus === 'Delivered'
                                                            ? '#e8f5e9'
                                                            : proposal.deliveryStatus === 'Shipped'
                                                                ? '#e3f2fd'
                                                                : proposal.deliveryStatus === 'Processing'
                                                                    ? '#fffde7'
                                                                    : '#fff3e0',
                                                    color:
                                                        proposal.deliveryStatus === 'Delivered'
                                                            ? '#2e7d32'
                                                            : proposal.deliveryStatus === 'Shipped'
                                                                ? '#1565c0'
                                                                : proposal.deliveryStatus === 'Processing'
                                                                    ? '#f57f17'
                                                                    : '#e65100',
                                                    padding: '8px',
                                                    borderRadius: 1,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {proposal.deliveryStatus || '—'}
                                            </Box>
                                        </TableCell> */}


                                        {/* <TableCell align="center">
                                            <OrderTimeline orderStatus={proposal.orderStatus} />
                                        </TableCell>

                                       
                                        <TableCell align="center">
                                            <DeliveryTimeline deliveryStatus={proposal.deliveryStatus} />
                                        </TableCell> */}


                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row', // Change to row layout for horizontal alignment
                                                    alignItems: 'center', // Align items vertically centered
                                                    justifyContent: 'center', // Center-align horizontally in the cell
                                                    gap: 1, // Add spacing between the elements
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        backgroundColor:
                                                            proposal.orderStatus?.toUpperCase() === 'ORDERED'
                                                                ? '#e8f5e9'
                                                                : proposal.orderStatus?.toUpperCase() === 'PENDING'
                                                                    ? '#fff3e0'
                                                                    : '#f5f5f5',
                                                        color:
                                                            proposal.orderStatus?.toUpperCase() === 'ORDERED'
                                                                ? '#2e7d32'
                                                                : proposal.orderStatus?.toUpperCase() === 'PENDING'
                                                                    ? '#e65100'
                                                                    : '#333',
                                                        padding: '8px',
                                                        borderRadius: 1,
                                                        textAlign: 'center',
                                                        minWidth: 80, // Optional: Set a consistent width for the status box
                                                    }}
                                                >
                                                    {proposal.orderStatus || '—'}
                                                </Box>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedOrderStatus(proposal.orderStatus);
                                                        setOpenOrderTimelineDialog(true);
                                                    }}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>


                                        <TableCell align="center">
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row', // Change layout to horizontal
                                                    alignItems: 'center', // Vertically align items
                                                    justifyContent: 'center', // Center align content horizontally
                                                    gap: 1, // Add spacing between the elements
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        backgroundColor:
                                                            proposal.deliveryStatus === 'Delivered'
                                                                ? '#e8f5e9'
                                                                : proposal.deliveryStatus === 'Shipped'
                                                                    ? '#e3f2fd'
                                                                    : proposal.deliveryStatus === 'Processing'
                                                                        ? '#fffde7'
                                                                        : '#fff3e0',
                                                        color:
                                                            proposal.deliveryStatus === 'Delivered'
                                                                ? '#2e7d32'
                                                                : proposal.deliveryStatus === 'Shipped'
                                                                    ? '#1565c0'
                                                                    : proposal.deliveryStatus === 'Processing'
                                                                        ? '#f57f17'
                                                                        : '#e65100',
                                                        padding: '8px',
                                                        borderRadius: 1,
                                                        textAlign: 'center',
                                                        minWidth: 80, // Optional: Consistent box width
                                                    }}
                                                >
                                                    {proposal.deliveryStatus || '—'}
                                                </Box>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedDeliveryStatus(proposal.deliveryStatus);
                                                        setOpenDeliveryTimelineDialog(true);
                                                    }}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
  {proposal.expectedDueDate 
    ? formatLocalDate(proposal.expectedDueDate)
    : '—'}
</TableCell>







                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                {/* Only enable editing if status is still PENDING */}
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(proposal)}
                                                // disabled={
                                                //     proposal.status?.toLowerCase() !== 'pending'
                                                // }
                                                // sx={{
                                                //     opacity:
                                                //         proposal.status?.toLowerCase() !== 'pending'
                                                //             ? 0.5
                                                //             : 1,
                                                // }}
                                                >
                                                    <EditIcon />
                                                </IconButton>


                                                <IconButton
                                                    onClick={() => handleOpenCommentsDialog(proposal.proposalId)}
                                                    sx={{
                                                        backgroundColor: proposal.hasHistory ? '#386641' : '#85182a',
                                                        color: '#fff',
                                                        borderColor: 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: proposal.hasHistory ? '#95d5b2' : '#f7a399'
                                                        },
                                                        padding: '8px', // Optional: adjust padding for better spacing
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
                    <TablePagination
                        rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
                        component="div"
                        count={getFilteredProposals().length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
                    />
                </TableContainer>

                {/* ============ Dialog for Creating/Editing Proposal ============ */}
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                    fullScreen={isMobile}
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6">
                                {editingProposal ? 'Edit Proposal' : 'Submit New Proposal'}
                            </Typography>
                            <IconButton onClick={handleCloseDialog}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <ProposalForm
                            onSubmitSuccess={handleCloseDialog}
                            initialData={editingProposal}
                        />
                    </DialogContent>
                </Dialog>

                {/* ============ Dialog for Confirm Delete ============ */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this proposal?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmDelete} color="secondary">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ============ Snackbar ============ */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    // anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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


            {/* Dialog for Order Timeline */}
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

            {/* Dialog for Delivery Timeline */}
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

            <CommentsDialog
                open={openCommentsDialog}
                onClose={() => setOpenCommentsDialog(false)}
                proposalId={currentProposalId}
                setSnackbar={setSnackbar}    // Pass if you want success/error snackbars
            />



        </Box>
    );
};

export default ProposalsList;
