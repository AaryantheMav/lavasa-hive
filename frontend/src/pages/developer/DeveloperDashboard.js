// pages/developer/DeveloperDashboard.js
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Grid,
    Paper,
    Card,
    CardContent,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert
} from '@mui/material';
import { Visibility, Home, People, TrendingUp, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const DeveloperDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const role = localStorage.getItem('role') || 'user';

    useEffect(() => {
        if (role !== 'developer') {
            navigate('/home');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await axiosInstance.get('/listings/analytics');
                setAnalytics(response.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                setError('Failed to load analytics. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [role, navigate]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );

    if (error) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
        </Box>
    );

    const stats = analytics?.stats || { total_listings: 0, total_views: 0, total_applications: 0 };
    const listings = analytics?.listings || [];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Developer Dashboard
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/listings/new')}
                >
                    Add New Property
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Home sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3">
                                {stats.total_listings}
                            </Typography>
                            <Typography variant="subtitle1">
                                Active Listings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Visibility sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3">
                                {stats.total_views}
                            </Typography>
                            <Typography variant="subtitle1">
                                Total Views
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <People sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h3">
                                {stats.total_applications}
                            </Typography>
                            <Typography variant="subtitle1">
                                Total Applications
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Listings Table */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUp color="primary" />
                    <Typography variant="h6">
                        Property Performance
                    </Typography>
                </Box>

                {listings.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Property</strong></TableCell>
                                    <TableCell><strong>Room Type</strong></TableCell>
                                    <TableCell align="right"><strong>Rent (₹)</strong></TableCell>
                                    <TableCell align="right"><strong>Views</strong></TableCell>
                                    <TableCell align="right"><strong>Applications</strong></TableCell>
                                    <TableCell align="right"><strong>Conversion Rate</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listings.map((listing) => {
                                    const conversionRate = listing.view_count > 0
                                        ? ((listing.application_count / listing.view_count) * 100).toFixed(1)
                                        : '0.0';
                                    return (
                                        <TableRow key={listing.id} hover>
                                            <TableCell>{listing.location}</TableCell>
                                            <TableCell>{listing.room_type}</TableCell>
                                            <TableCell align="right">₹{listing.rent_amount}</TableCell>
                                            <TableCell align="right">{listing.view_count || 0}</TableCell>
                                            <TableCell align="right">{listing.application_count || 0}</TableCell>
                                            <TableCell align="right">{conversionRate}%</TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    onClick={() => navigate(`/listings/${listing.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary" gutterBottom>
                            No properties listed yet
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/listings/new')}
                            sx={{ mt: 2 }}
                        >
                            Add Your First Property
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default DeveloperDashboard;
