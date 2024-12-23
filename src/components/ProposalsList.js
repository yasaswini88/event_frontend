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
    DialogActions, IconButton,
    Link,
    Alert,
    Snackbar
} from '@mui/material';
import { TablePagination } from '@mui/material';
import { Close as CloseIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ProposalForm from './ProposalForm';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { sortData } from '../utils/utilities';
import { Tabs, Tab } from '@mui/material';
import FacultyMetrics from './FacultyMetrics';


const ProposalsList = () => {
    const [proposals, setProposals] = useState([]); // Store proposals in state
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProposal, setEditingProposal] = useState(null); // Stores the details of the proposal being edited. 
    //null indicates no editing.
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); //Controls whether the delete confirmation dialog is open.
    const [proposalToDelete, setProposalToDelete] = useState(null);  //Stores the proposalId of the proposal to be deleted. 
    const [error, setError] = useState(''); //Stores error message  if any error occurs while fetching proposals. 
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    }); //Stores the snackbar message to be displayed. //severity is used to set the color of the snackbar.//open is used to control the visibility of the snackbar.//message is used to set the message to be displayed in the snackbar.
    const [page, setPage] = useState(0); // Current page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [sortConfig, setSortConfig] = useState({ key: 'proposalId', order: 'asc' });

    const [tabValue, setTabValue] = useState(0);
    const token = localStorage.getItem('token');


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleSort = (key) => {
        setSortConfig((prevConfig) => {
            const newConfig = {
                key,
                order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
            };
            console.log("Sorting key:", key, "Order:", newConfig.order); // Debug log
            return newConfig;
        });
    };


    const getFilteredProposals = () => {
        let filtered = proposals;

        switch (tabValue) {
            case 1: // Pending
                return filtered.filter((proposal) => proposal.status.toLowerCase() === 'pending');
            case 2: // Approved 
                return filtered.filter((proposal) => proposal.status.toLowerCase() === 'approved');
            case 3: // Rejected
                return filtered.filter((proposal) => proposal.status.toLowerCase() === 'rejected');
            default: // All
                return filtered;
        }
    };

    const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);



    useEffect(() => {
        fetchProposals();
    }, []); // Calls fetchProposals when the component loads to fetch the proposals.

    const fetchProposals = async () => {
        try {
            const token = localStorage.getItem('token'); // get the JWT token from local storage
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            if (!loggedUser?.userId) {
                setError('User not found');
                return;
            } //Fetch the logged-in user from local storage. If the user is not found, set an error message.

            const response = await axios.get(
                `/api/proposals/user/${loggedUser.userId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              ); //Fetch proposals for the logged-in user using the userId.
            setProposals(response.data); //Store the fetched proposals in state.
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
                // Fetch proposal details using proposalId
                const response = await axios.get(
                       `/api/proposals/${proposal.proposalId}`,
                       { headers: { Authorization: `Bearer ${token}` } }
                      );
                setEditingProposal(response.data); // Store the fetched proposal in state
            } else {
                setEditingProposal(null); // For new proposal
            }
            setOpenDialog(true); // Open dialog
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
        setOpenDialog(false); // Close dialog
        setEditingProposal(null); // Reset editingProposal state
        fetchProposals();   // Fetch proposals
    };

    const handleOpenDeleteDialog = (proposalId) => {
        setProposalToDelete(proposalId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/proposals/${proposalToDelete}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                   );
            setSnackbar({
                open: true,
                message: 'Proposal deleted successfully',
                severity: 'success',
            });
            fetchProposals(); // Refresh proposals after successful deletion
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

    const handleDelete = (proposalId) => {
        handleOpenDeleteDialog(proposalId);
    };


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isStatusApproved = (status) => {
        return status?.toLowerCase() === 'approved';
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
                }}>
                <Typography variant={isMobile ? 'h5' : 'h4'}
                    sx={{ fontWeight: 'bold', color: '#333' }}>
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
                        sx: { backgroundColor: '#1a237e' }, // Set the indicator color
                    }}
                    variant={isMobile ? 'scrollable' : 'fullWidth'} // Make tabs scrollable on mobile
                    scrollButtons={isMobile ? 'auto' : false} // Show scroll buttons only on mobile
                    allowScrollButtonsMobile
                >
                    <Tab label={`All (${proposals.length})`} />
                    <Tab label={`Pending (${proposals.filter(p => p.status.toLowerCase() === 'pending').length})`} />
                    <Tab label={`Approved (${proposals.filter(p => p.status.toLowerCase() === 'approved').length})`} />
                    <Tab label={`Rejected (${proposals.filter(p => p.status.toLowerCase() === 'rejected').length})`} />
                </Tabs>
                <TableContainer
                    component={Paper}
                    sx={{
                        mb: 4,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto', // Allow horizontal scrolling if needed
                        maxWidth: '100%', // Make the table span full width
                    }}>
                    <Table
                        sx={{
                            minWidth: 1500, // Adjusted minWidth for better alignment
                        }}
                    >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell onClick={() => handleSort('proposalId')} sx={{ color: 'white', cursor: 'pointer' }}>
                                    Proposal ID {sortConfig.key === 'proposalId' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSort('itemName')} sx={{ color: 'white', cursor: 'pointer' }}>
                                    Item Name {sortConfig.key === 'itemName' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                                <TableCell onClick={() => handleSort('quantity')} sx={{ color: 'white', cursor: 'pointer' }}>
                                    Quantity {sortConfig.key === 'quantity' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell onClick={() => handleSort('estimatedCost')} sx={{ color: 'white', cursor: 'pointer' }}>
                                    Estimated Cost {sortConfig.key === 'estimatedCost' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                <TableCell onClick={() => handleSort('proposalDate')} sx={{ color: 'white', cursor: 'pointer' }}>
                                    Proposal Date {sortConfig.key === 'proposalDate' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedProposals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((proposal) => (
                                <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                                    <TableCell>{proposal.proposalId}</TableCell>
                                    <TableCell>{proposal.itemName}</TableCell>
                                    <TableCell>{proposal.category}</TableCell>
                                    <TableCell>{proposal.description}</TableCell>
                                    <TableCell>{proposal.quantity}</TableCell>
                                    <TableCell>${proposal.estimatedCost.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                backgroundColor:
                                                    proposal.status.toLowerCase() === 'approved' ? '#e8f5e9' :
                                                        proposal.status.toLowerCase() === 'pending' ? '#fff3e0' :
                                                            proposal.status.toLowerCase() === 'rejected' ? '#ffebee' : '#f5f5f5',
                                                color:
                                                    proposal.status.toLowerCase() === 'approved' ? '#2e7d32' :
                                                        proposal.status.toLowerCase() === 'pending' ? '#e65100' :
                                                            proposal.status.toLowerCase() === 'rejected' ? '#c62828' : '#333',
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {proposal.status}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(proposal)}
                                                disabled={proposal.status !== 'Pending'}
                                                sx={{
                                                    opacity: proposal.status !== 'Pending' ? 0.5 : 1,
                                                    '&:hover': {
                                                        backgroundColor: proposal.status !== 'Pending' ? 'transparent' : undefined
                                                    }
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            {/* <IconButton
                                                color="error"
                                                onClick={() => handleDelete(proposal.proposalId)}
                                                disabled={proposal.status !== 'Pending'}
                                            >
                                                <DeleteIcon />
                                            </IconButton> */}

                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
                        component="div"
                        count={getFilteredProposals().length}  // Updated this line
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
                    />
                </TableContainer>

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