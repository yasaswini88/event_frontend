// --------------------------------------------------
// FILE: ApproverSetAlerts.js
// LOCATION: src/components/ApproverSetAlerts.js
// --------------------------------------------------
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Checkbox,
    TextField,
    Alert,
    Snackbar,
    Typography,
    Box,
    MenuItem,
    Divider,
    FormGroup,
    CircularProgress,
    Stack,
    IconButton,
    Collapse
} from '@mui/material';
import {
    NotificationsActive as AlertIcon,
    Close as CloseIcon
} from '@mui/icons-material';


const ApproverSetAlerts = ({ open, onClose }) => {
    // We'll store the user from localStorage (the Approver)
    const user = JSON.parse(localStorage.getItem('user'));

    // Default to current year/month
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // State for the form
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(currentMonth);
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [alertAt50, setAlertAt50] = useState(true);
    const [alertAt80, setAlertAt80] = useState(true);

    const [originalPrefs, setOriginalPrefs] = useState({
        year: currentYear,
        month: currentMonth,
        alertEnabled: false,
        alertAt50: false,
        alertAt80: false
    });


    const [loading, setLoading] = useState(false);

    // For success/error messages
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
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
        if (open) {
            fetchExistingPreferences();
        }
    }, [open, year, month]);


    const fetchExistingPreferences = async () => {
        try {
            if (!user || !user.userId) return;

            const response = await axios.get('/api/budget/approver-preferences', {
                params: {
                    approverId: user.userId,
                    year: year,
                    month: month
                }
            });
            const data = response.data; // This is an ApproverBudget object or an empty one

            // Now set your states from data
            setAlertEnabled(data.alertEnabled || false);
            setAlertAt50(data.alertAt50 || false);
            setAlertAt80(data.alertAt80 || false);


            setOriginalPrefs({
                year: year, // or data.year, if returned
                month: month,
                alertEnabled: data.alertEnabled || false,
                alertAt50: data.alertAt50 || false,
                alertAt80: data.alertAt80 || false
            });


        } catch (error) {
            console.error('Error loading existing preferences:', error);
            // Optionally show a snackbar message
        }
    };


    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const validateInput = () => {
        if (year < 2000 || year > 2100) return false;
        if (month < 1 || month > 12) return false;
        return true;
    };

    const handleAlertToggle = (e) => {
        const checked = e.target.checked;
        setAlertEnabled(checked);

        if (!checked) {
            // user just turned OFF => set both false
            setAlertAt50(false);
            setAlertAt80(false);
        } else {
            // user turned ON => do NOT forcibly set them to "true",
            // but only do so if they are both currently false.
            // Or better: keep them whatever they were from DB
            if (!alertAt50 && !alertAt80) {
                // If both are false, choose some default
                setAlertAt50(true);
                setAlertAt80(true);
            }
        }
    };


    const handleReset = () => {
        // revert states to originalPrefs
        setYear(originalPrefs.year);
        setMonth(originalPrefs.month);
        setAlertEnabled(originalPrefs.alertEnabled);
        setAlertAt50(originalPrefs.alertAt50);
        setAlertAt80(originalPrefs.alertAt80);
    };

    // Called when user clicks "Save" in the dialog
    const handleSave = async () => {
        if (!validateInput()) {
            setSnackbar({
                open: true,
                message: 'Please check your input values.',
                severity: 'error'
            });
            return;
        }

        // 2) If alerts are enabled, must choose at least one threshold
        if (alertEnabled && !alertAt50 && !alertAt80) {
            setSnackbar({
                open: true,
                message: 'Please select at least 50% or 80% if alerts are enabled.',
                severity: 'error'
            });
            return;
        }

        setLoading(true);
        try {
            if (!user || !user.userId) {
                throw new Error('User not found in localStorage or userId missing');
            }

            // Make the POST call to your /api/budget/approver-set-alerts endpoint
            await axios.post('/api/budget/approver-set-alerts', null, {
                params: {
                    approverId: user.userId,
                    year: year,
                    month: month,
                    alertEnabled: alertEnabled,
                    alertAt50: alertEnabled && alertAt50,
                    alertAt80: alertEnabled && alertAt80
                }
            });

            setSnackbar({
                open: true,
                message: `Alert preferences updated for ${months.find(m => m.value === month)?.label} ${year}!`,
                severity: 'success'
            });

            onClose();
        } catch (error) {
            console.error('Error setting alert preferences:', error);
            setSnackbar({
                open: true,
                message: 'Failed to set alert preferences. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    elevation: 3,
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertIcon color="primary" />
                        <Typography variant="h6">Set Alert Preferences</Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Configure budget usage alerts for the specified period
                        </Typography>
                    </Box>

                    <Stack spacing={3}>
                        {/* Period Selection */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Year"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                fullWidth
                                inputProps={{
                                    min: "2000",
                                    max: "2100"
                                }}
                                error={year < 2000 || year > 2100}
                                helperText={year < 2000 || year > 2100 ? "Year must be between 2000 and 2100" : ""}
                            />
                            <TextField
                                select
                                label="Month"
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                fullWidth
                            >
                                {months.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Alert Settings */}
                        <Box sx={{
                            bgcolor: 'background.default',
                            p: 2,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={alertEnabled}
                                            onChange={handleAlertToggle}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            Enable Budget Alerts
                                        </Typography>
                                    }
                                />

                                <Collapse in={alertEnabled}>
                                    <Box sx={{ ml: 3, mt: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={alertAt50}
                                                    onChange={(e) => setAlertAt50(e.target.checked)}
                                                    color="warning"
                                                />
                                            }
                                            label="Alert at 50% budget usage"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={alertAt80}
                                                    onChange={(e) => setAlertAt80(e.target.checked)}
                                                    color="error"
                                                />
                                            }
                                            label="Alert at 80% budget usage"
                                        />
                                    </Box>
                                </Collapse>
                            </FormGroup>
                        </Box>
                    </Stack>
                </DialogContent>

                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleReset}
                        color="secondary"
                        disabled={loading}
                    >
                        Reset
                    </Button>
                    <Button
                        onClick={onClose}
                        color="inherit"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading || !validateInput()}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </DialogActions>

            </Dialog>

            {/* Snackbar for success/error messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={handleCloseSnackbar}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ApproverSetAlerts;