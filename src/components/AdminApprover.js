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
    IconButton,
    Chip,
    TextField,
    Tab,
    Tabs,
    Container,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { TablePagination } from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AdminApproverDialog from './AdminApproverDialog';

const StyledChip = styled(Chip)(({ theme, status }) => ({
    borderRadius: '16px',
    textTransform: 'capitalize',
    backgroundColor:
        status === 'PENDING'
            ? '#FFF4D4'
            : status === 'APPROVED'
                ? '#E6F4EA'
                : '#FADADD',
    color:
        status === 'PENDING'
            ? '#B7961D'
            : status === 'APPROVED'
                ? '#34A853'
                : '#DC3545',
}));

const AdminApprover = () => {
    const [proposals, setProposals] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Edit Dialog States
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [proposalToDelete, setProposalToDelete] = useState(null);

    // View Dialog States (Add these)
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState(null);

    const handleViewProposal = (proposalId) => {
        setSelectedProposalId(proposalId);
        setViewDialogOpen(true);
    };

    useEffect(() => {
        fetchProposals();
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchProposals = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/proposals');
            setProposals(response.data);
        } catch (error) {
            console.error('Error fetching proposals:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleEditProposal = (proposal) => {
        setSelectedProposal(proposal);
        setEditDialogOpen(true);
    };

    const handleDeleteProposal = (proposalId) => {
        setProposalToDelete(proposalId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://174.129.138.174:8080/api/proposals/${proposalToDelete}`);
            fetchProposals(); // Refresh the list
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting proposal:', error);
        }
    };

    const handleStatusUpdate = async (proposalId, newStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await axios.put(
                `http://174.129.138.174:8080/api/proposals/${proposalId}/status`,
                null,
                {
                    params: {
                        newStatus,
                        approverId: user.userId,
                        comments: 'Updated by admin',
                        fundingSourceId: 1 // Add appropriate funding source handling
                    },
                }
            );
            fetchProposals();
        } catch (error) {
            console.error('Error updating proposal status:', error);
        }
    };

    const handleSaveEdit = async () => {
        try {
            await axios.put(`http://174.129.138.174:8080/api/proposals/${selectedProposal.proposalId}`, selectedProposal);
            fetchProposals();
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Error updating proposal:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const getFilteredProposals = () => {
        let filtered = proposals;

        if (searchQuery) {
            filtered = filtered.filter(
                (proposal) =>
                    proposal.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    proposal.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        switch (tabValue) {
            case 1:
                return filtered.filter((proposal) => proposal.status === 'PENDING');
            case 2:
                return filtered.filter((proposal) => proposal.status === 'APPROVED');
            case 3:
                return filtered.filter((proposal) => proposal.status === 'REJECTED');
            default:
                return filtered;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ p: 3, mt: 8 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
                    Admin Approver Dashboard
                </Typography>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by item name or description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 3 }}
                />

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{ mb: 3 }}
                    TabIndicatorProps={{ sx: { backgroundColor: '#1a237e' } }}
                >
                    <Tab label={`All(${proposals.length})`} />
                    <Tab label={`Pending(${proposals.filter((p) => p.status === 'PENDING').length})`} />
                    <Tab label={`Approved(${proposals.filter((p) => p.status === 'APPROVED').length})`} />
                    <Tab label={`Rejected(${proposals.filter((p) => p.status === 'REJECTED').length})`} />
                </Tabs>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell sx={{ color: 'white' }}>ID</TableCell>
                                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white' }}>Requester</TableCell>
                                <TableCell sx={{ color: 'white' }}>Item</TableCell>
                                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                                <TableCell sx={{ color: 'white' }}>Cost</TableCell>
                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getFilteredProposals()
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((proposal) => (
                                    <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                                        <TableCell>{proposal.proposalId}</TableCell>
                                        <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                                        <TableCell>{users.find(u => u.userId === proposal.userId)?.firstName || 'Unknown'}</TableCell>
                                        <TableCell>{proposal.itemName}</TableCell>
                                        <TableCell>{proposal.category}</TableCell>
                                        <TableCell>
                                            {departments.find(d => d.deptId === proposal.departmentId)?.deptName || 'Unknown'}
                                        </TableCell>
                                        <TableCell>{formatCurrency(proposal.estimatedCost)}</TableCell>
                                        <TableCell>
                                            <StyledChip
                                                label={proposal.status.toLowerCase()}
                                                status={proposal.status}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleViewProposal(proposal.proposalId)}
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteProposal(proposal.proposalId)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={getFilteredProposals().length}
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
                <AdminApproverDialog
                    open={viewDialogOpen}
                    onClose={() => setViewDialogOpen(false)}
                    proposalId={selectedProposalId}
                    onStatusUpdate={(updatedProposal) => {
                        fetchProposals();
                        setViewDialogOpen(false);
                    }}
                />
            </Box>
        </Container>
    );
};

export default AdminApprover;