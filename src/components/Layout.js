import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
    useMediaQuery,
    IconButton
} from '@mui/material';
import {
    ShoppingCart as ProcurementIcon,
    SupervisorAccount as ApproversIcon,
    People as PurchasersIcon,
    Settings as SettingsIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import OptionsDialog from './OptionsDialog'; 

const drawerWidth = 240;

const Layout = ({ open, onClose }) => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);

    const menuItems = [
        {
            text: 'Procurements',
            icon: <ProcurementIcon />,
            path: '/admin/procurements'
        },
        {
            text: 'Approvers',
            icon: <ApproversIcon />,
            path: '/admin/approvers'
        },
        {
            text: 'Purchasers',
            icon: <PurchasersIcon />,
            path: '/admin/purchasers'
        },
        {
            text: 'Options',
            icon: <SettingsIcon />,
            onClick: () => setOptionsDialogOpen(true)
        }
    ];

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const drawer = (
        <Box sx={{ height: '100%' }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                backgroundColor: '#1a237e',
                color: '#fff'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Admin Dashboard
                </Typography>
                <IconButton 
                    onClick={handleClose}
                    sx={{ 
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        component={item.path ? Link : 'div'}
                        to={item.path}
                        key={item.text}
                        onClick={item.onClick ? () => {
                            item.onClick();
                            handleClose();
                        } : handleClose}
                        selected={item.path && location.pathname === item.path}
                        sx={{
                            '&:hover': {
                                backgroundColor: '#f0f4ff',
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#e3f2fd',
                                '&:hover': {
                                    backgroundColor: '#e3f2fd',
                                },
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#1a237e' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.text}
                            sx={{
                                '& .MuiTypography-root': {
                                    fontWeight: item.path && location.pathname === item.path ? 'bold' : 'normal'
                                }
                            }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <>
            <Drawer
                variant={isMobile ? 'temporary' : 'temporary'}
                anchor="left"
                open={open}
                onClose={handleClose}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        backgroundColor: '#fff',
                        borderRight: '1px solid #e0e0e0'
                    },
                }}
            >
                {drawer}
            </Drawer>
            <OptionsDialog 
                open={optionsDialogOpen} 
                onClose={() => setOptionsDialogOpen(false)} 
            />
        </>
    );
};

export default Layout;