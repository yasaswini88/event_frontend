import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Paper for consistent styling
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100%',
    backgroundColor: '#f3e1dd',
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center', // Center-align text inside the cards
}));

// MetricCard Component
const MetricCard = ({ title, value, color }) => (
    <StyledPaper elevation={0}>
        <Typography variant="subtitle2" color="textSecondary">
            {title}
        </Typography>
        <Typography variant="h4" sx={{ color: color, mt: 1 }}>
            {value}
        </Typography>
    </StyledPaper>
);

const AnalyticsDashboard = ({ proposals }) => {
    // Calculate metrics with case-insensitivity for statuses
    const totalProposals = proposals.length;

    // Normalize statuses to lowercase for comparison
    const pending = proposals.filter((p) => p.status.toLowerCase() === 'pending').length;
    const approved = proposals.filter((p) => p.status.toLowerCase() === 'approved').length;
    const rejected = proposals.filter((p) => p.status.toLowerCase() === 'rejected').length;

    const totalApprovedBudget = proposals
        .filter((p) => p.status.toLowerCase() === 'approved')
        .reduce((sum, p) => sum + p.estimatedCost, 0);

    const approvalRate = totalProposals ? ((approved / totalProposals) * 100).toFixed(1) : 0;

    return (
        <Box sx={{ p: 3 }}>
            <Grid
                container
                spacing={2}
                justifyContent="center" // Center the cards horizontally
                alignItems="center" // Center the cards vertically
            >
                {/* Metric Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Total Proposals"
                        value={totalProposals}
                        color="#1a237e"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Pending" value={pending} color="#FFC107" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Approval Rate"
                        value={`${approvalRate}%`}
                        color="#34A853"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Total Approved Budget"
                        value={`$${totalApprovedBudget.toLocaleString()}`}
                        color="#1a237e"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
