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
    TablePagination,
    Tab,
    Tabs
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { sortData } from '../utils/utilities';
import { useTheme, useMediaQuery } from '@mui/material';

const Procurements = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ========== 1) State variables ==========

    const [procurements, setProcurements] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    
    // For editing:
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);

    // For file uploads & docs:
    const [fileToUpload, setFileToUpload] = useState(null);       // NEW
    const [attachedDocs, setAttachedDocs] = useState([]);         // NEW

    // For deleting:
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);

    // Sorting & tab
    const [sortConfig, setSortConfig] = useState({ key: 'proposalId', order: 'desc' });
    const [tabValue, setTabValue] = useState(0);

    // Snackbar
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

    // ================================
    // 2) Fetch the main proposals
    // ================================
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

    // ================================
    // 3) Sorting, tabs, filters
    // ================================
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getFilteredProcurements = () => {
        let filtered = procurements;
        switch (tabValue) {
            case 1:
                return filtered.filter((proc) => proc.status.toLowerCase() === 'pending');
            case 2:
                return filtered.filter((proc) => proc.status === 'APPROVED');
            case 3:
                return filtered.filter((proc) => proc.status === 'REJECTED');
            default:
                return filtered; // All statuses
        }
    };

    // ================================
    // 4) Edit logic (dialog open/close)
    // ================================
    const handleEdit = async (proposal) => {
        setSelectedProposal(proposal);
        setFileToUpload(null);       // clear any previous file
        setAttachedDocs([]);         // clear old attachments

        // 4a) fetch previously attached docs
        try {
            const docsRes = await axios.get(`/api/documents/proposal/${proposal.proposalId}`);
            if (Array.isArray(docsRes.data)) {
                setAttachedDocs(docsRes.data);
            }
        } catch (err) {
            console.error('Error fetching attached docs:', err);
        }

        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setSelectedProposal(null);
        setFileToUpload(null);
        setAttachedDocs([]);
    };

    // ================================
    // 5) Edit "SAVE" => Update fields + optional file upload
    // ================================
    const handleEditSave = async () => {
        try {
            // Update the existing proposal fields
            await axios.put(`/api/proposals/${selectedProposal.proposalId}`, selectedProposal);

            // If user selected a file to upload
            if (fileToUpload) {
                // 1) find the userId (some app might store user in localStorage)
                const loggedUser = JSON.parse(localStorage.getItem('user'));
                const userId = loggedUser ? loggedUser.userId : null;
                if (!userId) {
                    handleSnackbar('User not logged in', 'error');
                    return;
                }

                // 2) formData approach
                const formData = new FormData();
                formData.append('file', fileToUpload);

                await axios.post(
                    `/api/documents/upload?proposalId=${selectedProposal.proposalId}&userId=${userId}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            handleSnackbar('Proposal updated successfully', 'success');
            fetchProcurements();
            handleEditClose();

        } catch (err) {
            console.error('Error updating proposal:', err);
            handleSnackbar('Error updating proposal', 'error');
        }
    };

    // ================================
    // 6) Download a file
    // ================================
    const handleDownloadFile = async (docId) => {
        try {
            const response = await axios.get(`/api/documents/${docId}/download`);
            const presignedUrl = response.data; 
            window.open(presignedUrl, '_blank');
        } catch (err) {
            console.error('Error downloading file:', err);
            handleSnackbar('Error downloading file', 'error');
        }
    };

    // ================================
    // 7) Delete logic
    // ================================
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

    // ================================
    // 8) Misc
    // ================================
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

    return (
        <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header / Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Link to="/admin-dashboard" style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: 'bold' }}>
                        &larr; Admin Dashboard
                    </Link>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center', flexGrow: 1 }}>
                        Procurement Management
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ mb: 3, borderBottom: '1px solid #e0e0e0' }}
                    TabIndicatorProps={{ sx: { backgroundColor: '#1a237e' } }}
                    variant={isMobile ? 'scrollable' : 'fullWidth'}
                    scrollButtons={isMobile ? 'auto' : false}
                    allowScrollButtonsMobile
                >
                    <Tab label={`All (${procurements.length})`} />
                    <Tab label={`Pending (${procurements.filter((p) => p.status.toLowerCase() === 'pending').length})`} />
                    <Tab label={`Approved (${procurements.filter((p) => p.status === 'APPROVED').length})`} />
                    <Tab label={`Rejected (${procurements.filter((p) => p.status === 'REJECTED').length})`} />
                </Tabs>

                {/* Table */}
                <TableContainer
                    component={Paper}
                    sx={{
                        mb: 4,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto',
                        maxWidth: '100%',
                    }}
                >
                    <Table sx={{ minWidth: 1500 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell
                                    onClick={() => handleSort('proposalId')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '10%' }}
                                >
                                    Proposal ID {sortConfig.key === 'proposalId' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('itemName')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '15%' }}
                                >
                                    Item Name {sortConfig.key === 'itemName' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('category')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '15%' }}
                                >
                                    Category {sortConfig.key === 'category' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white', width: '20%' }}>Description</TableCell>
                                <TableCell
                                    onClick={() => handleSort('quantity')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '10%' }}
                                >
                                    Quantity {sortConfig.key === 'quantity' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('estimatedCost')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '10%' }}
                                >
                                    Cost {sortConfig.key === 'estimatedCost' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white', width: '10%' }}>Status</TableCell>
                                <TableCell
                                    onClick={() => handleSort('proposalDate')}
                                    sx={{ color: 'white', cursor: 'pointer', width: '10%' }}
                                >
                                    Date {sortConfig.key === 'proposalDate' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white', width: '10%' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortData(getFilteredProcurements(), sortConfig.key, sortConfig.order)
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
                                            <Box
                                                sx={{
                                                    backgroundColor: statusColors[proposal.status]?.bg || '#f5f5f5',
                                                    color: statusColors[proposal.status]?.text || '#000',
                                                    p: 1,
                                                    borderRadius: 1,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {proposal.status?.toUpperCase()}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton color="primary" onClick={() => handleEdit(proposal)}>
                                                    <EditIcon />
                                                </IconButton>
                                                {/* If you want delete: */}
                                                {/*
                                                <IconButton color="error" onClick={() => handleDelete(proposal.proposalId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                                */}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={getFilteredProcurements().length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>

                {/* ================================
                    Edit Dialog
                   ================================ */}
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

                            {/* ==============
                                Attach File
                               ============== */}
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ fontWeight: 'bold' }}>Attach File (Optional):</Typography>
                                <input
                                    type="file"
                                    onChange={(e) => setFileToUpload(e.target.files[0])}
                                    accept="application/pdf,image/*"
                                />
                            </Box>

                            {/* ==============
                                Previously Attached Docs
                               ============== */}
                            {attachedDocs.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>Previously Attached Files:</Typography>
                                    {attachedDocs.map((doc) => (
                                        <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <Typography>{doc.fileName}</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleDownloadFile(doc.id)}
                                            >
                                                Download
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleEditClose}>Cancel</Button>
                        <Button onClick={handleEditSave} variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ================================
                    Delete Confirmation Dialog
                   ================================ */}
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

                {/* ================================
                    Snackbar
                   ================================ */}
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
