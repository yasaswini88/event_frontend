import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Paper component
const MetricCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100%',
    backgroundColor: '#f3e1dd',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
}));

const FacultyMetrics = ({ proposals }) => {
    // Calculate metrics
    const totalProposals = proposals.length;
    const pendingProposals = proposals.filter(p => p.status.toLowerCase() === 'pending').length;
    const approvedProposals = proposals.filter(p => p.status.toLowerCase() === 'approved').length;
    const rejectedProposals = proposals.filter(p => p.status.toLowerCase() === 'rejected').length;
    
    // Calculate total budget and approved budget
    const totalRequestedBudget = proposals.reduce((sum, p) => sum + p.estimatedCost, 0);
    const approvedBudget = proposals
        .filter(p => p.status.toLowerCase() === 'approved')
        .reduce((sum, p) => sum + p.estimatedCost, 0);
    
    // Calculate approval rate
    const approvalRate = totalProposals ? ((approvedProposals / totalProposals) * 100).toFixed(1) : 0;

    const metrics = [
        {
            title: "Total Proposals",
            value: totalProposals,
            color: '#1a237e'
        },
        {
            title: "Pending Proposals",
            value: pendingProposals,
            color: '#B7961D'
        },
        {
            title: "Approval Rate",
            value: `${approvalRate}%`,
            color: '#34A853'
        },
        {
            title: "Total Approved Budget",
            value: `$${approvedBudget.toLocaleString()}`,
            color: '#1a237e'
        }
    ];

    return (
        <Box sx={{ width: '100%', mb: 3 }}>
            <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MetricCard elevation={0}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                {metric.title}
                            </Typography>
                            <Typography variant="h4" sx={{ color: metric.color, fontWeight: 'medium' }}>
                                {metric.value}
                            </Typography>
                        </MetricCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FacultyMetrics;