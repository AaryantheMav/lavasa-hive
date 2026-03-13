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
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CheckCircle as ActivateIcon,
    Cancel as DeactivateIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const Listings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, listing: null });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchListings = async () => {
        try {
            const response = await axiosInstance.get('/admin/listings');
            setListings(response.data);
        } catch (err) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleStatusToggle = async (listing) => {
        const newStatus = listing.status === 'active' ? 'inactive' : 'active';
        try {
            await axiosInstance.put(`/admin/listings/${listing.id}/status`, { status: newStatus });
            setSuccess(`Listing ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            setError('');
            fetchListings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update listing status');
            setSuccess('');
        }
    };

    const handleDeleteClick = (listing) => {
        setDeleteDialog({ open: true, listing });
    };

    const handleDeleteConfirm = async () => {
        const listing = deleteDialog.listing;
        setDeleteDialog({ open: false, listing: null });

        try {
            await axiosInstance.delete(`/admin/listings/${listing.id}`);
            setSuccess('Listing deleted successfully');
            setError('');
            fetchListings();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete listing');
            setSuccess('');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Listing Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Location</strong></TableCell>
                            <TableCell><strong>Rent</strong></TableCell>
                            <TableCell><strong>Room Type</strong></TableCell>
                            <TableCell><strong>Owner</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Created</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listings.map((listing) => (
                            <TableRow key={listing.id}>
                                <TableCell>{listing.id}</TableCell>
                                <TableCell>{listing.location}</TableCell>
                                <TableCell>₹{listing.rent_amount}</TableCell>
                                <TableCell>{listing.room_type}</TableCell>
                                <TableCell>{listing.owner_name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={listing.status}
                                        color={listing.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(listing.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color={listing.status === 'active' ? 'warning' : 'success'}
                                        onClick={() => handleStatusToggle(listing)}
                                        title={listing.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                        {listing.status === 'active' ? <DeactivateIcon /> : <ActivateIcon />}
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteClick(listing)}
                                        title="Delete listing"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, listing: null })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete this listing at "{deleteDialog.listing?.location}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, listing: null })}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Listings;
