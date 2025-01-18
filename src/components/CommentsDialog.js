import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from '@mui/material';

import axios from 'axios';
import moment from 'moment-timezone';

const CommentsDialog = ({
    open,
    onClose,
    proposalId,
    onSnackbar,  // optional callback from the parent
}) => {
    const [proposalHistory, setProposalHistory] = useState([]);
    const [commentText, setCommentText] = useState('');

    /**
     * Fetch the proposal history whenever:
     *  - the dialog is opened (open === true)
     *  - or the proposalId changes
     */
    useEffect(() => {
        if (open && proposalId) {
            fetchHistory(proposalId);
        }
    }, [open, proposalId]);

    const fetchHistory = async (pId) => {
        try {
            const response = await axios.get(`/api/proposals/${pId}/history`);
            setProposalHistory(response.data);
        } catch (err) {
            console.error('Error fetching approval history:', err);
            // If you want to notify user:
            if (onSnackbar) {
                onSnackbar({
                    open: true,
                    message: 'No comments found for this proposal',
                    severity: 'error',
                });
            }
        }
    };

    const handleAddComment = async () => {
        try {
            if (!commentText.trim()) return;

            const loggedUser = JSON.parse(localStorage.getItem('user'));
            const currentUserId = loggedUser.userId;

            const actionDate = moment().tz('America/New_York').format('YYYY-MM-DDTHH:mm:ss');

            // POST/PUT to backend to add comment
            await axios.put(`/api/proposals/${proposalId}/comment`, null, {
                params: {
                    currentUserId,
                    comments: commentText,
                    actionDate,
                },
            });

            // Clear the input
            setCommentText('');

            // Refresh the history so the new comment is visible
            await fetchHistory(proposalId);

            // Show success message
            if (onSnackbar) {
                onSnackbar({
                    open: true,
                    message: 'Comment added successfully!',
                    severity: 'success',
                });
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            if (onSnackbar) {
                onSnackbar({
                    open: true,
                    message: 'Failed to add comment.',
                    severity: 'error',
                });
            }
        }
    };

    function formatDateTimeEST(dateTimeString) {
        if (!dateTimeString) return '';
        return new Date(dateTimeString).toLocaleString('en-US', {
            timeZone: 'America/New_York',
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Proposal History (Comments)</DialogTitle>
            <DialogContent>
                {proposalHistory.length === 0 ? (
                    <Typography>No history found.</Typography>
                ) : (
                    <Box
                        sx={{
                            maxHeight: 300,
                            overflowY: 'auto',
                            p: 2,
                            backgroundColor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                        }}
                    >
                        {proposalHistory.map((entry, index) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 3,
                                    p: 2,
                                    backgroundColor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                }}
                            >
                                {/* Header Row: Approver + Date + Role Chip */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 'bold', color: 'primary.main' }}
                                        >
                                            Comment by {entry.approverName || 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {formatDateTimeEST(entry.actionDate)}
                                        </Typography>
                                    </Box>
                                    {entry.approverRole && (
                                        <Chip
                                            label={entry.approverRole}
                                            color="primary"
                                            size="small"
                                            sx={{ alignSelf: 'center' }}
                                        />
                                    )}
                                </Box>

                                {/* Possible status change */}
                                {entry.oldStatus !== entry.newStatus && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Status changed from <strong>{entry.oldStatus}</strong> to <strong>{entry.newStatus}</strong>
                                    </Typography>
                                )}

                                {/* Comment text */}
                                {entry.comments && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        {entry.comments}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Box>
                )}

                {/* TextField to Add New Comment */}
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
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommentsDialog;
