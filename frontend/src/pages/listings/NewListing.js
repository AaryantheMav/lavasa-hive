import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Dialog,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const amenities = [
    'Wi-Fi', 'AC', 'TV', 'Washing Machine', 'Fridge',
    'Microwave', 'Geyser', 'Power Backup', 'Parking', 'Security',
];

const NewListing = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [countdown, setCountdown] = useState(15);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        location: '',
        rent_amount: '',
        room_type: 'private',
        available_date: '',
        roommates_needed: 1,
        amenities: [],
        house_rules: '',
        contact_preferences: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAmenitiesChange = (event) => {
        const { value } = event.target;
        setFormData(prev => ({
            ...prev,
            amenities: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
    };

    const handleListingSubmission = async () => {
        try {
            setLoading(true);
            const listingResponse = await axios.post('http://localhost:5000/api/listings', formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (images.length > 0) {
                const formDataWithImages = new FormData();
                images.forEach(image => {
                    formDataWithImages.append('images', image);
                });

                try {
                    await axios.post(
                        `http://localhost:5000/api/listings/${listingResponse.data.listingId}/images`,
                        formDataWithImages,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );
                } catch (imageError) {
                    console.error('Image upload error:', imageError);
                }
            }

            setShowPayment(false);
            setShowSuccess(true);
            
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/home');
            }, 2000);

        } catch (error) {
            console.error('Listing creation failed:', error);
            alert('Error creating listing: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPayment(true);
        setCountdown(15);

        const timer = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(timer);
                    handleListingSubmission();
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Post a New Room (₹10)
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Rent Amount (₹)"
                            name="rent_amount"
                            type="number"
                            value={formData.rent_amount}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Room Type</InputLabel>
                            <Select
                                name="room_type"
                                value={formData.room_type}
                                onChange={handleChange}
                                label="Room Type"
                            >
                                <MenuItem value="private">Private Room</MenuItem>
                                <MenuItem value="shared">Shared Room</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Available From"
                            name="available_date"
                            type="date"
                            value={formData.available_date}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Number of Roommates Needed"
                            name="roommates_needed"
                            type="number"
                            value={formData.roommates_needed}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Amenities</InputLabel>
                            <Select
                                multiple
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleAmenitiesChange}
                                input={<OutlinedInput label="Amenities" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {amenities.map((amenity) => (
                                    <MenuItem key={amenity} value={amenity}>
                                        {amenity}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="House Rules"
                            name="house_rules"
                            multiline
                            rows={4}
                            value={formData.house_rules}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Contact Preferences"
                            name="contact_preferences"
                            value={formData.contact_preferences}
                            onChange={handleChange}
                            placeholder="E.g., WhatsApp only, Call between 9 AM - 6 PM"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            multiple
                            type="file"
                            onChange={handleImageChange}
                        />
                        <label htmlFor="raised-button-file">
                            <Button variant="outlined" component="span">
                                Upload Images
                            </Button>
                        </label>
                        {images.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {images.length} images selected
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                        >
                            Post Room (₹10)
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Payment Dialog */}
            <Dialog 
                open={showPayment} 
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { 
                        textAlign: 'center', 
                        padding: 2,
                        height: 'auto',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h5" gutterBottom>
                        Scan QR Code to Pay ₹10
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2
                    }}>
                        <img 
                            src="/gpay-qr.jpg"
                            alt="GPay QR Code" 
                            style={{ 
                                width: '300px',
                                height: '300px',
                                objectFit: 'contain',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                padding: '12px',
                                backgroundColor: '#fff'
                            }} 
                        />
                        <Typography variant="h2" sx={{ 
                            fontWeight: 'bold',
                            fontSize: '3rem'
                        }}>
                            {countdown}
                        </Typography>
                        <Typography variant="subtitle1">
                            Seconds remaining...
                        </Typography>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog 
                open={showSuccess} 
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { textAlign: 'center', padding: 3 }
                }}
            >
                <DialogContent>
                    <Typography variant="h4" color="primary" gutterBottom>
                        Success!
                    </Typography>
                    <Typography variant="h6">
                        Your listing has been created successfully.
                    </Typography>
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default NewListing;