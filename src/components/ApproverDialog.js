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
  Divider, FormControl, InputLabel, Select, MenuItem,
  Chip
} from '@mui/material';
import moment from 'moment-timezone';
import HistoryLogsTabs from './HistoryLogsTabs';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ApproverDialogProposalVersionDetails from './ApproverDialogProposalVersionDetails'; 

const ApproverDialog = ({ open, onClose, proposalId, onStatusUpdate, currentStatus }) => {
  const [proposal, setProposal] = useState(null);
  const [comment, setComment] = useState('');
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [fundingSourceId, setFundingSourceId] = useState('');

  const [facultyStats, setFacultyStats] = useState(null);
  const [facultyHistoryLogs, setFacultyHistoryLogs] = useState(null);
 
const [versions, setVersions] = useState([]);              // all older versions
const [selectedVersionId, setSelectedVersionId] = useState('ORIGINAL');


  const fetchFacultyStats = async (facultyUserId) => {
    try {
      // GET /api/proposals/faculty-stats/{facultyId}
      const response = await axios.get(`/api/proposals/faculty-stats/${facultyUserId}`);
      setFacultyStats(response.data);
    } catch (error) {
      console.error('Error fetching faculty stats:', error);
    }
  };

  const fetchFacultyHistoryLogs = async (facultyUserId) => {
    try {
      // GET /api/proposals/history-logs/faculty/{facultyId}
      const response = await axios.get(`/api/proposals/history-logs/faculty/${facultyUserId}`);
      setFacultyHistoryLogs(response.data);
      // The shape is { historylogs: [ { "2023": { ... } }, { "2024": { ... } }, ... ] }
    } catch (error) {
      console.error('Error fetching faculty history logs:', error);
    }
  };


  const fetchFundingSources = async () => {
    try {
      const response = await axios.get('/api/funding-sources');
      setFundingSources(response.data);
    } catch (err) {
      console.error('Error fetching funding sources:', err);
    }
  };


  useEffect(() => {
    if (open && proposalId) {
      // Clear old data so we don't see leftover comments from a previous proposal
      setProposal(null);
      setApprovalHistory([]);

      // Now fetch the new data
      fetchProposalDetails();
      fetchApprovalHistory();
      fetchFundingSources();
      fetchProposalVersions(proposalId);
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

      if (response.data.userId) {
        fetchFacultyStats(response.data.userId);
        fetchFacultyHistoryLogs(response.data.userId);
      }

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
      const actionDate = moment()
        .tz("America/New_York")
        .format("YYYY-MM-DDTHH:mm:ss");
      // Prepare request parameters
      const params = {
        currentUserId: user.userId,
        comments: comment, // Add comment
        actionDate: actionDate
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


    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };


  const fetchProposalVersions = async (id) => {
    try {
      // GET /api/proposals/<proposalId>/versions
      const response = await axios.get(`/api/proposals/${id}/versions`);
      // Sort versions in descending order (latest version first)
      const sorted = response.data.sort((a, b) => b.versionNumber - a.versionNumber);
      setVersions(sorted);
  
      // Automatically select the latest version
      if (sorted.length > 0) {
        setSelectedVersionId(sorted[0].id); // Select the latest version by default
      }
    } catch (err) {
      console.error('Error fetching proposal versions:', err);
    }
  };


  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
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

  // const versionToShow =
  //   selectedVersionId === 'ORIGINAL'
  //     ? proposal
  //     : versions.find((v) => v.id === selectedVersionId);

  const versionToShow = versions.find((v) => v.id === selectedVersionId) || null;


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="rounded-lg"
    >
      <DialogTitle className="flex justify-between items-center bg-gray-50 border-b">

        {/* <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton> */}
      </DialogTitle>

      <DialogContent className="p-6">

     
{versions.length > 0 && (
  <Box sx={{ 
    mb: 4,
    mt: 2,
    p: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <Typography variant="h6" sx={{ color: '#333' }}>
      Version Snapshot
    </Typography>
    <TextField
      select
      size="small"
      label="Select Version to View"
      value={selectedVersionId}
      onChange={(e) => setSelectedVersionId(e.target.value)}
      sx={{ 
        minWidth: 200,
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff',
        },
        '& .MuiInputLabel-root': {
          color: '#666',
        },
        '& .MuiSelect-select': {
          py: 1,
        }
      }}
    >
      {versions.map((ver) => (
        <MenuItem key={ver.id} value={ver.id}>
          Version {ver.versionNumber}
        </MenuItem>
      ))}
    </TextField>
  </Box>
)}

<ApproverDialogProposalVersionDetails data={versionToShow} />


        {facultyStats && (
          <Box
            sx={{
              backgroundColor: '#fef8e7',
              border: '1px solid #ddd',
              p: 2,
              borderRadius: 2,
              mb: 2
            }}
          >
            <Typography variant="subtitle2">
              {facultyStats.facultyName} has submitted {facultyStats.totalSubmittedCount} proposals
              {facultyStats.totalApprovedCount} approved worth
              ${facultyStats.totalApprovedAmount}.
            </Typography>
          </Box>
        )}

        <Typography variant="h6">Proposal Details</Typography>

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
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Approval History
              </Typography>
              <Box
                sx={{
                  maxHeight: 300, // Set max height
                  overflowY: 'auto', // Enable vertical scrolling
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {approvalHistory.map((history, index) => (
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
                    {/* Approval history item */}
                    {/* <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Comment by {history.approverName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDateTime(history.actionDate)}
                      </Typography>
                    </Box> */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Comment by {history.approverName || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDateTime(history.actionDate)}
                      </Typography>
                    </Box>

                    {/* Right side: Show the role chip */}
                    {history.approverRole && (
                      <Chip
                        label={history.approverRole}
                        color="primary"
                        size="small"
                        sx={{ alignSelf: 'center' }}
                      />
                    )}
                  </Box>
                  
                    {history.oldStatus !== history.newStatus && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Status changed from <strong>{history.oldStatus}</strong> to{' '}
                        <strong>{history.newStatus}</strong>
                      </Typography>
                    )}
                    {history.comments && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {history.comments}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          )}

          {facultyHistoryLogs && (
            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                History Logs
              </Typography>
              <HistoryLogsTabs data={facultyHistoryLogs} />
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