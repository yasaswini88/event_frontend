import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Paper,
    Tabs,
    Tab,
    AppBar,
    Toolbar,
    InputAdornment,
    Badge,
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
    NotificationsActive as NotificationIcon,
} from '@mui/icons-material';

// Sample data for demonstration
const SAMPLE_PROPOSALS = [
    {
        id: 1,
        requestDate: '2024-02-28',
        department: 'Computer Science',
        requester: 'John Smith',
        itemName: 'Dell Laptops',
        category: 'Equipment',
        quantity: 5,
        estimatedCost: 5000,
        status: 'Pending',
        priority: 'High',
    },
    {
        id: 2,
        requestDate: '2024-02-27',
        department: 'Physics',
        requester: 'Sarah Johnson',
        itemName: 'Lab Equipment',
        category: 'Supplies',
        quantity: 10,
        estimatedCost: 3000,
        status: 'Pending',
        priority: 'Medium',
    },
    {
        id: 3,
        requestDate: '2024-02-26',
        department: 'Mathematics',
        requester: 'Mike Brown',
        itemName: 'Projector',
        category: 'Equipment',
        quantity: 1,
        estimatedCost: 800,
        status: 'Approved',
        priority: 'Low',
    },
    {
        id: 4,
        requestDate: '2024-02-25',
        department: 'Chemistry',
        requester: 'Emily Davis',
        itemName: 'Chemical Supplies',
        category: 'Supplies',
        quantity: 20,
        estimatedCost: 1500,
        status: 'Rejected',
        priority: 'High',
    },
];

const EventDialog = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [comment, setComment] = useState('');
    const [proposals, setProposals] = useState(SAMPLE_PROPOSALS);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleViewDetails = (proposal) => {
        setSelectedProposal(proposal);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProposal(null);
        setComment('');
    };

    const handleStatusUpdate = (proposalId, newStatus) => {
        const updatedProposals = proposals.map(proposal =>
            proposal.id === proposalId ? { ...proposal, status: newStatus } : proposal
        );
        setProposals(updatedProposals);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'success';
            case 'Rejected':
                return 'error';
            case 'Pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'error';
            case 'Medium':
                return 'warning';
            case 'Low':
                return 'info';
            default:
                return 'default';
        }
    };

    const filteredProposals = proposals.filter(proposal => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            proposal.department.toLowerCase().includes(searchLower) ||
            proposal.requester.toLowerCase().includes(searchLower) ||
            proposal.itemName.toLowerCase().includes(searchLower);
        
        if (currentTab === 0) return matchesSearch;
        if (currentTab === 1) return matchesSearch && proposal.status === 'Pending';
        if (currentTab === 2) return matchesSearch && proposal.status === 'Approved';
        if (currentTab === 3) return matchesSearch && proposal.status === 'Rejected';
        return false;
    });

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="default">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Approver Dashboard
                    </Typography>
                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="error">
                            <NotificationIcon />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3 }}>
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label={`All (${proposals.length})`} />
                        <Tab label={`Pending (${proposals.filter(p => p.status === 'Pending').length})`} />
                        <Tab label={`Approved (${proposals.filter(p => p.status === 'Approved').length})`} />
                        <Tab label={`Rejected (${proposals.filter(p => p.status === 'Rejected').length})`} />
                    </Tabs>
                </Paper>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search by department, requester, or item name..."
                            value={searchTerm}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </CardContent>
                </Card>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Request Date</TableCell>
                                <TableCell>Department</TableCell>
                                <TableCell>Requester</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Est. Cost ($)</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProposals.map((proposal) => (
                                <TableRow key={proposal.id}>
                                    <TableCell>{proposal.requestDate}</TableCell>
                                    <TableCell>{proposal.department}</TableCell>
                                    <TableCell>{proposal.requester}</TableCell>
                                    <TableCell>{proposal.itemName}</TableCell>
                                    <TableCell align="right">{proposal.quantity}</TableCell>
                                    <TableCell align="right">
                                        {proposal.estimatedCost.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={proposal.priority}
                                            color={getPriorityColor(proposal.priority)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={proposal.status}
                                            color={getStatusColor(proposal.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewDetails(proposal)}
                                                color="primary"
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                            {proposal.status === 'Pending' && (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(proposal.id, 'Approved')}
                                                        color="success"
                                                    >
                                                        <ApproveIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleStatusUpdate(proposal.id, 'Rejected')}
                                                        color="error"
                                                    >
                                                        <RejectIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Proposal Details
                </DialogTitle>
                <DialogContent>
                    {selectedProposal && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Department: {selectedProposal.department}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Requester: {selectedProposal.requester}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Item: {selectedProposal.itemName}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Category: {selectedProposal.category}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Quantity: {selectedProposal.quantity}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Estimated Cost: ${selectedProposal.estimatedCost.toLocaleString()}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                Status: {selectedProposal.status}
                            </Typography>
                            <TextField
                                fullWidth
                                label="Add Comment"
                                multiline
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{ mt: 2 }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                    {selectedProposal?.status === 'Pending' && (
                        <>
                            <Button
                                onClick={() => {
                                    handleStatusUpdate(selectedProposal.id, 'Approved');
                                    handleCloseDialog();
                                }}
                                color="success"
                                variant="contained"
                            >
                                Approve
                            </Button>
                            <Button
                                onClick={() => {
                                    handleStatusUpdate(selectedProposal.id, 'Rejected');
                                    handleCloseDialog();
                                }}
                                color="error"
                                variant="contained"
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventDialog;