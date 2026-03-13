// pages/home/Home.js
import React, { useState, useEffect } from 'react';
import { Typography, Grid, Button, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { TrendingUp } from '@mui/icons-material';
import ListingCard from '../../components/listings/ListingCard';
import axiosInstance from '../../utils/axiosInstance';

const Home = () => {
    const [listings, setListings] = useState([]);
    const [trendingListings, setTrendingListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem('role') || 'user';

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const [allResponse, trendingResponse] = await Promise.all([
                    axiosInstance.get('/listings'),
                    axiosInstance.get('/listings/trending')
                ]);
                setListings(allResponse.data);
                setTrendingListings(trendingResponse.data);
            } catch (error) {
                console.error('Error fetching listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    // Get IDs of trending listings (top viewed)
    const trendingIds = new Set(trendingListings.filter(l => l.view_count > 0).map(l => l.id));

    return (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to LAVASA HIVE
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
                    {role === 'developer' ? (
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
                    ) : (
                        <Button
                            variant="outlined"
                            color="primary"
                            component={Link}
                            to="/roommates"
                            size="large"
                            sx={{ mx: 1 }}
                        >
                            Find Roommates
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Trending Section */}
            {trendingListings.length > 0 && trendingListings.some(l => l.view_count > 0) && (
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingUp color="error" />
                        <Typography variant="h5">
                            Trending Properties
                        </Typography>
                        <Chip label="Hot" color="error" size="small" />
                    </Box>
                    <Grid container spacing={3}>
                        {trendingListings.filter(l => l.view_count > 0).slice(0, 3).map(listing => (
                            <Grid item xs={12} sm={6} md={4} key={listing.id}>
                                <ListingCard listing={listing} trending={true} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

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
                                <ListingCard listing={listing} trending={trendingIds.has(listing.id)} />
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