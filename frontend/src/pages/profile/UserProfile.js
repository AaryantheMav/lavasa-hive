import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Tabs,
    Tab,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [applications, setApplications] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch profile
                const profileResponse = await axios.get('http://localhost:5000/api/users/profile', { headers });
                setUser(profileResponse.data);

                // Fetch applications
                const applicationsResponse = await axios.get('http://localhost:5000/api/applications/me', { headers });
                setApplications(applicationsResponse.data);

                // Fetch user's listings
                const listingsResponse = await axios.get('http://localhost:5000/api/listings', { headers });
                const userListings = listingsResponse.data.filter(listing => listing.user_id === profileResponse.data.id);
                setListings(userListings);

            } catch (error) {
                console.error('Failed to fetch user data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            await axios.put('http://localhost:5000/api/users/profile', user, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setEditMode(false);
            // Show success message
        } catch (error) {
            console.error('Profile update failed', error);
            // Show error message
        }
    };

    const handleDeleteListing = async () => {
        if (!selectedListing) return;

        try {
            await axios.delete(`http://localhost:5000/api/listings/${selectedListing.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            // Remove the listing from the state
            setListings(prevListings => prevListings.filter(l => l.id !== selectedListing.id));
            setDeleteDialogOpen(false);
            setSelectedListing(null);
        } catch (error) {
            console.error('Failed to delete listing:', error);
            // Show error message
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'accepted':
                return 'success';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (!user) return <Typography>User not found</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
                {/* Profile Section */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                mx: 'auto',
                                mb: 2,
                                bgcolor: 'primary.main',
                                fontSize: '3rem'
                            }}
                        >
                            {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" gutterBottom>{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            @{user.username}
                        </Typography>
                        <Typography variant="body2">{user.email}</Typography>
                        <Typography variant="body2" gutterBottom>{user.phone}</Typography>
                    </Paper>
                </Grid>

                {/* Tabs Section */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            sx={{ mb: 3 }}
                        >
                            <Tab label="Profile" />
                            <Tab label="My Applications" />
                            <Tab label="My Listings" />
                        </Tabs>

                        {/* Profile Tab */}
                        {tabValue === 0 && (
                            <Box>
                                {editMode ? (
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Name"
                                                value={user.name || ''}
                                                onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                value={user.email || ''}
                                                onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                value={user.phone || ''}
                                                onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                onClick={handleUpdateProfile}
                                                sx={{ mr: 1 }}
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => setEditMode(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ) : (
                                    <Box>
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Name:</strong> {user.name}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Email:</strong> {user.email}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            <strong>Phone:</strong> {user.phone}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => setEditMode(true)}
                                            sx={{ mt: 2 }}
                                        >
                                            Edit Profile
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Applications Tab */}
                        {tabValue === 1 && (
                            <Box>
                                <Typography variant="h6" gutterBottom>
                                    My Applications
                                </Typography>
                                {applications.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {applications.map(app => (
                                            <Grid item xs={12} key={app.id}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6">
                                                            {app.location}
                                                        </Typography>
                                                        <Typography color="text.secondary" gutterBottom>
                                                            ₹{app.rent_amount} | {app.room_type} Room
                                                        </Typography>
                                                        <Box sx={{ mt: 1 }}>
                                                            <Chip
                                                                label={app.status}
                                                                color={getStatusColor(app.status)}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            Owner: {app.owner_name}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button 
                                                            size="small"
                                                            onClick={() => navigate(`/listings/${app.listing_id}`)}
                                                        >
                                                            View Listing
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography color="text.secondary">
                                        You haven't applied to any listings yet.
                                    </Typography>
                                )}
                            </Box>
                        )}

                        {/* Listings Tab */}
                        {tabValue === 2 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">
                                        My Listings
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/listings/new')}
                                    >
                                        Post New Room
                                    </Button>
                                </Box>
                                {listings.length > 0 ? (
                                    <Grid container spacing={2}>
                                        {listings.map(listing => (
                                            <Grid item xs={12} sm={6} key={listing.id}>
                                                <Card>
                                                    {listing.featured_image && (
                                                        <CardMedia
                                                            component="img"
                                                            height="140"
                                                            image={`http://localhost:5000/${listing.featured_image}`}
                                                            alt={listing.location}
                                                        />
                                                    )}
                                                    <CardContent>
                                                        <Typography variant="h6">
                                                            {listing.location}
                                                        </Typography>
                                                        <Typography color="text.secondary">
                                                            ₹{listing.rent_amount} | {listing.room_type} Room
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            Roommates Needed: {listing.roommates_needed}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button 
                                                            size="small"
                                                            onClick={() => navigate(`/listings/${listing.id}`)}
                                                        >
                                                            View Details
                                                        </Button>
                                                        <Button 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => {
                                                                setSelectedListing(listing);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography color="text.secondary">
                                        You haven't posted any listings yet.
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this listing? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteListing} 
                        color="error" 
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserProfile;