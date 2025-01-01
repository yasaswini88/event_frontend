/**
 * AdminApprover component for managing proposals.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * return <AdminApprover />
 *
 * @description
 * This component fetches and displays a list of proposals, allowing the admin to view, edit, and delete proposals.
 * It also provides functionality to filter proposals by status and search by item name.
 *
 * @requires axios
 * @requires @mui/material
 * @requires @mui/icons-material
 * @requires react
 * @requires react-router-dom
 * @requires ../utils/utilities
 * @requires ./AdminApproverDialog
 *
 * @typedef {Object} Proposal
 * @property {number} proposalId - The ID of the proposal.
 * @property {string} proposalDate - The date of the proposal.
 * @property {number} userId - The ID of the user who created the proposal.
 * @property {string} itemName - The name of the item in the proposal.
 * @property {string} category - The category of the item.
 * @property {number} departmentId - The ID of the department associated with the proposal.
 * @property {number} estimatedCost - The estimated cost of the item.
 * @property {string} status - The status of the proposal (e.g., 'PENDING', 'APPROVED', 'REJECTED').
 *
 * @typedef {Object} User
 * @property {number} userId - The ID of the user.
 * @property {string} firstName - The first name of the user.
 *
 * @typedef {Object} Department
 * @property {number} deptId - The ID of the department.
 * @property {string} deptName - The name of the department.
 *
 * @typedef {Object} SortConfig
 * @property {string} key - The key to sort by.
 * @property {string} order - The order to sort ('asc' or 'desc').
 *
 * @typedef {Object} LocalStorageUser
 * @property {number} userId - The ID of the user stored in local storage.
 *
 * @state {Proposal[]} proposals - The list of proposals.
 * @state {User[]} users - The list of users.
 * @state {Department[]} departments - The list of departments.
 * @state {number} tabValue - The current tab value.
 * @state {string} searchQuery - The current search query.
 * @state {number} page - The current page number for pagination.
 * @state {number} rowsPerPage - The number of rows per page for pagination.
 * @state {boolean} editDialogOpen - Whether the edit dialog is open.
 * @state {Proposal|null} selectedProposal - The currently selected proposal for editing.
 * @state {boolean} deleteDialogOpen - Whether the delete dialog is open.
 * @state {number|null} proposalToDelete - The ID of the proposal to delete.
 * @state {boolean} viewDialogOpen - Whether the view dialog is open.
 * @state {number|null} selectedProposalId - The ID of the proposal to view.
 * @state {string|null} status - The status of the proposal.
 * @state {SortConfig} sortConfig - The current sort configuration.
 *
 * @function handleSort - Handles sorting of proposals.
 * @param {string} key - The key to sort by.
 *
 * @function handleViewProposal - Handles viewing a proposal.
 * @param {number} proposalId - The ID of the proposal to view.
 *
 * @function fetchProposals - Fetches the list of proposals from the API.
 *
 * @function fetchUsers - Fetches the list of users from the API.
 *
 * @function fetchDepartments - Fetches the list of departments from the API.
 *
 * @function handleEditProposal - Handles editing a proposal.
 * @param {Proposal} proposal - The proposal to edit.
 *
 * @function handleDeleteProposal - Handles deleting a proposal.
 * @param {number} proposalId - The ID of the proposal to delete.
 *
 * @function handleConfirmDelete - Confirms the deletion of a proposal.
 *
 * @function handleStatusUpdate - Updates the status of a proposal.
 * @param {number} proposalId - The ID of the proposal to update.
 * @param {string} newStatus - The new status of the proposal.
 *
 * @function handleSaveEdit - Saves the edited proposal.
 *
 * @function handleTabChange - Handles changing the tab.
 * @param {object} event - The event object.
 * @param {number} newValue - The new tab value.
 *
 * @function getFilteredProposals - Gets the filtered list of proposals based on the search query and tab value.
 * @returns {Proposal[]} The filtered list of proposals.
 *
 * @function formatDate - Formats a date string.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 *
 * @function formatCurrency - Formats a currency amount.
 * @param {number} amount - The amount to format.
 * @returns {string} The formatted currency string.
 */
import React, { useState, useEffect } from 'react';
import api from '../utils/api';

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
import { Link } from 'react-router-dom';
import { sortData } from '../utils/utilities';
import { useTheme, useMediaQuery } from '@mui/material';



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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    const [status, setStatus] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'proposalId', order: 'desc' });
    const handleSort = (key) => {
        setSortConfig((prevConfig) => ({
            key,
            order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc',
        }));
    };


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
            const response = await api.get('/api/proposals');
            setProposals(response.data);
        } catch (error) {
            console.error('Error fetching proposals:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments');
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
            await api.delete(`/api/proposals/${proposalToDelete}`);
            fetchProposals(); // Refresh the list
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting proposal:', error);
        }
    };

    const handleStatusUpdate = async (proposalId, newStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await api.put(
                `/api/proposals/${proposalId}/status`,
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
            await api.put(`/api/proposals/${selectedProposal.proposalId}`, selectedProposal);
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
                    proposal.itemName.toLowerCase().includes(searchQuery.toLowerCase()) 
            );
        }

        switch (tabValue) {
            case 1:
                return filtered.filter((proposal) => proposal.status.toLowerCase() === 'PENDING'.toLowerCase());
            case 2:
                return filtered.filter((proposal) => proposal.status === 'APPROVED');
            case 3:
                return filtered.filter((proposal) => proposal.status === 'REJECTED');
            default:
                return filtered;
        }
    };
    const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);

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

    console.log({ viewDialogOpen });

    return (
        <Container maxWidth="xl">
            <Box sx={{ p: 3, mt: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Link to="/admin-dashboard" style={{ textDecoration: 'none', color: '#1a73e8', fontWeight: 'bold' }}>
                        &larr;  Admin Dashboard
                    </Link>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', textAlign: 'center', flexGrow: 1 }}>
                        Approver Management
                    </Typography>
                </Box>


                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by item name "
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 3 }}
                />

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
                    <Tab label={`All(${proposals.length})`} />
                    <Tab label={`Pending(${proposals.filter((p) => p.status.toLowerCase() === 'PENDING'.toLowerCase()).length})`} />
                    <Tab label={`Approved(${proposals.filter((p) => p.status === 'APPROVED').length})`} />
                    <Tab label={`Rejected(${proposals.filter((p) => p.status === 'REJECTED').length})`} />
                </Tabs>

                <TableContainer component={Paper}
                    sx={{
                        mb: 4,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        overflowX: isMobile ? 'auto' : 'visible', // Enable horizontal scrolling on mobile
                    }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1a237e' }}>
                                <TableCell
                                    onClick={() => handleSort('proposalId')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    ID {sortConfig.key === 'proposalId' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('proposalDate')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    Date {sortConfig.key === 'proposalDate' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Requester</TableCell>
                                <TableCell sx={{ color: 'white' }}>Approver</TableCell>

                                <TableCell
                                    onClick={() => handleSort('itemName')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    Item {sortConfig.key === 'itemName' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell
                                    onClick={() => handleSort('category')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    Category {sortConfig.key === 'category' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Department</TableCell>
                                <TableCell
                                    onClick={() => handleSort('estimatedCost')}
                                    sx={{ color: 'white', cursor: 'pointer' }}
                                >
                                    Cost {sortConfig.key === 'estimatedCost' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                                </TableCell>
                                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedProposals
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((proposal) => (
                                    <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                                        <TableCell>{proposal.proposalId}</TableCell>
                                        <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                                        <TableCell>
                                            {users.find(u => u.userId === proposal.userId)?.firstName || 'Unknown'}
                                        </TableCell>
                                        <TableCell>
                                            {
                                                users.find((u) => u.userId === proposal.currentApproverId)
                                                    ?.firstName || 'N/A'
                                            }
                                        </TableCell>

                                        <TableCell>{proposal.itemName}</TableCell>
                                        <TableCell>{proposal.category}</TableCell>
                                        <TableCell>
                                            {departments.find(d => d.deptId === proposal.departmentId)?.deptName || 'Unknown'}
                                        </TableCell>
                                        <TableCell>{formatCurrency(proposal.estimatedCost)}</TableCell>
                                        <TableCell>
                                            <StyledChip
                                                label={proposal.status.toLowerCase()}
                                                status={proposal.status.toUpperCase()}
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
                                            {/* <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProposal(proposal.proposalId)}
                    >
                        <DeleteIcon />
                    </IconButton> */}
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
                    fullScreen={isMobile}
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