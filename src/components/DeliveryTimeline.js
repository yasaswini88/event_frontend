
import React from 'react';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const DELIVERY_STEPS = ['Not Started', 'Processing', 'Shipped', 'Delivered'];

const theme = createTheme({
    palette: {
        primary: {
            main: '#CD5C5C',
            contrastText: '#fff', // Ensure contrastText is defined
        },
        secondary: {
            main: '#E9967A',
            contrastText: '#fff',
        },
    },
});


function getDeliveryIndex(deliveryStatus) {
    if (!deliveryStatus) return 0;
    const s = deliveryStatus.toLowerCase();
    if (s === 'processing') return 1;
    if (s === 'shipped') return 2;
    if (s === 'delivered') return 3;
    return 0;
}

const DeliveryTimeline = ({ deliveryStatus = 'Not Started' }) => {
    const currentIndex = getDeliveryIndex(deliveryStatus);

    return (
        <Box sx={{ overflowX: 'auto', py: 1 }}>
            <Timeline
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    '& .MuiTimelineItem-root:before': {
                        display: 'none',
                    },
                }}
            >
                {DELIVERY_STEPS.map((label, idx) => {
                    const isActive = idx <= currentIndex;
                    const isLastStep = idx === DELIVERY_STEPS.length - 1;

                    return (
                        <TimelineItem
                            key={label}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                m: 0,
                                p: 0,
                            }}
                        >
                            <TimelineSeparator
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    width: '100%',
                                }}
                            >
                               
                                <TimelineDot
                                    variant={isActive ? 'filled' : 'outlined'}
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        backgroundColor: isActive ? '#CD5C5C' : '#D3D3D3',
                                        border: isActive ? 'none' : '2px solid #D3D3D3',
                                    }}
                                />
                                {/* Connector */}
                                {!isLastStep && (
                                    <TimelineConnector
                                        sx={{
                                            flex: 1,
                                            height: 2,
                                            backgroundColor: isActive ? '#E9967A' : '#D3D3D3',
                                        }}
                                    />
                                )}
                            </TimelineSeparator>

                          
                            <TimelineContent
                                sx={{
                                    textAlign: 'center',
                                    mt: 1,
                                    ml: '-12px',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color={isActive ? 'text.primary' : 'text.secondary'}
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {label}
                                </Typography>
                            </TimelineContent>
                        </TimelineItem>
                    );
                })}
            </Timeline>
        </Box>
    );
};


export default DeliveryTimeline;
