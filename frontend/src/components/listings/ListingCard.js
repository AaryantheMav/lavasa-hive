// components/listings/ListingCard.js
import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    Button,
    Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocationOn, Hotel, Group } from '@mui/icons-material';

const ListingCard = ({ listing }) => {
    const navigate = useNavigate();
    
    // Get the featured image URL or use a placeholder
    const imageUrl = listing.featured_image 
        ? `http://localhost:5000/${listing.featured_image}`
        : '/placeholder.jpg';

    const handleViewDetails = () => {
        navigate(`/listings/${listing.id}`);
    };

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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