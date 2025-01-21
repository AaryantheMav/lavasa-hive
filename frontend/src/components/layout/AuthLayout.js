// components/layout/AuthLayout.js
import React from 'react';
import { Box, Container } from '@mui/material';
import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';

const AuthLayout = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1, py: 3, mt: 2 }}>
                {children}
            </Container>
        </Box>
    );
};

export default AuthLayout;