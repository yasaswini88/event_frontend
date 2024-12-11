import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  TextField,
  Tab,
  Tabs,
  Container,
 
} from '@mui/material';
import { TablePagination } from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ApproverDialog from './ApproverDialog';
import AnalyticsDashboard from './AnalyticsDashboard';

const StyledChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: '16px',
  textTransform: 'capitalize',
  backgroundColor:
    status === 'PENDING'
      ? '#FFF4D4'
      : status === 'APPROVED'
      ? '#E6F4EA'
      : '#FADADD',
  color:
    status === 'PENDING'
      ? '#B7961D'
      : status === 'APPROVED'
      ? '#34A853'
      : '#DC3545',
})); 

const ApproverDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  // New state variables for dialog
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const[page, setPage] = useState(0);
  const[rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredProposals, setFilteredProposals] = useState([]);
const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 6, totalItems: 0 });
 

  useEffect(() => {
    fetchProposals();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchProposals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        const response = await axios.get(`http://174.129.138.174:8080/api/proposals/approver/${user.userId}`);
        setProposals(response.data);
      } else {
        console.error('User not found in local storage');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://174.129.138.174:8080/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://174.129.138.174:8080/api/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // New handlers for dialog
  const handleViewProposal = (proposalId) => {
    setSelectedProposalId(proposalId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedProposalId(null);
  };

  const handleStatusUpdate = async (proposalId, newStatus, comments) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.put(
        `http://174.129.138.174:8080/api/proposals/${proposalId}/status`,
        null,
        {
          params: {
            newStatus,
            approverId: user.userId,
            comments,
          },
        }
      );
      
      if (response.data) {
        // Update the local proposals state
        setProposals(proposals.map(p => 
          p.proposalId === proposalId ? response.data : p
        ));
        // Close the dialog
        handleDialogClose();
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  // Direct approve/reject handlers for buttons in the table
  const handleDirectApprove = async (proposalId) => {
    await handleStatusUpdate(proposalId, 'APPROVED', '');
  };

  const handleDirectReject = async (proposalId) => {
    await handleStatusUpdate(proposalId, 'REJECTED', '');
  };

  const getUserNameById = (userId) => {
    const user = users.find(user => user.userId === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const getDepartmentNameById = (departmentId) => {
    const department = departments.find((dept) => dept.deptId === departmentId);
    return department ? department.deptName : 'Unknown';
  };

  const getFilteredProposals = () => {
    let filtered = proposals;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          proposal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (tabValue) {
      case 1:
        return filtered.filter((proposal) => proposal.status === 'PENDING');
      case 2:
        return filtered.filter((proposal) => proposal.status === 'APPROVED');
      case 3:
        return filtered.filter((proposal) => proposal.status === 'REJECTED');
      default:
        return filtered;
    }
  };

  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  // };

 

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const status = newValue === 0 ? 'ALL' : newValue === 1 ? 'PENDING' : newValue === 2 ? 'APPROVED' : 'REJECTED';
    filterProposals(status);
  };



  const filterProposals = (status) => {
    let filtered = proposals;
    if (status !== 'ALL') {
      filtered = filtered.filter((proposal) => proposal.status === status);
    }
    setFilteredProposals(filtered);
    setPagination({ ...pagination, currentPage: 1, totalItems: filtered.length });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  

  return (
    <Container maxWidth="xl">
      
      <AnalyticsDashboard proposals={proposals} />

      <Box sx={{ p: 3, mt: 8 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
          TabIndicatorProps={{ sx: { backgroundColor: '#1a237e' } }}
        >
          <Tab label={`All(${proposals.length})`} />
          <Tab label={`Pending(${proposals.filter((p) => p.status === 'PENDING').length})`} />
          <Tab label={`Approved(${proposals.filter((p) => p.status === 'APPROVED').length})`} />
          <Tab label={`Rejected(${proposals.filter((p) => p.status === 'REJECTED').length})`} />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1a237e' }}>
                <TableCell sx={{ color: 'white' }}>Requested Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Category</TableCell>
                <TableCell sx={{ color: 'white' }}>Requester</TableCell>
                <TableCell sx={{ color: 'white' }}>Item</TableCell>
                <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
                <TableCell sx={{ color: 'white' }}>Est. Cost ($)</TableCell>
                <TableCell sx={{ color: 'white' }}>Dept. Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredProposals().map((proposal) => (
                <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                  <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                  <TableCell>{proposal.category}</TableCell>
                  <TableCell>{getUserNameById(proposal.userId)}</TableCell>
                  <TableCell>{proposal.itemName}</TableCell>
                  <TableCell>{proposal.quantity}</TableCell>
                  <TableCell>{formatCurrency(proposal.estimatedCost)}</TableCell>
                  <TableCell>{getDepartmentNameById(proposal.departmentId)}</TableCell>
                  <TableCell>
                    <StyledChip
                      label={proposal.status.toLowerCase()}
                      status={proposal.status}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'blue' }}
                      onClick={() => handleViewProposal(proposal.proposalId)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    {proposal.status === 'PENDING' && (
                      <>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'red' }}
                          onClick={() => handleDirectReject(proposal.proposalId)}
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          sx={{ color: 'green' }}
                          onClick={() => handleDirectApprove(proposal.proposalId)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={proposals.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Dialog Component */}
      <ApproverDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        proposalId={selectedProposalId}
        onStatusUpdate={(updatedProposal) => {
          setProposals(proposals.map(p => 
            p.proposalId === updatedProposal.proposalId ? updatedProposal : p
          ));
          handleDialogClose();
        }}
      />
    </Container>
  );
};

export default ApproverDashboard;