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

const ORDER_STEPS = ['Pending', 'Ordered'];

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


function getOrderIndex(orderStatus) {
    if (!orderStatus) return 0;
    return orderStatus.toLowerCase() === 'ordered' ? 1 : 0;
}

const OrderTimeline = ({ orderStatus = 'Pending' }) => {
    const currentIndex = getOrderIndex(orderStatus);

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
                        display: 'none', // Remove default line
                    },
                }}
                style={{
                    margin: 0,
                    padding: 0,
                }}
            >
                {ORDER_STEPS.map((label, idx) => {
                    const isActive = idx <= currentIndex;
                    const isLastStep = idx === ORDER_STEPS.length - 1;

                    return (
                        <TimelineItem
                            key={label}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                minWidth: 'auto',
                                position: 'relative',
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
                                    // color={isActive ? '#CD5C5C' : 'grey'}
                                    variant={isActive ? 'filled' : 'outlined'}
                                    sx={{
                                        width: 6,
                                        height: 6,
                                        zIndex: 1,
                                    }}
                                    style={{
                                        backgroundColor: isActive ? '#CD5C5C' : '#D3D3D3', // Explicitly set color
                                    }}
                                />
                                {!isLastStep && (
                                    <TimelineConnector
                                        sx={{
                                            flex: 1,
                                            height: 2,
                                            // bgcolor: isActive ? '#E9967A' : 'grey.400',
                                            alignSelf: 'center',
                                        }}
                                        style={{
                                            backgroundColor: isActive ? '#E9967A' : '#D3D3D3', // Explicitly set color
                                        }}
                                    />
                                )}
                            </TimelineSeparator>

                            <TimelineContent
                                sx={{
                                    textAlign: 'left',
                                    mt: 0.5,
                                    ml: '-6px',
                                    alignSelf: 'flex-start',
                                    transform: 'translateX(-10%)',
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

export default OrderTimeline;
