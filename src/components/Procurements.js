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
    FormControl,
    InputLabel,
    Select,
    TablePagination
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Procurements = () => {
    const [procurements, setProcurements] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const statusColors = {
        'PENDING': { bg: '#fff3e0', text: '#e65100' },
        'APPROVED': { bg: '#e8f5e9', text: '#2e7d32' },
        'REJECTED': { bg: '#ffebee', text: '#c62828' }
    };

    useEffect(() => {
        fetchProcurements();
    }, []);

    const fetchProcurements = async () => {
        try {
            const response = await axios.get('/api/proposals');
            setProcurements(response.data);
        } catch (err) {
            console.error('Error fetching procurements:', err);
            setError('Error fetching procurements');
            handleSnackbar('Error fetching procurements', 'error');
        }
    };

    const handleStatusChange = (event) => {
        setFilterStatus(event.target.value);
        setPage(0);
    };

    const handleEdit = (proposal) => {
        setSelectedProposal(proposal);
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setSelectedProposal(null);
    };

    const handleEditSave = async () => {
        try {
            await axios.put(`/api/proposals/${selectedProposal.proposalId}`, selectedProposal);
            handleSnackbar('Proposal updated successfully', 'success');
            fetchProcurements();
            handleEditClose();
        } catch (err) {
            console.error('Error updating proposal:', err);
            handleSnackbar('Error updating proposal', 'error');
        }
    };

    const handleDelete = (proposalId) => {
        setProposalToDelete(proposalId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/api/proposals/${proposalToDelete}`);
            handleSnackbar('Proposal deleted successfully', 'success');
            fetchProcurements();
            setDeleteDialogOpen(false);
        } catch (err) {
            console.error('Error deleting proposal:', err);
            handleSnackbar('Error deleting proposal', 'error');
        }
    };

    const handleSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
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

    const filteredProcurements = procurements.filter(proc => 
        filterStatus ? proc.status === filterStatus : true
    );

    return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
                    Procurement Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Status Filter */}
                <FormControl sx={{ mb: 3, minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={filterStatus}
                        label="Filter by Status"
                        onChange={handleStatusChange}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="APPROVED">Approved</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                    </Select>
                </FormControl>

                <TableContainer component={Paper} sx={{ mb: 4, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell sx={{ color: 'white' }}>Proposal ID</TableCell>
                                <TableCell sx={{ color: 'white' }}>Item Name</TableCell>
                                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                                <TableCell sx={{ color: 'white' }}>Description</TableCell>
                                <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                                <TableCell sx={{ color: 'white' }}>Cost</TableCell>
                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProcurements
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((proposal) => (
                                    <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                                        <TableCell>{proposal.proposalId}</TableCell>
                                        <TableCell>{proposal.itemName}</TableCell>
                                        <TableCell>{proposal.category}</TableCell>
                                        <TableCell>{proposal.description}</TableCell>
                                        <TableCell>{proposal.quantity}</TableCell>
                                        <TableCell>${proposal.estimatedCost.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Box sx={{
                                                backgroundColor: statusColors[proposal.status]?.bg || '#f5f5f5',
                                                color: statusColors[proposal.status]?.text || '#000',
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: 'center'
                                            }}>
                                                {proposal.status}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEdit(proposal)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(proposal.proposalId)}
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
                        count={filteredProcurements.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onClose={handleEditClose}>
                    <DialogTitle>Edit Proposal</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, minWidth: 400 }}>
                            <TextField
                                label="Item Name"
                                value={selectedProposal?.itemName || ''}
                                onChange={(e) => setSelectedProposal({
                                    ...selectedProposal,
                                    itemName: e.target.value
                                })}
                                fullWidth
                            />
                            <TextField
                                label="Category"
                                value={selectedProposal?.category || ''}
                                onChange={(e) => setSelectedProposal({
                                    ...selectedProposal,
                                    category: e.target.value
                                })}
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                value={selectedProposal?.description || ''}
                                onChange={(e) => setSelectedProposal({
                                    ...selectedProposal,
                                    description: e.target.value
                                })}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label="Quantity"
                                type="number"
                                value={selectedProposal?.quantity || ''}
                                onChange={(e) => setSelectedProposal({
                                    ...selectedProposal,
                                    quantity: parseInt(e.target.value)
                                })}
                                fullWidth
                            />
                            <TextField
                                label="Estimated Cost"
                                type="number"
                                value={selectedProposal?.estimatedCost || ''}
                                onChange={(e) => setSelectedProposal({
                                    ...selectedProposal,
                                    estimatedCost: parseFloat(e.target.value)
                                })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={selectedProposal?.status || ''}
                                    label="Status"
                                    onChange={(e) => setSelectedProposal({
                                        ...selectedProposal,
                                        status: e.target.value
                                    })}
                                >
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="APPROVED">Approved</MenuItem>
                                    <MenuItem value="REJECTED">Rejected</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose}>Cancel</Button>
                        <Button onClick={handleEditSave} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this proposal?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleDeleteConfirm} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
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

export default Procurements;