// ApproverDialogProposalVersionDetails.js
import React from 'react';
import { Box, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';

function ApproverDialogProposalVersionDetails({ data }) {
  if (!data) return null;  // or show some "Select version" message

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1">Version Snapshot</Typography>
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell><strong>Item Name</strong></TableCell>
            <TableCell>{data.itemName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell>{data.category}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell>{data.description}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Quantity</strong></TableCell>
            <TableCell>{data.quantity}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Estimated Cost</strong></TableCell>
            <TableCell>{data.estimatedCost}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Vendor Info</strong></TableCell>
            <TableCell>{data.vendorInfo}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Business Purpose</strong></TableCell>
            <TableCell>{data.businessPurpose}</TableCell>
          </TableRow>
          {/* <TableRow>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell>{data.status}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><strong>Proposal Date</strong></TableCell>
            <TableCell>{data.proposalDate}</TableCell>
          </TableRow> */}
          {/* etc. */}
        </TableBody>
      </Table>
    </Box>
  );
}

export default ApproverDialogProposalVersionDetails;
