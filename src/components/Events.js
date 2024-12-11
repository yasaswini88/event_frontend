import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Typography,
    Box,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
    useTheme,
    alpha,
    Link
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Close as CloseIcon,
    Add as AddIcon
} from '@mui/icons-material';
import EventDialog from './EventDialog';
import { Link as RouterLink } from 'react-router-dom';


const Events = () => {
    const theme = useTheme();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const today = new Date();
    const [openAddDialog, setOpenAddDialog] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get('http://174.129.138.174:8080/api/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    // Format date helper function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time helper function
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    // Categorize events
    const categorizeEvents = () => {
        const todayEvents = [];
        const upcomingEvents = [];
        const pastEvents = [];

        events.forEach(event => {
            const eventDate = new Date(event.eventDate);

            // Reset hours to compare just the dates
            const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (eventDateOnly.getTime() === todayOnly.getTime()) {
                todayEvents.push(event);
            } else if (eventDate > today) {
                upcomingEvents.push(event);
            } else {
                pastEvents.push(event);
            }
        });

        return { todayEvents, upcomingEvents, pastEvents };
    };

    const { todayEvents, upcomingEvents, pastEvents } = categorizeEvents();

    // Get color for event type
    const getEventTypeColor = (eventType) => {
        const typeColors = {
            'SportsEvent': theme.palette.error.main,
            'TechEvent': theme.palette.info.main,
            'CulturalEvent': theme.palette.success.main,
            'CareerEvent': theme.palette.warning.main,
            'PerformanceEvent': theme.palette.secondary.main,
            'AcademicEvent': theme.palette.primary.main
        };
        return typeColors[eventType] || theme.palette.grey[500];
    };

    const EventSection = ({ title, events, color }) => (
        <Box sx={{ mb: 4 }}>
            <Typography
                variant="h5"
                sx={{
                    color: color,
                    fontWeight: 'bold',
                    mb: 2
                }}
            >
                {title}
            </Typography>
            {events.length === 0 ? (
                <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                    No events scheduled
                </Typography>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {events.map(event => (
                        <Paper
                            key={event.eventId}
                            elevation={3}
                            sx={{
                                p: 3,
                                borderLeft: `6px solid ${getEventTypeColor(event.eventType)}`,
                                '&:hover': {
                                    boxShadow: theme.shadows[6],
                                    bgcolor: alpha(theme.palette.background.paper, 0.9)
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                    >
                                        {event.eventName}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="body1" color="text.secondary">
                                            {event.eventLocation}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <CalendarIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {formatDate(event.eventDate)} at {formatTime(event.eventDate)}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={event.eventType}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(getEventTypeColor(event.eventType), 0.1),
                                            color: getEventTypeColor(event.eventType),
                                            fontWeight: 500
                                        }}
                                    />
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setOpenDialog(true);
                                    }}
                                    sx={{ ml: 2 }}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
            {/* Header with Date and Add Event Link */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4
            }}>
                <Typography
                    variant="h4"
                    sx={{
                        color: 'text.primary',
                        fontWeight: 300
                    }}
                >
                    {formatDate(today)}
                </Typography>
                <Link
                    component="button"
                    variant="body1"
                    onClick={() => setOpenAddDialog(true)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': {
                            textDecoration: 'underline'
                        }
                    }}
                >
                    <AddIcon fontSize="small" />
                    Add New Event
                </Link>
            </Box>

            {/* Event Sections */}
            <EventSection
                title="Today's Events"
                events={todayEvents}
                color={theme.palette.primary.main}
            />
            <EventSection
                title="Upcoming Events"
                events={upcomingEvents}
                color={theme.palette.success.main}
            />
            <EventSection
                title="Past Events"
                events={pastEvents}
                color={theme.palette.text.secondary}
            />

            {/* Event Details Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedEvent && (
                    <>
                        <DialogTitle sx={{ pr: 6 }}>
                            <IconButton
                                aria-label="close"
                                onClick={() => setOpenDialog(false)}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                            {selectedEvent.eventName}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    {formatDate(selectedEvent.eventDate)} at {formatTime(selectedEvent.eventDate)}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    {selectedEvent.eventLocation}
                                </Typography>
                                <Chip
                                    label={selectedEvent.eventType}
                                    sx={{
                                        mt: 1,
                                        bgcolor: alpha(getEventTypeColor(selectedEvent.eventType), 0.1),
                                        color: getEventTypeColor(selectedEvent.eventType)
                                    }}
                                />
                            </Box>
                            <Typography variant="body1" paragraph>
                                {selectedEvent.eventDescription}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                component={RouterLink}
                                to={`/proposal/${selectedEvent.eventId}`}
                                color="primary"
                            >
                                Submit Proposal
                            </Button>
                            <Button onClick={() => setOpenDialog(false)} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Add Event Dialog */}
            <EventDialog
                open={openAddDialog}
                handleClose={() => setOpenAddDialog(false)}
                refreshEvents={fetchEvents}
            />
        </Box>
    );
};



export default Events;