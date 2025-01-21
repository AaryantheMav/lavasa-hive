// pages/listings/ListingDetails.js
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    ImageList,
    ImageListItem
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { LocationOn, Hotel, Group, Event } from '@mui/icons-material';

const ListingDetails = () => {
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [applications, setApplications] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchListingDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/listings/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setListing(response.data);

                // Check if current user is the owner
                const userResponse = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setIsOwner(userResponse.data.id === response.data.user_id);

                // Fetch applications if user is owner
                if (userResponse.data.id === response.data.user_id) {
                    const applicationsResponse = await axios.get(`http://localhost:5000/api/applications/listings/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setApplications(applicationsResponse.data);
                }
            } catch (error) {
                console.error('Failed to fetch listing details', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListingDetails();
    }, [id]);

    const handleApply = async () => {
        setApplying(true);
        try {
            await axios.post(`http://localhost:5000/api/applications/listings/${id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setDialogOpen(true);
        } catch (error) {
            console.error('Application failed', error);
            alert('Failed to submit application: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setApplying(false);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/listings/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/home');
        } catch (error) {
            console.error('Failed to delete listing:', error);
            alert('Failed to delete listing');
        }
    };

    if (loading) return <CircularProgress />;
    if (!listing) return <Typography>Listing not found</Typography>;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            {listing.location}
                        </Typography>

                        <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Chip 
                                icon={<LocationOn />} 
                                label={listing.location} 
                                variant="outlined" 
                            />
                            <Chip 
                                icon={<Hotel />} 
                                label={`${listing.room_type} Room`} 
                                variant="outlined" 
                            />
                            <Chip 
                                icon={<Group />} 
                                label={`${listing.roommates_needed} Roommate(s) needed`} 
                                variant="outlined" 
                            />
                            <Chip 
                                icon={<Event />} 
                                label={`Available from ${listing.available_date}`} 
                                variant="outlined" 
                            />
                        </Box>

                        <Typography variant="h5" color="primary" gutterBottom>
                            ₹{listing.rent_amount}/month
                        </Typography>

                        {listing.amenities && (
                            <Box sx={{ my: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Amenities
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {typeof listing.amenities === 'string' 
                                        ? listing.amenities.split(',').map((amenity, index) => (
                                            <Chip 
                                                key={index} 
                                                label={amenity.trim()} 
                                                size="small"
                                            />
                                        ))
                                        : null
                                    }
                                </Box>
                            </Box>
                        )}

                        {listing.house_rules && (
                            <Box sx={{ my: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    House Rules
                                </Typography>
                                <Typography variant="body1">
                                    {listing.house_rules}
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Contact Information
                            </Typography>
                            <Typography variant="body1">
                                <strong>Owner:</strong> {listing.owner_name}
                            </Typography>
                            {listing.contact_preferences && (
                                <Typography variant="body1">
                                    <strong>Contact Preferences:</strong> {listing.contact_preferences}
                                </Typography>
                            )}
                        </Box>

                        {!isOwner && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{ mt: 3 }}
                                onClick={handleApply}
                                disabled={applying}
                            >
                                {applying ? 'Submitting Application...' : 'Apply for this Room'}
                            </Button>
                        )}

                        {isOwner && (
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => setConfirmDelete(true)}
                            >
                                Delete Listing
                            </Button>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Images
                        </Typography>
                        {listing.images && listing.images.length > 0 ? (
                            <ImageList cols={2} rowHeight={164} gap={8}>
                                {listing.images.map((image, index) => (
                                    <ImageListItem key={index}>
                                        <img
                                            src={`http://localhost:5000/${image.image_path}`}
                                            alt={`Room view ${index + 1}`}
                                            loading="lazy"
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'cover' 
                                            }}
                                        />
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        ) : (
                            <Typography color="text.secondary">
                                No images available
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Applications Section */}
            <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    {isOwner ? 'Applications Received' : 'Recent Applications'}
                </Typography>
                {applications.length > 0 ? (
                    <Grid container spacing={2}>
                        {applications.map((app) => (
                            <Grid item xs={12} key={app.id}>
                                <Paper elevation={1} sx={{ p: 2 }}>
                                    <Typography variant="subtitle1">
                                        {app.applicant_name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Contact: {app.applicant_email}
                                    </Typography>
                                    <Chip 
                                        label={app.status} 
                                        color={app.status === 'pending' ? 'warning' : 'success'}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="text.secondary">
                        No applications yet
                    </Typography>
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this listing? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Application Success Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Application Submitted</DialogTitle>
                <DialogContent>
                    <Typography>
                        Your application has been successfully submitted. 
                        The property owner will review your application soon.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => navigate('/home')} color="primary">
                        Back to Home
                    </Button>
                    <Button 
                        onClick={() => navigate('/profile')} 
                        color="primary" 
                        variant="contained"
                    >
                        View Applications
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ListingDetails;