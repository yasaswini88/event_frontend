import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AppBar,
    Toolbar,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    MenuItem,
    Autocomplete,
    CircularProgress,
    Snackbar
} from '@mui/material';
import moment from 'moment-timezone';


import {
    AttachMoney as MoneyIcon,
    Description as DescriptionIcon,
    Category as CategoryIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    LocalShipping as VendorIcon
  } from '@mui/icons-material';

const PROPOSAL_STATUS = ['Pending', 'Approved', 'Rejected'];
const PROCUREMENT_CATEGORIES = ['Equipment', 'Supplies', 'Services', 'Food', 'Software', 'Other'];

const initialFormState = {
    itemName: '',
    category: '',
    description: '',
    quantity: 1,
    estimatedCost: '',
    vendorInfo: '',
    businessPurpose: '',
    status: 'Pending',
    proposalDate: new Date().toString(),

    userId: null,
    departmentId: null,
};

const ProposalForm = ({ initialData, onSubmitSuccess }) => {
    const { proposalId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [approvers, setApprovers] = useState([]);
    const [selectedApprover, setSelectedApprover] = useState(null);
    const [selectedCurrentApprover, setSelectedCurrentApprover] = useState(null);

    const [departments, setDepartments] = useState([]); // Added state for departments
    const [selectedDepartment, setSelectedDepartment] = useState(null); // Added state for selected department
    const [formData, setFormData] = useState(initialFormState);
    const [users, setUsers] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [loggedInUser, setLoggedInUser] = useState(''); // Added state for logged-in user


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch approvers
                const usersResponse = await axios.get('/api/users');
                const approversList = usersResponse.data.filter(user => user.roles?.roleId === 3);
                setApprovers(approversList);

                // Fetch departments
                const departmentsResponse = await axios.get('/api/departments');
                setDepartments(departmentsResponse.data);
            } catch (error) {
                console.error('Error fetching approvers or departments:', error);
                setSnackbar({
                    open: true,
                    message: 'Error fetching approvers or departments',
                    severity: 'error',
                });
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        if (initialData && approvers.length > 0 && departments.length > 0) {
            setFormData({
                ...initialData, // Populate form data with initialData
                proposalDate: initialData.proposalDate, // Ensure date format remains consistent
            });

            // Map the approver and department IDs to their respective objects
            const approver = approvers.find(a => a.userId === initialData.currentApproverId);
            setSelectedCurrentApprover(approver);

            const department = departments.find(d => d.deptId === initialData.departmentId);
            setSelectedDepartment(department);
        }
    }, [initialData, approvers, departments]);


    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    const getUserNameById = (userId) => {
        const user = users.find(user => user.userId === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'Welcome';
    };

    const fetchExistingProposal = async () => {
        try {
            const response = await axios.get(`/api/proposals/${proposalId}`);
            if (response.data) {
                setFormData({
                    ...response.data,
                    proposalDate: response.data.proposalDate
                });

                const approver = approvers.find(a => a.userId === response.data.userId);
                setSelectedApprover(approver);

                const currentApprover = approvers.find(a => a.userId === response.data.currentApproverId); // Fetch current approver correctly
                setSelectedCurrentApprover(currentApprover);

                const department = departments.find(d => d.deptId === response.data.departmentId);
                setSelectedDepartment(department);
            }
        } catch (err) {
            console.error('Error fetching existing proposal:', err);
            setSnackbar({
                open: true,
                message: 'Error fetching proposal details',
                severity: 'error'
            });
        }
    };


    const fetchApprovers = async () => {
        try {
            const response = await axios.get('/api/users');
            const approversList = response.data.filter(user => user.roles.roleName === 'Approver');
            setApprovers(approversList);
        } catch (err) {
            setSnackbar({
                open: true,
                message: 'Error fetching approvers',
                severity: 'error'
            });
            console.error('Error fetching approvers:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('/api/departments');
            setDepartments(response.data);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setSnackbar({
                open: true,
                message: 'Error fetching departments',
                severity: 'error'
            });
        }
    };

    const fetchLoggedInUser = async () => {
        try {
            const response = await axios.get('/api/loggedinuser');
            setLoggedInUser(response.data.username); // Assuming the API returns an object with a username field
        } catch (err) {
            console.error('Error fetching logged-in user:', err);
        }
    };

    const handleChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };


    const handleApproverChange = (event, value) => {
        setSelectedApprover(value);
        setFormData(prev => ({
            ...prev,
            userId: value ? value.userId : null
        }));
    };


    const handleCurrentApproverChange = (event, value) => {
        setSelectedCurrentApprover(value);
        setFormData(prev => ({
            ...prev,
            currentApproverId: value ? value.userId : null
        }));
    };



    const handleDepartmentChange = (event, value) => {
        setSelectedDepartment(value);
        setFormData(prev => ({
            ...prev,
            departmentId: value ? value.deptId : null  // Update departmentId
        }));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setSelectedApprover(null);
        setSelectedDepartment(null); // Reset selected department
        setError('');
    };

    const validateForm = () => {
        if (!formData.itemName?.trim()) {
            setError('Item name is required');
            return false;
        }
        if (!formData.category) {
            setError('Category is required');
            return false;
        }
        if (!formData.description?.trim()) {
            setError('Description is required');
            return false;
        }
        if (!formData.quantity || formData.quantity <= 0) {
            setError('Please enter a valid quantity');
            return false;
        }
        if (!formData.estimatedCost || formData.estimatedCost <= 0) {
            setError('Please enter a valid estimated cost');
            return false;
        }
        if (!formData.businessPurpose?.trim()) {
            setError('Business purpose is required');
            return false;
        }
        if (!formData.currentApproverId) { // Corrected from userId to currentApproverId
            setError('Please select an approver');
            return false;
        }
        if (!formData.departmentId) {
            setError('Please select a department');
            return false;
        }
        return true;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            const userId = loggedUser ? loggedUser.userId : null;

            if (!userId) {
                setSnackbar({
                    open: true,
                    message: 'User is not logged in.',
                    severity: 'error',
                });
                setLoading(false);
                return;
            }

            const dateInEST = moment(formData.proposalDate)  
      .tz('America/New_York')
      .format('YYYY-MM-DDTHH:mm:ss'); 

            const proposalPayload = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                estimatedCost: parseFloat(formData.estimatedCost),
                userId: parseInt(userId, 10),
                departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
                currentApproverId: formData.currentApproverId ? parseInt(formData.currentApproverId, 10) : null,
                // proposalDate: formData.proposalDate
                //     ? new Date(formData.proposalDate).toISOString()
                //     : new Date().toISOString(),
                proposalDate: dateInEST,
                vendorInfo: formData.vendorInfo || '',
                status: formData.status || 'Pending',
            };

            let response;
            if (proposalPayload.proposalId) {
                response = await axios.put(`/api/proposals/${proposalPayload.proposalId}`, proposalPayload);
                setSnackbar({
                    open: true,
                    message: 'Proposal updated successfully!',
                    severity: 'success',
                });
            } else {
                response = await axios.post('/api/proposals', proposalPayload);
                setSnackbar({
                    open: true,
                    message: 'Proposal submitted successfully!',
                    severity: 'success',
                });
            }

            if (response?.data) {
                resetForm();
                onSubmitSuccess(response.data); // Send the updated proposal to the parent
            } else {
                throw new Error('No response data received');
            }
        } catch (err) {
            console.error('Error saving proposal:', err);
            let errorMessage = 'Error saving proposal. Please try again.';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid proposal data. Please check all fields.';
            } else if (err.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };



    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

            <Box sx={{ paddingTop: 10, textAlign: 'center' }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: '#333' }}
                >
                    {formData.proposalId
                        ? `Edit Procurement Proposal`
                        : `New Procurement Proposal`}
                </Typography>
            </Box>

            <Card
                sx={{
                    maxWidth: 600,
                    margin: '20px auto',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcdcdc',
                }}
            >
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                label="Item Name"
                                value={formData.itemName || ''}
                                onChange={handleChange('itemName')}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            
                            />

                            <TextField
                                select
                                label="Category"
                                value={formData.category || ''}
                                onChange={handleChange('category')}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {PROCUREMENT_CATEGORIES.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </TextField>

                           
                            <TextField
                                label="Description"
                                value={formData.description || ''}
                                onChange={handleChange('description')}
                                required
                                multiline
                                rows={4}
                                fullWidth
                                inputProps={{
                                    maxLength: 1000, // Set maximum characters
                                }}
                                helperText={`${formData.description?.length || 0}/1000`} // Show current character count
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DescriptionIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                error={(formData.description?.length || 0) > 1000} // Show error state if it exceeds limit
                                
                            />


                            <TextField
                                label="Quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={handleChange('quantity')}
                                required
                                fullWidth
                                InputProps={{
                                    inputProps: { min: 1 },
                                }}
                            />

                            <TextField
                                label="Estimated Cost"
                                type="number"
                                value={formData.estimatedCost || ''}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value >= 0 || e.target.value === '') {
                                        setFormData((prev) => ({
                                            ...prev,
                                            estimatedCost: e.target.value,
                                        }));
                                    }
                                }}
                                required
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MoneyIcon />
                                        </InputAdornment>
                                    ),
                                    inputProps: { min: 0 }, // Disallow negative input
                                }}
                                error={formData.estimatedCost < 0}
                                helperText={formData.estimatedCost < 0 ? "Estimated cost cannot be negative" : ""}
                            />


                            <TextField
                                label="Vendor Information"
                                value={formData.vendorInfo || ''}
                                onChange={handleChange('vendorInfo')}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VendorIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    maxLength: 150, // Set maximum characters
                                }}
                                helperText={`${formData.vendorInfo?.length || 0}/150`} // Show current character count
                                error={(formData.vendorInfo?.length || 0) > 150} // Show error state if it exceeds limit
                            />
                            <TextField
                                label="Business Purpose"
                                value={formData.businessPurpose || ''}
                                onChange={handleChange('businessPurpose')}
                                required
                                multiline
                                rows={3}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    maxLength: 500, // Set maximum characters
                                }}
                                helperText={`${formData.businessPurpose?.length || 0}/500`} // Show current character count
                                error={(formData.businessPurpose?.length || 0) > 500} // Show error state if it exceeds limit
                            />

                            <Autocomplete
                                options={approvers}
                                value={selectedCurrentApprover}
                                getOptionLabel={(option) => `${option.email} (${option.firstName} ${option.lastName})`}
                                onChange={handleCurrentApproverChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Current Approver" required 
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <InputAdornment position="start">
                                                    <PersonIcon />
                                                </InputAdornment>
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                    }}
                                    />
                                )}
                            />

                            <Autocomplete
                                options={departments}
                                value={selectedDepartment}
                                getOptionLabel={(option) => option.deptName}
                                onChange={handleDepartmentChange}
                                isOptionEqualToValue={(option, value) =>
                                    option?.deptId === value?.deptId
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Department" required />
                                )}
                            />


                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'flex-end',
                                    marginTop: 2,
                                }}
                            >
                                <Button
                                    type="outlined"
                                    onClick={() => navigate('/proposals')}
                                    color="primary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#1a237e',
                                        color: '#fff',
                                        padding: '10px 20px',
                                        fontSize: '16px',
                                        '&:hover': {
                                            backgroundColor: '#0d1b5e',
                                        },
                                        '&:disabled': {
                                            backgroundColor: '#b0bec5',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress
                                                size={20}
                                                sx={{ mr: 1 }}
                                            />
                                            {formData.proposalId
                                                ? 'Updating...'
                                                : 'Submitting...'}
                                        </>
                                    ) : formData.proposalId
                                        ? 'Update Proposal'
                                        : 'Submit Proposal'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
ProposalForm.defaultProps = {
    initialData: null,
};

export default ProposalForm;
