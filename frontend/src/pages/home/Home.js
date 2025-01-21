// pages/home/Home.js
import React, { useState, useEffect } from 'react';
import { Typography, Grid, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ListingCard from '../../components/listings/ListingCard';
import axios from 'axios';

const Home = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/listings', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setListings(response.data);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to LAVSA HIVE
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Find your perfect roommate in LAVASA
                </Typography>
                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/search"
                        size="large"
                        sx={{ mx: 1 }}
                    >
                        Find Rooms
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to="/listings/new"
                        size="large"
                        sx={{ mx: 1 }}
                    >
                        Post a Room
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Available Listings
                </Typography>
                {loading ? (
                    <Typography>Loading listings...</Typography>
                ) : listings.length > 0 ? (
                    <Grid container spacing={3}>
                        {listings.map(listing => (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <ListingCard listing={listing} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="text.secondary">
                        No listings available yet.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default Home;