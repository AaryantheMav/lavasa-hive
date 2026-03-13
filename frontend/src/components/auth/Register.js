// Register.js
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Alert,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { Person, Business } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        name: '',
        phone: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (event, newRole) => {
        if (newRole !== null) {
            setFormData({ ...formData, role: newRole });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axiosInstance.post('/users/register', formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role || formData.role);
            
            if (response.data.role === 'developer' || formData.role === 'developer') {
                navigate('/dashboard');
            } else {
                navigate('/home');
            }
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred during registration';
            setError(errorMessage);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                <Typography component="h1" variant="h5">
                    Create LAVASA HIVE Account
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                    {/* Role Selection */}
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        I am a:
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.role}
                        exclusive
                        onChange={handleRoleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="user">
                            <Person sx={{ mr: 1 }} /> User
                        </ToggleButton>
                        <ToggleButton value="developer">
                            <Business sx={{ mr: 1 }} /> Developer
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, textAlign: 'center' }}>
                        {formData.role === 'developer' 
                            ? 'Developers can list and manage properties, view analytics' 
                            : 'Users can browse properties, apply, and find roommates'}
                    </Typography>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="username"
                        label="Username"
                        type="text"
                        id="username"
                        autoComplete="username"
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
                        id="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="email"
                        label="Email Address"
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="name"
                        label="Full Name"
                        type="text"
                        id="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        type="tel"
                        id="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up as {formData.role === 'developer' ? 'Developer' : 'User'}
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="primary">
                                Already have an account? Sign In
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;