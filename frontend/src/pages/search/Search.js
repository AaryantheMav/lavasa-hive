// src/pages/search/Search.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import axiosInstance from '../../utils/axiosInstance';
import ListingCard from '../../components/listings/ListingCard';

const Search = () => {
    const [maxRent, setMaxRent] = useState('');
    const [location, setLocation] = useState('');
    const [roomType, setRoomType] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const params = {};
            if (maxRent) params.max_rent = maxRent;
            if (location) params.location = location;
            if (roomType) params.room_type = roomType;

            const response = await axiosInstance.get('/listings/search', { params });
            setListings(response.data);
            setSearched(true);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Box sx={{ 
                minHeight: '50vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Find Your Perfect Room
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Maximum Rent (₹)"
                                type="number"
                                value={maxRent}
                                onChange={(e) => setMaxRent(e.target.value)}
                                InputProps={{
                                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Lavasa"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Room Type</InputLabel>
                                <Select
                                    value={roomType}
                                    label="Room Type"
                                    onChange={(e) => setRoomType(e.target.value)}
                                >
                                    <MenuItem value="">Any</MenuItem>
                                    <MenuItem value="private">Private</MenuItem>
                                    <MenuItem value="shared">Shared</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleSearch}
                                disabled={loading || (!maxRent && !location && !roomType)}
                            >
                                {loading ? 'Searching...' : 'Search Rooms'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {searched && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
                        {listings.length > 0 
                            ? `Found ${listings.length} room(s) matching your criteria`
                            : 'No rooms found matching your criteria'
                        }
                    </Typography>
                    <Grid container spacing={3}>
                        {listings.map(listing => (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <ListingCard listing={listing} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Container>
    );
};

export default Search;