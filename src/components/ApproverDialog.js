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
  Divider, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ApproverDialog = ({ open, onClose, proposalId, onStatusUpdate, currentStatus }) => {
  const [proposal, setProposal] = useState(null);
  const [comment, setComment] = useState('');
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [fundingSourceId, setFundingSourceId] = useState('');

  const fetchFundingSources = async () => {
    try {
      const response = await axios.get('/api/funding-sources');
      setFundingSources(response.data);
    } catch (err) {
      console.error('Error fetching funding sources:', err);
    }
  };

  // useEffect(() => {
  //   if (open && proposalId) {
  //     fetchProposalDetails();
  //     fetchApprovalHistory();
  //     fetchFundingSources();
  //   }
  // }, [open, proposalId]);

  useEffect(() => {
    if (open && proposalId) {
      // Clear old data so we don't see leftover comments from a previous proposal
      setProposal(null);
      setApprovalHistory([]);
  
      // Now fetch the new data
      fetchProposalDetails();
      fetchApprovalHistory();
      fetchFundingSources();
    }
  }, [open, proposalId]);
  

  const fetchProposalDetails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`/api/proposals/${proposalId}`, {
        params: { currentUserId: user.userId }
      });
      // const response = await axios.get(`/api/proposals/${proposalId}`);
      setProposal(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching proposal details');
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`/api/proposals/${proposalId}/history`, {
        params: { currentUserId: user.userId }
      });
  
      setApprovalHistory(response.data);
    } catch (err) {
      console.error('Error fetching approval history:', err);
    }
  };
  


  const handleStatusUpdate = async (newStatus) => {
    try {
      if (!fundingSourceId) {
        console.error('Funding source is required');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.put(`/api/proposals/${proposalId}/status`, null, {
        params: {
          newStatus: newStatus,
          approverId: user.userId,
          fundingSourceId: fundingSourceId, // Include the funding source ID
          comments: comment,
        },
      });

      if (response.data) {
        // Notify the parent component about the status update
        if (onStatusUpdate) {
          onStatusUpdate(response.data); // Send updated proposal data
        }
        fetchApprovalHistory();
        setComment('');
        setFundingSourceId(''); // Reset funding source
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddComment = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));

      // Prepare request parameters
      const params = {
        approverId: user.userId,
        comments: comment, // Add comment
      };

      // Include funding source only if selected
      if (fundingSourceId) {
        params.fundingSourceId = fundingSourceId;
      }

      // Send comment request
      await axios.put(`/api/proposals/${proposalId}/comment`, null, {
        params,
      });

      // Optionally refetch the proposal to update the history
      await fetchApprovalHistory();

      // Clear out comment box and funding source
      setComment('');
      setFundingSourceId('');

      // Close the dialog
      onClose();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };




  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleDateString(); // Returns only the date in 'MM/DD/YYYY' format
  };


  const renderStatusUpdateButtons = () => {
    if (proposal?.status && proposal.status.toLowerCase() === 'pending') {
      return (
        <>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleStatusUpdate('APPROVED')}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleStatusUpdate('REJECTED')}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleAddComment()}
          >
            Send Comment
          </Button>

        </>
      );
    }
    return null;
  };

  if (loading) return null;
  if (error) return null;
  if (!proposal) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="rounded-lg"
    >
      <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">
        <Typography variant="h6">Proposal Details</Typography>
        {/* <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton> */}
      </DialogTitle>

      <DialogContent className="p-6">
        <Grid container spacing={3}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Existing fields */}
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Item</Typography>
                <Typography variant="body1" className="font-medium">{proposal.itemName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Category</Typography>
                <Typography variant="body1" className="font-medium">{proposal.category}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" className="text-gray-600">Item Description</Typography>
                <Typography variant="body1" className="font-medium">{proposal.description}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Quantity</Typography>
                <Typography variant="body1" className="font-medium">{proposal.quantity}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Estimated Cost</Typography>
                <Typography variant="body1" className="font-medium">${proposal.estimatedCost}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Vendor Info</Typography>
                <Typography variant="body1" className="font-medium">{proposal.vendorInfo}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Business Purpose</Typography>
                <Typography variant="body1" className="font-medium">{proposal.businessPurpose}</Typography>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Department</Typography>
                <Typography variant="body1" className="font-medium">{getDepartmentNameById(proposal.departmentId)}</Typography>
              </Grid> */}
              <Grid item xs={6}>
                <Typography variant="subtitle2" className="text-gray-600">Status</Typography>
                <Typography variant="body1" className="font-medium">{proposal.status}</Typography>
              </Grid>
            </Grid>
          </DialogContent>


          {proposal.status && proposal.status.toLowerCase() === 'pending' && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth className="mt-4">
                  <InputLabel>Funding Source</InputLabel>
                  <Select
                    value={fundingSourceId}
                    onChange={(e) => setFundingSourceId(e.target.value)}
                    label="Funding Source"
                  >
                    {fundingSources.map((source) => (
                      <MenuItem key={source.sourceId} value={source.sourceId}>
                        {source.sourceName} {/* Adjust based on the properties of your funding source */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Add Comment"
                  value={comment}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setComment(inputValue.length <= 500 ? inputValue : inputValue.slice(0, 500));
                  }}
                  className="mt-4"
                  inputProps={{ maxLength: 500 }}
                  helperText={`${comment.length}/500`}
                />

              </Grid>
            </>
          )}

          {approvalHistory.length > 0 && (
            <Grid item xs={12}>
              <Divider className="my-4" />
              <Typography variant="h6" className="mb-3">Approval History</Typography>
              {approvalHistory.map((history, index) => (
                <Box key={index} className="mb-3 p-3 bg-gray-50 rounded">
                  <Typography variant="body2">
                    Status changed from {history.oldStatus} to {history.newStatus}
                  </Typography>
                  <Typography variant="caption" className="text-gray-600">
                    {formatDateTime(history.actionDate)}
                  </Typography>
                  {history.comments && (
                    <Typography variant="body2" className="mt-1">
                      Comment: {history.comments}
                    </Typography>
                  )}
                </Box>
              ))}
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={onClose} variant="outlined" className="mr-2">
          Close
        </Button>
        {renderStatusUpdateButtons()}
      </DialogActions>
    </Dialog>
  );
};

export default ApproverDialog;