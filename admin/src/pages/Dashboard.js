import React, { useState, useEffect } from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    Home as HomeIcon,
    Description as DescriptionIcon,
    PendingActions as PendingIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ color: color, opacity: 0.7 }}>
                    {React.cloneElement(icon, { sx: { fontSize: 48 } })}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axiosInstance.get('/admin/dashboard');
                setStats(response.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

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
                Dashboard
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<PeopleIcon />}
                        color="#1a237e"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Listings"
                        value={stats?.activeListings || 0}
                        icon={<HomeIcon />}
                        color="#2e7d32"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Applications"
                        value={stats?.totalApplications || 0}
                        icon={<DescriptionIcon />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Applications"
                        value={stats?.pendingApplications || 0}
                        icon={<PendingIcon />}
                        color="#c62828"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
