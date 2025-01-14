/**
 * AdminApproverDialog component for displaying and managing proposal details.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Function to call when the dialog is closed.
 * @param {number} props.proposalId - The ID of the proposal to display.
 * @param {function} props.onStatusUpdate - Function to call when the proposal status is updated.
 * @param {string} props.status - The current status of the proposal.
 * @returns {JSX.Element|null} The rendered component.
 */
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
    MenuItem, Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import HistoryLogsTabs from './HistoryLogsTabs';


const AdminApproverDialog = ({ open, onClose, proposalId, onStatusUpdate, status }) => {
    const [proposal, setProposal] = useState(null);
    const [comment, setComment] = useState('');
    const [approvalHistory, setApprovalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fundingSources, setFundingSources] = useState([]);
    const [fundingSourceId, setFundingSourceId] = useState('');
    const [editedProposal, setEditedProposal] = useState(null);
    const [fundingSourceLoading, setFundingSourceLoading] = useState(true);
    const [fundingSourceError, setFundingSourceError] = useState(null);
    const [facultyStats, setFacultyStats] = useState(null);
    const [facultyHistoryLogs, setFacultyHistoryLogs] = useState(null);





    useEffect(() => {
        if (open && proposalId) {
            const loadData = async () => {
                try {
                    // Load funding sources first
                    await fetchFundingSources();
                    // Then load proposal details and history
                    await fetchProposalDetails();
                    // await fetchApprovalHistory();
                } catch (err) {
                    console.error('Error loading dialog data:', err);
                }
            };
            loadData();
        }
    }, [open, proposalId]);


    const fetchFacultyStats = async (facultyUserId) => {
        try {
            // Same endpoint: /api/proposals/faculty-stats/{facultyId}
            const response = await axios.get(`/api/proposals/faculty-stats/${facultyUserId}`);
            setFacultyStats(response.data);
        } catch (error) {
            console.error('Error fetching faculty stats:', error);
        }
    };

    const fetchFacultyHistoryLogs = async (facultyUserId) => {
        try {
            const response = await axios.get(`/api/proposals/history-logs/faculty/${facultyUserId}`);
            setFacultyHistoryLogs(response.data);
            // shape: { historylogs: [ { "2023": {...} }, { "2024": {...} } ] }
        } catch (error) {
            console.error('Error fetching faculty history logs:', error);
        }
    };

    // In the fetchProposalDetails function, update it to properly set the initial funding source:
    const fetchProposalDetails = async () => {
        try {
            // First get the proposal details
            const user = JSON.parse(localStorage.getItem('user'));
            // Pass currentUserId
            const proposalResponse = await axios.get(`/api/proposals/${proposalId}`, {
                params: { currentUserId: user.userId }
            });
            // const proposalResponse = await axios.get(`/api/proposals/${proposalId}`);
            const proposalData = proposalResponse.data;



            let historyData = [];
            // Then get the approval history
            if (typeof proposalData.status === 'string' && proposalData.status.toLowerCase() != 'pending') {
                const historyResponse = await axios.get(`/api/proposals/${proposalId}/history`);
                historyData = historyResponse.data;
                setApprovalHistory(historyData);

            }



            // Get the most recent funding source from history
            const mostRecentHistory = historyData[0]; // Assuming history is ordered by date desc
            const currentFundingSourceId = mostRecentHistory ? mostRecentHistory.fundingSourceId : 52; // Default to 52 (None) if no history

            setProposal(proposalData);
            setEditedProposal(proposalData);
            setFundingSourceId(currentFundingSourceId);
            setLoading(false);

            console.log('Current funding source ID:', currentFundingSourceId);

            if (proposalData.userId) {
                fetchFacultyStats(proposalData.userId);
                await fetchFacultyHistoryLogs(proposalData.userId);
            }

        } catch (err) {
            console.error('Error fetching proposal details:', err);
            setError('Error fetching proposal details');
            setLoading(false);
        }
    };

    const fetchApprovalHistory = async () => {
        try {
            const response = await axios.get(`/api/proposals/${proposalId}/history`);
            setApprovalHistory(response.data);
        } catch (err) {
            console.error('Error fetching approval history:', err);
        }
    };

    const fetchFundingSources = async () => {
        try {
            setFundingSourceLoading(true);
            setFundingSourceError(null);
            const response = await axios.get(`/api/funding-sources`);
            setFundingSources(response.data);
        } catch (err) {
            console.error('Error fetching funding sources:', err);
            setFundingSourceError('Failed to load funding sources');
        } finally {
            setFundingSourceLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.put(
                `/api/proposals/${proposalId}/status`,
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




    const handleClose = () => {
        onClose();
        setProposal(null);
        setComment('');
        setApprovalHistory([]);
        setLoading(true);
        setError(null);
        setFundingSources([]);
        setFundingSourceId('');
        setEditedProposal(null);
        setFundingSourceLoading(true);
        setFundingSourceError(null);
        setFacultyStats(null);


    };

    const handleSaveChanges = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));

            if (!fundingSourceId || !editedProposal.status) {
                throw new Error('Please select both a funding source and status');
            }

            // First update the proposal status with funding source
            const statusResponse = await axios.put(
                `/api/proposals/${proposalId}/status`,
                null,
                {
                    params: {
                        newStatus: editedProposal.status,
                        approverId: user.userId,
                        fundingSourceId: fundingSourceId,
                        comments: comment.trim() || null
                    },
                }
            );

            if (statusResponse.data) {
                // Then update other proposal details
                const proposalResponse = await axios.put(
                    `/api/proposals/${proposalId}`,
                    editedProposal
                );

                if (proposalResponse.data) {
                    await fetchProposalDetails();
                    await fetchApprovalHistory();
                    onStatusUpdate(proposalResponse.data);
                    handleClose();
                }
            }
        } catch (err) {
            console.error('Error saving changes:', err);
            setError(err.message || 'Error saving changes');
        }
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleDateString(); // Returns only the date in 'MM/DD/YYYY' format
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
            onClose={handleClose}
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
                <Typography variant="h6">Request Details (Admin View)</Typography>
                <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {facultyStats && (
                    <Box sx={{
                        backgroundColor: '#fef8e7',
                        border: '1px solid #ddd',
                        p: 2,
                        borderRadius: 2,
                        mb: 2
                    }}>
                        <Typography variant="subtitle2">
                            {facultyStats.facultyName} has submitted {facultyStats.totalSubmittedCount} proposals
                            {facultyStats.totalApprovedCount} approved worth {formatCurrency(facultyStats.totalApprovedAmount)}.
                        </Typography>
                    </Box>
                )}

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
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: fundingSourceId ? 'inherit' : 'text.secondary' }}>
                                {fundingSources.find(f => f.sourceId === fundingSourceId)?.sourceName || 'Not assigned'}
                            </Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Request Date
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
                        {/* <FormControl fullWidth>
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
                        </FormControl> */}
                        <FormControl fullWidth>
                            <InputLabel>Funding Source</InputLabel>
                            <Select
                                value={fundingSourceId}
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
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                setComment(inputValue.length <= 500 ? inputValue : inputValue.slice(0, 500));
                            }}
                            inputProps={{ maxLength: 500 }}
                            helperText={`${comment.length}/500`}
                        />
                    </Grid>

                    {/* {approvalHistory.length > 0 && (
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
                    )} */}

                    {approvalHistory.length > 0 && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" sx={{ mb: 2 }}>Approval History</Typography>
                            {approvalHistory.map((history, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        bgcolor: '#f5f5f5',
                                        borderRadius: 1,
                                    }}
                                >
                                    {/* HEADLINE: "Comment by {Name}" with date and role */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 'bold', color: 'primary.main' }}
                                            >
                                                Comment by {history.approverName || 'Unknown'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                {formatDateTime(history.actionDate)}
                                            </Typography>
                                        </Box>

                                        {/* Right side: role Chip */}
                                        {history.approverRole && (
                                            <Chip
                                                label={history.approverRole}
                                                color="primary"
                                                size="small"
                                                sx={{ alignSelf: 'center' }}
                                            />
                                        )}
                                    </Box>

                                    {/* THEN: status changes, comment text, etc. */}
                                    <Typography variant="body2">
                                        Status changed from {history.oldStatus} to {history.newStatus}
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
                {facultyHistoryLogs && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            History Logs
                        </Typography>
                        <HistoryLogsTabs data={facultyHistoryLogs} />
                    </Box>
                )}

            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSaveChanges} variant="contained" color="primary">
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdminApproverDialog;