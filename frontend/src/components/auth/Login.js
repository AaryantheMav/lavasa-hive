// Login.js
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Alert,
    Divider
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../utils/axiosInstance';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            console.log('Attempting login with:', formData);
            console.log('API URL:', process.env.REACT_APP_API_URL);
            
            const response = await axiosInstance.post('/users/login', formData);
            console.log('Login response:', response);
            
            localStorage.setItem('token', response.data.token);
            navigate('/home');
        } catch (err) {
            console.error('Full error object:', err);
            console.error('Error response:', err.response);
            console.error('Error status:', err.response?.status);
            console.error('Error data:', err.response?.data);
            setError(err.response?.data?.message || 'An error occurred during login');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            const response = await axiosInstance.post('/users/google-auth', {
                credential: credentialResponse.credential
            });
            localStorage.setItem('token', response.data.token);
            navigate('/home');
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.response?.data?.message || 'An error occurred during Google login');
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                <Typography component="h1" variant="h5">
                    Sign in to LAVSA HIVE
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
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
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>

                    <Divider sx={{ my: 2 }}>OR</Divider>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="outline"
                            size="large"
                            width="100%"
                            text="signin_with"
                        />
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Typography variant="body2" color="primary">
                                Don't have an account? Sign Up
                            </Typography>
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;