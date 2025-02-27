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
  Button,

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
import ApproverSetAlerts from './ApproverSetAlerts';
import { sortData } from '../utils/utilities';
import { useTheme, useMediaQuery } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import CommentsDialog from './CommentsDialog';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [proposals, setProposals] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tabValue, setTabValue] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  // New state variables for dialog
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 6, totalItems: 0 });
  const [sortConfig, setSortConfig] = useState({ key: 'proposalDate', order: 'desc' });
  const [alertsDialogOpen, setAlertsDialogOpen] = useState(false);
  const [openCommentsDialog, setOpenCommentsDialog] = useState(false);
  const [commentProposalId, setCommentProposalId] = useState(null);




  useEffect(() => {
    fetchProposals();
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterProposals('pending'); // Filter proposals for the "Pending" status initially
  }, [proposals]);

  // const fetchProposals = async () => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem('user'));
  //     if (user && user.userId) {
  //       const response = await axios.get(`/api/proposals/approver/${user.userId}`);
  //       setProposals(response.data);
  //     } else {
  //       console.error('User not found in local storage');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching proposals:', error);
  //   }
  // };

  const fetchProposals = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        const response = await axios.get(`/api/proposals/approver/${user.userId}`);
        const fetchedProposals = response.data;

        // Add a flag for whether each proposal has comments
        // const withHistoryPromises = fetchedProposals.map(async (proposal) => {
        //   try {
        //     const histResp = await axios.get(`/api/proposals/${proposal.proposalId}/history`);
        //     proposal.hasHistory = histResp.data.length > 0;
        //   } catch (err) {
        //     console.error(`Error fetching history for proposal ${proposal.proposalId}`, err);
        //     proposal.hasHistory = false; // Default to false on error
        //   }
        //   return proposal;
        // });

        // Add a flag for whether each proposal has comments
        const withHistoryPromises = fetchedProposals.map(async (proposal) => {
          try {
            const histResp = await axios.get(`/api/proposals/${proposal.proposalId}/history`);
            proposal.hasHistory = histResp.data.length > 0;
          } catch (err) {
            console.error(`Error fetching history for proposal ${proposal.proposalId}`, err);
            proposal.hasHistory = false;
          }
          return proposal;
        });


        // Wait for all the comment checks to complete
        const proposalsWithHistory = await Promise.all(withHistoryPromises);
        setProposals(proposalsWithHistory);
      } else {
        console.error('User not found in local storage');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };


  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      order: prevConfig.key === key && prevConfig.order === 'asc' ? 'desc' : 'asc'
    }));
  };


  const handleOpenComments = (proposalId) => {
    setCommentProposalId(proposalId);
    setOpenCommentsDialog(true);
  };



  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
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
        `/api/proposals/${proposalId}/status`,
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

  const getUserEmailById = (userId) => {
    const user = users.find(u => u.userId === userId);
    return user ? user.email : 'unknown@email.com';
  };


  const getFilteredProposals = () => {
    let filtered = proposals;

    if (searchQuery) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.itemName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }


    switch (tabValue) {
      case 1: // Pending
        return filtered.filter((proposal) => proposal.status.toLowerCase() === 'pending');
      case 2: // Approved
        return filtered.filter((proposal) => proposal.status.toLowerCase() === 'approved');
      case 3: // Rejected
        return filtered.filter((proposal) => proposal.status.toLowerCase() === 'rejected');
      default: // All
        return filtered;
    }
  };

  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  // };
  // const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);
  const sortedProposals = sortData(getFilteredProposals(), sortConfig.key, sortConfig.order);

  const updateProposalStatus = (proposalId, newStatus) => {
    setProposals((prevProposals) =>
      prevProposals.map((proposal) =>
        proposal.proposalId === proposalId ? { ...proposal, status: newStatus } : proposal
      )
    );
  };




  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    const status = newValue === 0 ? 'ALL' :
      newValue === 1 ? 'pending' :
        newValue === 2 ? 'approved' :
          'rejected';
    filterProposals(status);
  };



  //   const filterProposals = (status) => {
  //     let filtered = proposals;
  //     if (status !== 'ALL') {
  //         filtered = filtered.filter((proposal) => 
  //             proposal.status.toLowerCase() === status.toLowerCase()
  //         );
  //     }
  //     setFilteredProposals(filtered);
  //     setPagination({ ...pagination, currentPage: 1, totalItems: filtered.length });
  // };

  const filterProposals = (status) => {
    let filtered = proposals;
    if (status !== 'ALL') {
      filtered = filtered.filter((proposal) =>
        proposal.status.toLowerCase() === status.toLowerCase()
      );
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

      {/* Example: a link or button to open the ApproverSetAlerts */}
      <Button
        variant="outlined"
        onClick={() => setAlertsDialogOpen(true)}
        sx={{
          borderColor: '#1a237e',
          color: '#1a237e',
          '&:hover': {
            backgroundColor: '#1a237e',
            color: 'white',
            borderColor: '#1a237e'
          },
          minWidth: '180px',
          height: '45px'
        }}
      >
        Set Alert Preferences
      </Button>



      <Box sx={{ p: 3, mt: 8 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by item name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            borderBottom: '1px solid #e0e0e0',
          }}
          TabIndicatorProps={{
            sx: { backgroundColor: '#1a237e' }, // Set the indicator color
          }}
          variant={isMobile ? 'scrollable' : 'fullWidth'} // Make tabs scrollable on mobile
          scrollButtons={isMobile ? 'auto' : false} // Show scroll buttons only on mobile
          allowScrollButtonsMobile
        >
          <Tab label={`All (${proposals.length})`} />
          <Tab label={`Pending (${proposals.filter((p) => p.status.toLowerCase() === 'pending').length})`} />
          <Tab label={`Approved (${proposals.filter((p) => p.status.toLowerCase() === 'approved').length})`} />
          <Tab label={`Rejected (${proposals.filter((p) => p.status.toLowerCase() === 'rejected').length})`} />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1a237e' }}>
                <TableCell
                  onClick={() => handleSort('proposalDate')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Requested Date {sortConfig.key === 'proposalDate' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('category')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Category {sortConfig.key === 'category' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>Requester</TableCell>
                <TableCell
                  onClick={() => handleSort('itemName')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Item {sortConfig.key === 'itemName' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('quantity')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Quantity {sortConfig.key === 'quantity' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('estimatedCost')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Est. Cost ($) {sortConfig.key === 'estimatedCost' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>Dept. Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell
                  onClick={() => handleSort('expectedDueDate')}
                  sx={{ color: 'white', cursor: 'pointer' }}
                >
                  Expected Due Date {sortConfig.key === 'expectedDueDate' ? (sortConfig.order === 'asc' ? '↑' : '↓') : ''}
                </TableCell>

                <TableCell sx={{ color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedProposals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((proposal) => (
                <TableRow key={proposal.proposalId} sx={{ backgroundColor: '#F7F6FE' }}>
                  <TableCell>{formatDate(proposal.proposalDate)}</TableCell>
                  <TableCell>{proposal.category}</TableCell>
                  {/* <TableCell>{getUserNameById(proposal.userId)}</TableCell> */}
                  <TableCell>
                    {proposal.userId ? (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${getUserEmailById(proposal.userId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: '#1a237e' }}
                      >
                        {getUserEmailById(proposal.userId)}
                      </a>
                    ) : '—'}
                  </TableCell>

                  <TableCell>{proposal.itemName}</TableCell>
                  <TableCell>{proposal.quantity}</TableCell>
                  <TableCell>{formatCurrency(proposal.estimatedCost)}</TableCell>
                  <TableCell>{getDepartmentNameById(proposal.departmentId)}</TableCell>
                  <TableCell>
                    <StyledChip
                      label={proposal.status.toLowerCase()}
                      status={proposal.status.toUpperCase()}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{proposal.expectedDueDate ? formatDate(proposal.expectedDueDate) : '—'}</TableCell>

                  <TableCell>
                    <IconButton size="small" sx={{ color: 'blue' }} onClick={() => handleViewProposal(proposal.proposalId)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenComments(proposal.proposalId)}
                      sx={{
                        backgroundColor: proposal.hasHistory ? '#386641' : '#85182a',
                        color: '#fff',
                        borderColor: 'transparent',
                        '&:hover': {
                          backgroundColor: proposal.hasHistory ? '#95d5b2' : '#f7a399'
                        },
                        padding: '8px', 
                        marginLeft: '4px', 
                      }}
                    >
                      <CommentIcon />
                    </IconButton>

                    {proposal.status.toLowerCase() === 'pending' && (
                      <>
                        <IconButton size="small" sx={{ color: 'red' }} onClick={() => handleDirectReject(proposal.proposalId)}>

                        </IconButton>
                        <IconButton size="small" sx={{ color: 'green' }} onClick={() => handleDirectApprove(proposal.proposalId)}>

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
            count={sortedProposals.length} // Use the filtered proposals length
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Dialog Component */}
      {/* <ApproverDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        proposalId={selectedProposalId}
        onStatusUpdate={(updatedProposal) => {
          setProposals(proposals.map(p =>
            p.proposalId === updatedProposal.proposalId ? updatedProposal : p
          ));
          handleDialogClose();
        }}
      /> */}
      <ApproverDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        proposalId={selectedProposalId}
        onStatusUpdate={(updatedProposal) => {
          updateProposalStatus(updatedProposal.proposalId, updatedProposal.status);
          handleDialogClose();
        }}
        currentStatus={proposals.find((p) => p.proposalId === selectedProposalId)?.status}
      />
      <ApproverSetAlerts
        open={alertsDialogOpen}
        onClose={() => setAlertsDialogOpen(false)}
      />

      <CommentsDialog
        open={openCommentsDialog}
        onClose={() => setOpenCommentsDialog(false)}
        proposalId={commentProposalId}
      />


    </Container>
  );
};

export default ApproverDashboard;