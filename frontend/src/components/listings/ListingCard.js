// components/listings/ListingCard.js
import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Button,
    Box,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocationOn, Hotel, Group, Visibility, TrendingUp } from '@mui/icons-material';

const ListingCard = ({ listing, trending }) => {
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Get the featured image URL or use a placeholder
    const imageUrl = listing.featured_image 
        ? `${API_URL}/${listing.featured_image}`
        : '/placeholder.jpg';

    const handleViewDetails = () => {
        navigate(`/listings/${listing.id}`);
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {trending && (
                <Chip
                    icon={<TrendingUp />}
                    label="Trending"
                    color="error"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                />
            )}
            <CardMedia
                component="img"
                height="200"
                image={imageUrl}
                alt={listing.location}
                sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom noWrap>
                    {listing.location}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {listing.location}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Hotel sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {listing.room_type} Room
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Group sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {listing.roommates_needed} Roommate(s) needed
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Visibility sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                        {listing.view_count || 0} views
                    </Typography>
                </Box>

                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ₹{listing.rent_amount}/month
                </Typography>
            </CardContent>
            
            <CardActions>
                <Button 
                    variant="contained"
                    size="small" 
                    fullWidth
                    onClick={handleViewDetails}
                >
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
};

export default ListingCard;