import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Add as AddIcon 
} from '@mui/icons-material';
import axios from 'axios';

const FundingSourceManagement = () => {
    const [fundingSources, setFundingSources] = useState([]);
    const [editSource, setEditSource] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState(null);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [newSource, setNewSource] = useState({ sourceName: '' });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchFundingSources();
    }, []);

    const fetchFundingSources = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/funding-sources');
            setFundingSources(response.data);
        } catch (error) {
            showSnackbar('Error fetching funding sources', 'error');
        }
    };

    const handleEditClick = (source) => {
        setEditSource({ 
            sourceId: source.sourceId,
            sourceName: source.sourceName 
        });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditSource(null);
        setEditDialogOpen(false);
    };

    const handleEditSave = async () => {
        try {
            await axios.put(
                `http://174.129.138.174:8080/api/funding-sources/${editSource.sourceId}`, 
                {
                    sourceId: editSource.sourceId,
                    sourceName: editSource.sourceName
                }
            );
            showSnackbar('Funding source updated successfully', 'success');
            fetchFundingSources();
            handleEditClose();
        } catch (error) {
            showSnackbar('Error updating funding source', 'error');
        }
    };

    const handleDeleteClick = (source) => {
        setSourceToDelete(source);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://174.129.138.174:8080/api/funding-sources/${sourceToDelete.sourceId}`);
            showSnackbar('Funding source deleted successfully', 'success');
            fetchFundingSources();
        } catch (error) {
            showSnackbar('Error deleting funding source', 'error');
        } finally {
            setDeleteDialogOpen(false);
            setSourceToDelete(null);
        }
    };

    const handleAddClick = () => {
        setAddDialogOpen(true);
    };

    const handleAddSave = async () => {
        try {
            await axios.post('http://174.129.138.174:8080/api/funding-sources', {
                sourceName: newSource.sourceName
            });
            showSnackbar('Funding source added successfully', 'success');
            fetchFundingSources();
            setAddDialogOpen(false);
            setNewSource({ sourceName: '' });
        } catch (error) {
            showSnackbar('Error adding funding source', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                    sx={{
                        backgroundColor: '#1a237e',
                        '&:hover': {
                            backgroundColor: '#0d1b5e',
                        }
                    }}
                >
                    Add Funding Source
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1a237e' }}>
                            <TableCell sx={{ color: 'white' }}>Source ID</TableCell>
                            <TableCell sx={{ color: 'white' }}>Source Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fundingSources.map((source) => (
                            <TableRow key={source.sourceId}>
                                <TableCell>{source.sourceId}</TableCell>
                                <TableCell>{source.sourceName}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleEditClick(source)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteClick(source)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Funding Source Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditClose}>
                <DialogTitle>Edit Funding Source</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Source Name"
                        fullWidth
                        value={editSource?.sourceName || ''}
                        onChange={(e) => setEditSource({ 
                            ...editSource, 
                            sourceName: e.target.value 
                        })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button 
                        onClick={handleEditSave} 
                        color="primary"
                        variant="contained"
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Funding Source Dialog */}
            <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
                <DialogTitle>Add New Funding Source</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Source Name"
                        fullWidth
                        value={newSource.sourceName}
                        onChange={(e) => setNewSource({ 
                            ...newSource, 
                            sourceName: e.target.value 
                        })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleAddSave} 
                        color="primary"
                        variant="contained"
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the funding source "{sourceToDelete?.sourceName}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FundingSourceManagement;