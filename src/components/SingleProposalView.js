import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
    Chip,
    Grid,
    Paper
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    AccessTime as TimeIcon,
    Category as CategoryIcon,
    Description as DescriptionIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Apartment as DepartmentIcon
} from '@mui/icons-material';
import ApproverDialog from './ApproverDialog';


const SingleProposalView = () => {
    const { proposalId } = useParams();
    const navigate = useNavigate();
    const [proposal, setProposal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Right under your existing useState lines:
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProposalId, setSelectedProposalId] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));



    // useEffect(() => {
    //     const fetchProposal = async () => {
    //         try {
    //             const response = await axios.get(`/api/proposals/${proposalId}`);
    //             setProposal(response.data);
    //         } catch (err) {
    //             if (err.response && err.response.status === 403) {
    //                 setError('You do not have permission to view this proposal.');
    //             } else {
    //                 setError('Failed to load proposal details.');
    //             }
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchProposal();
    // }, [proposalId]);

    useEffect(() => {
        const fetchProposal = async () => {
          try {
            // If user object is { userId: 52, ... }:
            const currentUserId = user.userId;
      
            // CORRECT: use backticks around the string
            const response = await axios.get(
              `/api/proposals/${proposalId}`,   // note the backticks ``
              { params: { currentUserId } }     // pass the user ID
            );
      
            setProposal(response.data);
          } catch (err) {
            if (err.response && err.response.status === 403) {
              setError('You do not have permission to view this proposal.');
            } else {
              setError('Failed to load proposal details.');
            }
          } finally {
            setLoading(false);
          }
        };
        fetchProposal();
      }, [proposalId, user]);
      
    

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!proposal) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">No proposal found.</Alert>
            </Box>
        );
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 3 }}>
            <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
                <Card sx={{ mb: 3, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', border: '1px solid #dcdcdc' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Proposal #{proposal.proposalId}
                            </Typography>
                            <Chip
                                label={proposal.status}
                                color={getStatusColor(proposal.status)}
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CategoryIcon sx={{ mr: 1 }} /> Item Details
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Item Name:</strong> {proposal.itemName}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Category:</strong> {proposal.category}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Quantity:</strong> {proposal.quantity}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DescriptionIcon sx={{ mr: 1 }} /> Description
                                    </Typography>
                                    <Typography variant="body1">
                                        {proposal.description}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <MoneyIcon sx={{ mr: 1 }} /> Financial Details
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Estimated Cost:</strong> {formatCurrency(proposal.estimatedCost)}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TimeIcon sx={{ mr: 1 }} /> Timeline
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Proposal Date:</strong> {formatDate(proposal.proposalDate)}
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                        <BusinessIcon sx={{ mr: 1 }} /> Business Information
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        <strong>Business Purpose:</strong> {proposal.businessPurpose}
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Vendor Information:</strong> {proposal.vendorInfo || 'Not provided'}
                                    </Typography>
                                </Paper>
                            </Grid>


                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>

                            {user?.roles?.roleId === 3 && ( // Show button only if user is Approver
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setSelectedProposalId(proposal.proposalId);
                                        setDialogOpen(true);
                                    }}
                                    sx={{
                                        backgroundColor: '#1a237e',
                                        '&:hover': {
                                            backgroundColor: '#0d1b5e',
                                        }
                                    }}
                                >
                                    Review Proposal
                                </Button>
                            )}

                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <ApproverDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                proposalId={selectedProposalId}
                onStatusUpdate={(updatedProposal) => {
                    // If the proposal changes status, etc., update your local state so we see new info:
                    setProposal(updatedProposal);
                    setDialogOpen(false);
                }}
            />

        </Box>
    );
};

export default SingleProposalView;