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
    Tab
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

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            if (!loggedUser?.userId) {
                setError('User not found');
                return;
            }

            // Fetch proposals for the current user
            const response = await axios.get(`/api/proposals/user/${loggedUser.userId}`);
            setProposals(response.data);
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
                const response = await axios.get(`/api/proposals/${proposal.proposalId}`);
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
            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
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
                        My Procurement Proposals
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
                        Submit New Proposal
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
                        maxWidth: '100%',
                    }}
                >
                    <Table
                        sx={{
                            minWidth: 1500,
                        }}
                    >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell
                                    sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer' }}
                                    onClick={() => handleSort('proposalId')}
                                >
                                    Proposal ID
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
                                    Proposal Date
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

export default ProposalsList;
