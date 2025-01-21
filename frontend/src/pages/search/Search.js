// src/pages/search/Search.js
import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Grid
} from '@mui/material';
import axios from 'axios';
import ListingCard from '../../components/listings/ListingCard';

const Search = () => {
    const [maxRent, setMaxRent] = useState('');
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/listings/search', {
                params: { max_rent: maxRent },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
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
                <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                        Find Rooms Within Your Budget
                    </Typography>

                    <TextField
                        fullWidth
                        label="Maximum Rent (₹)"
                        type="number"
                        value={maxRent}
                        onChange={(e) => setMaxRent(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                        }}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleSearch}
                        disabled={loading || !maxRent}
                    >
                        {loading ? 'Searching...' : 'Search Rooms'}
                    </Button>
                </Paper>
            </Box>

            {searched && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom align="center" sx={{ mb: 3 }}>
                        {listings.length > 0 
                            ? `Found ${listings.length} rooms under ₹${maxRent}`
                            : 'No rooms found in your budget'
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