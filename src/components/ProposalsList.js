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
    TextField
} from '@mui/material';
import { TablePagination } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import ProposalForm from './ProposalForm';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { sortData } from '../utils/utilities';
import FacultyMetrics from './FacultyMetrics';

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
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [proposalHistory, setProposalHistory] = useState([]);
    const [selectedProposalId, setSelectedProposalId] = useState(null);
    const [commentText, setCommentText] = useState('');



    useEffect(() => {
        fetchProposals();
    }, []);

    // const fetchProposals = async () => {
    //     try {
    //         const loggedUser = JSON.parse(localStorage.getItem('user'));
    //         if (!loggedUser?.userId) {
    //             setError('User not found');
    //             return;
    //         }

    //         // Fetch proposals for the current user
    //         const response = await axios.get(`/api/proposals/user/${loggedUser.userId}`);
    //         setProposals(response.data);
    //     } catch (err) {
    //         console.error('Error fetching proposals:', err);
    //         setError('Error fetching proposals');
    //         setSnackbar({
    //             open: true,
    //             message: 'Error fetching proposals',
    //             severity: 'error'
    //         });
    //     }
    // };

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

    const handleOpenHistoryDialog = async (proposalId) => {
        try {
            setSelectedProposalId(proposalId);
            // Fetch approval history
            const response = await axios.get(`/api/proposals/${proposalId}/history`);

            // IMPORTANT: if you currently have code filtering out
            // repeated oldStatus==newStatus, remove that if you want 
            // to see "comment-only" entries (PENDING -> PENDING).

            setProposalHistory(response.data);
            setOpenHistoryDialog(true);

        } catch (err) {
            console.error('Error fetching approval history:', err);
            setSnackbar({
                open: true,
                message: 'No comments found for this proposal',
                severity: 'error',
            });
        }
    };

    const handleAddComment = async () => {
        try {
            if (!commentText.trim()) return;

            // 1) Get currentUser from localStorage:
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            const currentUserId = loggedUser.userId;

            // 2) Call the backend endpoint:
            await axios.put(`/api/proposals/${selectedProposalId}/comment`, null, {
                params: {
                    currentUserId: currentUserId,  // "approverId" in your existing code, 
                    // but we know it actually means the user adding comment
                    comments: commentText
                    // optional: fundingSourceId => for faculty, typically null
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



    const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('description')}
                                >
                                    Description
                                </TableCell>
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
                                        <TableCell align="center">{proposal.description}</TableCell>
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
                                        <TableCell align="center">
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
                                        </TableCell>

                                        {/* ============ DELIVERY STATUS (Color-coded) ============ */}
                                        <TableCell align="center">
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
                                        </TableCell>

                                        {/* ============ ACTIONS ============ */}
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                                {/* Only enable editing if status is still PENDING */}
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleOpenDialog(proposal)}
                                                    disabled={
                                                        proposal.status?.toLowerCase() !== 'pending'
                                                    }
                                                    sx={{
                                                        opacity:
                                                            proposal.status?.toLowerCase() !== 'pending'
                                                                ? 0.5
                                                                : 1,
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>


                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleOpenHistoryDialog(proposal.proposalId)}
                                                    sx={{
                                                        backgroundColor: proposal.hasHistory ? '#386641' : '#85182a',
                                                        color: '#fff',         // so text is visible on both green/red
                                                        borderColor: 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: proposal.hasHistory ? '#95d5b2' : '#f7a399'
                                                        }
                                                    }}
                                                >
                                                    View Comments
                                                </Button>


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
                        proposalHistory.map((entry, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    border: '1px solid #eee',
                                    borderRadius: 1
                                }}
                            >
                                <Typography variant="body2">
                                    <strong>Old Status:</strong> {entry.oldStatus} &nbsp;
                                    <strong>New Status:</strong> {entry.newStatus}
                                </Typography>
                                {entry.comments && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        <strong>Comment:</strong> {entry.comments}
                                    </Typography>
                                )}

                            </Box>
                        ))
                    )}
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

        </Box>
    );
};

export default ProposalsList;
