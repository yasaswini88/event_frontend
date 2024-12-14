import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import RolesManagement from './RolesManagement';
import DepartmentManagement from './DepartmentManagement';
import FundingSourceManagement from './FundingSourceManagement';

const OptionsDialog = ({ open, onClose }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    const handleClose = () => {
        setSelectedOption(null);
        onClose();
    };

    const renderContent = () => {
        switch (selectedOption) {
            case 'roles':
                return <RolesManagement />;
            case 'departments':
                return <DepartmentManagement />;
            case 'funding':
                 return <FundingSourceManagement />;
            default:
                return (
                    <List>
                        <ListItem button onClick={() => handleOptionClick('roles')}>
                            <ListItemText
                                primary="Roles"
                                secondary="Manage user roles and permissions"
                            />
                        </ListItem>
                        <ListItem button onClick={() => handleOptionClick('departments')}>
                            <ListItemText
                                primary="Departments"
                                secondary="Manage organization departments"
                            />
                        </ListItem>
                        <ListItem button onClick={() => handleOptionClick('funding')}>
                            <ListItemText
                                primary="Funding Source"
                                secondary="Manage funding sources"
                            />
                        </ListItem>
                    </List>
                );
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">
                        {selectedOption ?
                            selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1) :
                            'Options'}
                    </Typography>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};

export default OptionsDialog;