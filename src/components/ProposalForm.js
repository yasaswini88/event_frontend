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
    expectedDueDate: null,

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
    // after you've defined or updated `formData`:
    const isReadOnly =
        formData.status?.toLowerCase() === 'approved' ||
        formData.status?.toLowerCase() === 'rejected';


    const [users, setUsers] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [loggedInUser, setLoggedInUser] = useState(''); // Added state for logged-in user
    const [versions, setVersions] = useState([]);           // array of version objects from backend
    const [selectedVersion, setSelectedVersion] = useState(null);  // which version the user selected from dropdown

    const [selectedFile, setSelectedFile] = useState(null);

    const [attachedFiles, setAttachedFiles] = useState([]);

    const [showMoreDocs, setShowMoreDocs] = useState(false);


    const visibleFiles = showMoreDocs
        ? attachedFiles
        : attachedFiles.slice(0, 3);




    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const fetchAttachedFiles = async (proposalId) => {
        try {
            const res = await axios.get(`/api/documents/proposal/${proposalId}`);
            // We expect res.data to be an array of objects, e.g. [ { id: 1, ...}, {...} ]
            // BUT if there's an error or the server returns something else, we might have an object or null

            if (Array.isArray(res.data)) {
                setAttachedFiles(res.data);
            } else {
                // fallback if somehow we got something else
                setAttachedFiles([]);
            }
        } catch (err) {
            console.error("Error fetching attached files:", err);

            // If an error occurs, set an empty array
            setAttachedFiles([]);
        }
    };



    const handleDownloadFile = async (docId) => {
        try {
            // 1) Get the presigned URL
            const response = await axios.get(`/api/documents/${docId}/download`);
            const presignedUrl = response.data; // server returns the URL as a string

            // 2) Open in new tab or use window.location
            window.open(presignedUrl, '_blank');
        } catch (err) {
            console.error('Error downloading file:', err);
            setSnackbar({
                open: true,
                message: 'Error downloading file',
                severity: 'error'
            });
        }
    };


    useEffect(() => {
        if (initialData?.proposalId) {
            // e.g. /api/proposals/2602/versions
            axios
                .get(`/api/proposals/${initialData.proposalId}/versions`)
                .then((res) => {
                    // This returns an array of ProposalHistory objects
                    // e.g. [ { id: 1, versionNumber: 2, itemName: "...", ... }, { id:2, versionNumber:1, ... } ]
                    const sorted = res.data.sort(
                        (a, b) => b.versionNumber - a.versionNumber
                    );
                    setVersions(sorted);
                    // We'll store them in descending order so version 2 appears first, then version 1
                })
                .catch((err) => {
                    console.error("Error fetching versions:", err);
                    // you can show a message, etc.
                });
            fetchAttachedFiles(initialData.proposalId);
        }
    }, [initialData]);

    console.log("Fetched versions:", versions);



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch approvers
                const usersResponse = await axios.get('/api/users');
                // const approversList = usersResponse.data.filter(user => user.roles?.roleId === 3);
                const approversList = usersResponse.data.filter(user =>
                    user.roles.some(role => role.roleId === 3)
                );

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
                expectedDueDate: initialData.expectedDueDate
                    ? moment(initialData.expectedDueDate).format('YYYY-MM-DD') // Format for date input
                    : null,
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

        // 1) Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 2) Check for a logged-in user
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

            // 3) Convert the 'proposalDate' to EST string, e.g. 2023-08-25T14:10:00
            const dateInEST = moment(formData.proposalDate)
                .tz('America/New_York')
                .format('YYYY-MM-DDTHH:mm:ss');

            // 4) Build the JSON payload for the proposal
            const proposalPayload = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                estimatedCost: parseFloat(formData.estimatedCost),
                userId: parseInt(userId, 10),
                departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
                currentApproverId: formData.currentApproverId ? parseInt(formData.currentApproverId, 10) : null,
                proposalDate: dateInEST,
                expectedDueDate: formData.expectedDueDate,
                vendorInfo: formData.vendorInfo || '',
                status: formData.status || 'Pending',
            };

            // 5) Either POST or PUT based on whether we have proposalId
            let response;
            if (proposalPayload.proposalId) {
                // Update existing
                response = await axios.put(
                    `/api/proposals/${proposalPayload.proposalId}`,
                    proposalPayload
                );
                setSnackbar({
                    open: true,
                    message: 'Proposal updated successfully!',
                    severity: 'success',
                });
            } else {
                // Create new
                response = await axios.post('/api/proposals', proposalPayload);
                setSnackbar({
                    open: true,
                    message: 'Proposal submitted successfully!',
                    severity: 'success',
                });
            }

            // 6) Check if the server responded
            if (!response || !response.data) {
                throw new Error('No response data received from proposal creation.');
            }

            // The newly created or updated proposal
            const savedProposal = response.data;
            const newProposalId = savedProposal.proposalId;

            // 7) If user attached a file, do a second API call to /api/documents/upload
            if (selectedFile) {
                // We already have userId from above
                const formData = new FormData();
                formData.append('file', selectedFile);

                await axios.post(
                    `/api/documents/upload?proposalId=${newProposalId}&userId=${userId}`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            // 8) Done! Clear the form & notify parent
            resetForm();
            onSubmitSuccess(savedProposal);

        } catch (err) {
            console.error('Error saving proposal or uploading file:', err);

            // Decide how to display the error message
            let errorMessage = 'Error saving proposal or file. Please try again.';
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
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



    const handleVersionChange = (selectedVerNumber) => {
        // 1) Find the matching version from the versions array
        if (selectedVerNumber === 'ORIGINAL') {
            // Overwrite formData with the original initialData
            setFormData(prev => ({
                ...prev,
                ...initialData, // itemName, category, etc. from the “live” proposal
                expectedDueDate: initialData.expectedDueDate
                    ? moment(initialData.expectedDueDate).format('YYYY-MM-DD') // Format for date input
                    : null,
            }));
            setSelectedVersion(null);
            return;
        }

        const found = versions.find(v => v.versionNumber === selectedVerNumber);
        if (!found) return;

        setSelectedVersion(found);

        // 2) Overwrite the current formData with the old version’s data
        //    This is read-only or to show the user how the old version looked
        setFormData(prev => ({
            ...prev,
            itemName: found.itemName,
            category: found.category,
            description: found.description,
            quantity: found.quantity,
            estimatedCost: found.estimatedCost,
            vendorInfo: found.vendorInfo,
            businessPurpose: found.businessPurpose,
            status: found.status,
            proposalDate: found.proposalDate
                ? moment(found.proposalDate).toDate().toISOString()
                : new Date().toISOString(),
            expectedDueDate: found.expectedDueDate
                ? moment(found.expectedDueDate).format('YYYY-MM-DD') // Format for date input
                : null,
            currentApproverId: found.currentApproverId,
            departmentId: found.departmentId,
        }));
    };



    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    function formatLocalDate(dateOnlyString) {
        return moment(dateOnlyString, 'YYYY-MM-DD')
            .format('MMM D, YYYY');
    }


    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>

            {/* <Box sx={{ paddingTop: 10, textAlign: 'center' }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: '#333' }}
                >
                    {formData.proposalId
                        ? `Edit Procurement Proposal`
                        : `New Procurement Proposal`}
                </Typography>
            </Box> */}

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 4,
                    mt: 2,
                    px: 2,
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    py: 2,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                    {formData.proposalId ? 'Edit Procurement Proposal' : 'New Procurement Proposal'}
                </Typography>

                {/* === Only show this if we have versions loaded === */}
                {formData.proposalId &&
                    Array.isArray(attachedFiles) &&
                    attachedFiles.length > 0 && (
                        <Box sx={{ mt: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                Previously Attached Files ({attachedFiles.length})
                            </Typography>

                            {visibleFiles.map((doc) => (
                                <Box
                                    key={doc.id}
                                    sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}
                                >
                                    <Typography sx={{ flex: 1 }}>{doc.fileName}</Typography>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleDownloadFile(doc.id)}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            ))}

                            {attachedFiles.length > 3 && (
                                <Button
                                    onClick={() => setShowMoreDocs(!showMoreDocs)}
                                    sx={{ mt: 2 }}
                                >
                                    {showMoreDocs ? 'View Less' : 'View More'}
                                </Button>
                            )}
                        </Box>
                    )}

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
                            <TextField
                                label="Expected Due Date"
                                type="date"
                                value={formData.expectedDueDate || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, expectedDueDate: e.target.value }))
                                }
                                fullWidth
                                InputLabelProps={{
                                    shrink: true, // Ensures the label doesn't overlap with the date picker
                                }}
                                required
                            />

                            <label>Attach Optional Document:</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="application/pdf,image/*"
                            />

                            {formData.proposalId && Array.isArray(attachedFiles) && attachedFiles.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Previously Attached Files
                                    </Typography>

                                    {attachedFiles.map((doc) => (
                                        <Box key={doc.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            <Typography>{doc.fileName}</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleDownloadFile(doc.id)}
                                            >
                                                Download
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}




                            {/* <Box
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
                            </Box> */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: 'flex-end',
                                    marginTop: 2,
                                }}
                            >
                                {/* “Close” goes to the proposals list or just closes the dialog */}
                                <Button
                                    onClick={() => navigate('/proposals')}
                                    color="primary"
                                >
                                    {isReadOnly ? 'Close' : 'Cancel'}
                                </Button>



                                {!isReadOnly && (
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


                                        {loading
                                            ? (
                                                <>
                                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                                    {formData.proposalId ? 'Updating...' : 'Submitting...'}
                                                </>
                                            )
                                            : formData.proposalId
                                                ? 'Update Proposal'
                                                : 'Submit Proposal'
                                        }
                                    </Button>
                                )}
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
