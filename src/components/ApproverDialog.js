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
  Divider,FormControl,InputLabel,Select,MenuItem,
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


  useEffect(() => {
    if (open && proposalId) {
      fetchProposalDetails();
      fetchApprovalHistory();
      fetchFundingSources();
    }
  }, [open, proposalId]);

  const fetchProposalDetails = async () => {
    try {
      const response = await axios.get(`/api/proposals/${proposalId}`);
      setProposal(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching proposal details');
      setLoading(false);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const response = await axios.get(`/api/proposals/${proposalId}/history`);
      // Remove duplicate status changes by keeping only unique combinations of oldStatus and newStatus
      const uniqueHistory = response.data.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.oldStatus === item.oldStatus && t.newStatus === item.newStatus
        ))
      );
      setApprovalHistory(uniqueHistory);
    } catch (err) {
      console.error('Error fetching approval history:', err);
    }
  };

  const fetchFundingSources = async () => {
    try {
      const response = await axios.get(`/api/funding-sources`); // Replace with your funding sources endpoint
      setFundingSources(response.data);
    } catch (err) {
      console.error('Error fetching funding sources:', err);
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
          comments: comment
        }
      });
  
      if (response.data) {
        onStatusUpdate(response.data);
        fetchApprovalHistory();
        setComment('');
        setFundingSourceId(''); // Reset funding source
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
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
          {/* <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Department</Typography>
            <Typography variant="body1" className="font-medium">{proposal.department?.deptName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Requester</Typography>
            <Typography variant="body1" className="font-medium">{proposal.user?.firstName} {proposal.user?.lastName}</Typography>
          </Grid> */}
          <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Item</Typography>
            <Typography variant="body1" className="font-medium">{proposal.itemName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Category</Typography>
            <Typography variant="body1" className="font-medium">{proposal.category}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Quantity</Typography>
            <Typography variant="body1" className="font-medium">{proposal.quantity}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" className="text-gray-600">Estimated Cost</Typography>
            <Typography variant="body1" className="font-medium">${proposal.estimatedCost}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" className="text-gray-600">Status</Typography>
            <Typography variant="body1" className="font-medium">{proposal.status}</Typography>
          </Grid>
          
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
        onChange={(e) => setComment(e.target.value)}
        className="mt-4"
      />
    </Grid>
  </>
)}

          {approvalHistory.length > 0 && proposal?.status?.toLowerCase() !== 'pending' &&(
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