import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Grid,
    IconButton,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const AdminApproverDialog = ({ open, onClose, proposalId, onStatusUpdate }) => {
    const [proposal, setProposal] = useState(null);
    const [comment, setComment] = useState('');
    const [approvalHistory, setApprovalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fundingSources, setFundingSources] = useState([]);
    const [fundingSourceId, setFundingSourceId] = useState('');
    const [editedProposal, setEditedProposal] = useState(null);

    useEffect(() => {
        if (open && proposalId) {
            fetchProposalDetails();
            fetchApprovalHistory();
            fetchFundingSources();
        }
    }, [open, proposalId]);

    const fetchProposalDetails = async () => {
        try {
            const response = await axios.get(`http://174.129.138.174:8080/api/proposals/${proposalId}`);
            const proposalData = response.data;
            setProposal(proposalData);
            setEditedProposal(proposalData);
            // Set initial status from the existing proposal
            if (proposalData.fundingSourceId) {
                setFundingSourceId(proposalData.fundingSourceId);
            } else {
                setFundingSourceId(52); // Default to 'None' if not set
            }
            setLoading(false);
        } catch (err) {
            setError('Error fetching proposal details');
            setLoading(false);
        }
    };

    const fetchApprovalHistory = async () => {
        try {
            const response = await axios.get(`http://174.129.138.174:8080/api/proposals/${proposalId}/history`);
            setApprovalHistory(response.data);
        } catch (err) {
            console.error('Error fetching approval history:', err);
        }
    };

    const fetchFundingSources = async () => {
        try {
            const response = await axios.get(`http://174.129.138.174:8080/api/funding-sources`);
            setFundingSources(response.data);
        } catch (err) {
            console.error('Error fetching funding sources:', err);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.put(
                `http://174.129.138.174:8080/api/proposals/${proposalId}/status`,
                null,
                {
                    params: {
                        newStatus,
                        approverId: user.userId,
                        fundingSourceId: fundingSourceId || 1,
                        comments: comment
                    },
                }
            );

            if (response.data) {
                onStatusUpdate(response.data);
                fetchApprovalHistory();
                setComment('');
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleSaveChanges = async () => {
        try {

            // Create an updated proposal object with all changes
            const updatedProposal = {
                ...editedProposal,
                fundingSourceId: fundingSourceId,
                status: editedProposal.status
            };

            // First update the basic proposal details
            await axios.put(`http://174.129.138.174:8080/api/proposals/${proposalId}`, editedProposal);

            // Then update the status if there's a comment
            if (comment.trim()) {
                await handleStatusUpdate(editedProposal.status);
            }

            onStatusUpdate(editedProposal);
        } catch (err) {
            console.error('Error saving changes:', err);
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (loading || !editedProposal) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#1a237e',
                color: 'white'
            }}>
                <Typography variant="h6">Proposal Details (Admin View)</Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Current Status
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {editedProposal.status}
                            </Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Current Funding Source
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {fundingSources.find(f => f.sourceId === fundingSourceId)?.sourceName || 'Not assigned'}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Proposal Date
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {new Date(editedProposal.proposalDate).toLocaleDateString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Item Name"
                            value={editedProposal.itemName}
                            onChange={(e) => setEditedProposal({ ...editedProposal, itemName: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Category"
                            value={editedProposal.category}
                            onChange={(e) => setEditedProposal({ ...editedProposal, category: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Quantity"
                            type="number"
                            value={editedProposal.quantity}
                            onChange={(e) => setEditedProposal({ ...editedProposal, quantity: parseInt(e.target.value) })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Estimated Cost"
                            type="number"
                            value={editedProposal.estimatedCost}
                            onChange={(e) => setEditedProposal({ ...editedProposal, estimatedCost: parseFloat(e.target.value) })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={editedProposal.status || ''}
                                label="Status"
                                onChange={(e) => setEditedProposal({ ...editedProposal, status: e.target.value })}
                            >
                                <MenuItem value="PENDING">Pending</MenuItem>
                                <MenuItem value="APPROVED">Approved</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Funding Source</InputLabel>
                            <Select
                                value={fundingSourceId || ''}
                                label="Funding Source"
                                onChange={(e) => setFundingSourceId(e.target.value)}
                            >
                                {fundingSources.map((source) => (
                                    <MenuItem key={source.sourceId} value={source.sourceId}>
                                        {source.sourceName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        {editedProposal.lastComment && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Current Comment:
                                </Typography>
                                <Typography variant="body1">
                                    {editedProposal.lastComment}
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="New Comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </Grid>

                    {approvalHistory.length > 0 && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 2 }}>Approval History</Typography>
                            {approvalHistory.map((history, index) => (
                                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        Status changed from {history.oldStatus} to {history.newStatus}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDateTime(history.actionDate)}
                                    </Typography>
                                    {history.comments && (
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Comment: {history.comments}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveChanges} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminApproverDialog;