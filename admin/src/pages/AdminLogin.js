import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First login to get token
            const loginResponse = await axiosInstance.post('/users/login', formData);
            const token = loginResponse.data.token;

            // Then verify admin access
            const verifyResponse = await axiosInstance.get('/admin/verify', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (verifyResponse.data.user.role === 'admin') {
                localStorage.setItem('admin_token', token);
                navigate('/');
            } else {
                setError('Access denied. Admin privileges required.');
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: 12
                }}
            >
                <Typography component="h1" variant="h5" color="primary" fontWeight="bold">
                    Admin Panel
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    LAVSA HIVE Administration
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="username"
                        label="Admin Username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminLogin;
