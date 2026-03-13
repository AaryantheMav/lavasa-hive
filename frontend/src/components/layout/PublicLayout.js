import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';

const PublicLayout = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Container component="main" sx={{ flexGrow: 1, py: 3, mt: 2 }}>
                {children}
            </Container>
        </Box>
    );
};

export default PublicLayout;
