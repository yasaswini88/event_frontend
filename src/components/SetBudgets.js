import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Card,
  CardContent,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

const SetBudgets = () => {
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    monthlyBudget: 10000
  });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    fetchApprovers();
  }, []);

  const fetchApprovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/users');
      const allUsers = res.data;
      const approversOnly = allUsers.filter(u =>
        u.roles && u.roles.roleName.toLowerCase() === 'approver'
      );
      setApprovers(approversOnly);
    } catch (error) {
      console.error('Error fetching approvers:', error);
      setError('Failed to fetch approvers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // const handleOpenDialog = (approver) => {
  //   setSelectedApprover(approver);
  //   setDialogOpen(true);
  // };

  const handleOpenDialog = async (approver) => {
    setSelectedApprover(approver);

    // 1) By default, set to blank or default
    setBudgetForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      monthlyBudget: 10000
    });

    // 2) Attempt to fetch existing ApproverBudget from the backend
    try {
      const admin = JSON.parse(localStorage.getItem('user'));
      if (!admin || !admin.userId) return;

      // e.g. let's fix month/year to the same defaults in your form
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      // (or store them in state so the user can pick them, up to you)

      const res = await axios.get('/api/budget/approver-preferences', {
        params: {
          approverId: approver.userId,
          year,
          month
        }
      });
      const data = res.data; // an ApproverBudget or "new ApproverBudget"

      if (data && data.monthlyBudget) {
        // 3) Then set budgetForm with the fetched monthlyBudget
        setBudgetForm({
          year: data.year || year,
          month: data.month || month,
          monthlyBudget: data.monthlyBudget
        });
      }
    } catch (e) {
      console.error('Failed to fetch existing budget:', e);
    }

    // 4) Finally open the dialog
    setDialogOpen(true);
  };


  const handleCloseDialog = () => {
    setSelectedApprover(null);
    setDialogOpen(false);
    setBudgetForm({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      monthlyBudget: 10000
    });
  };

  const handleBudgetFormChange = (field, value) => {
    setBudgetForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSetBudget = async () => {
    if (!selectedApprover) return;

    setLoadingStates(prev => ({ ...prev, [selectedApprover.userId]: true }));
    try {
      const admin = JSON.parse(localStorage.getItem('user'));
      const adminId = admin ? admin.userId : null;

      if (!adminId) {
        throw new Error('Admin ID not found');
      }

      await axios.post('/api/budget/admin-set-budget', null, {
        params: {
          adminId: adminId,
          approverId: selectedApprover.userId,
          monthlyBudget: budgetForm.monthlyBudget,
          year: budgetForm.year,
          month: budgetForm.month
        }
      });

      setSnackbar({
        open: true,
        message: `Budget set for ${selectedApprover.firstName} ${selectedApprover.lastName} - ${months.find(m => m.value === budgetForm.month)?.label} ${budgetForm.year} to $${budgetForm.monthlyBudget.toLocaleString()}`,
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Error setting budget:', error);
      setSnackbar({
        open: true,
        message: 'Failed to set budget. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [selectedApprover.userId]: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const validateInput = () => {
    const { year, month, monthlyBudget } = budgetForm;
    if (monthlyBudget < 0) return false;
    if (year < 2000 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    return true;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Set Monthly Budgets for Approvers
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Paper elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Approver ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Loading approvers...
                    </TableCell>
                  </TableRow>
                ) : approvers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No approvers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  approvers.map((approver) => (
                    <TableRow key={approver.userId} hover>
                      <TableCell>{approver.userId}</TableCell>
                      <TableCell>{approver.firstName} {approver.lastName}</TableCell>
                      <TableCell>{approver.email}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          onClick={() => handleOpenDialog(approver)}
                          disabled={loadingStates[approver.userId]}
                          sx={{ minWidth: 100 }}
                        >
                          {loadingStates[approver.userId] ? (
                            <>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Setting...
                            </>
                          ) : (
                            "Set Budget"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Budget Setting Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Set Budget for {selectedApprover ? `${selectedApprover.firstName} ${selectedApprover.lastName}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={budgetForm.year}
              onChange={(e) => handleBudgetFormChange('year', parseInt(e.target.value))}
              inputProps={{
                min: "2000",
                max: "2100"
              }}
            />
            <TextField
              fullWidth
              select
              label="Month"
              value={budgetForm.month}
              onChange={(e) => handleBudgetFormChange('month', parseInt(e.target.value))}
            >
              {months.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Monthly Budget"
              type="number"
              value={budgetForm.monthlyBudget}
              onChange={(e) => handleBudgetFormChange('monthlyBudget', parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                min: "0",
                step: "100"
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>  {/* Add padding to DialogActions */}
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: '#6B7280',
              borderColor: '#6B7280',
              '&:hover': {
                backgroundColor: '#F3F4F6',
                borderColor: '#4B5563'
              },
              minWidth: '100px',
              marginRight: '12px'
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSetBudget}
            variant="contained"
            disabled={!validateInput() || loadingStates[selectedApprover?.userId]}
            sx={{
              backgroundColor: '#1a237e',
              '&:hover': {
                backgroundColor: '#0d1757'
              },
              '&:disabled': {
                backgroundColor: '#E5E7EB',
                color: '#9CA3AF'
              },
              minWidth: '120px'
            }}
          >
            {loadingStates[selectedApprover?.userId] ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Setting...
              </>
            ) : (
              "Set Budget"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SetBudgets;