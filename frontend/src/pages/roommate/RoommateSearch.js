// pages/roommate/RoommateSearch.js
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Grid,
    Paper,
    TextField,
    Button,
    Card,
    CardContent,
    Chip,
    Avatar,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Tabs,
    Tab,
    Divider
} from '@mui/material';
import {
    Person,
    Favorite,
    Search,
    NightsStay,
    CleaningServices,
    SmokeFree,
    Pets
} from '@mui/icons-material';
import axiosInstance from '../../utils/axiosInstance';

const RoommateSearch = () => {
    const [tabValue, setTabValue] = useState(0);
    const [profile, setProfile] = useState(null);
    const [matches, setMatches] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        budget_min: '',
        budget_max: '',
        preferred_location: '',
        room_type: 'private',
        move_in_date: '',
        lifestyle: 'moderate',
        cleanliness: 'clean',
        sleep_schedule: 'normal',
        smoking: 'no',
        pets: 'no',
        occupation: '',
        age: '',
        gender: '',
        bio: ''
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await axiosInstance.get('/roommates/profile');
                if (response.data) {
                    setProfile(response.data);
                    setFormData({
                        budget_min: response.data.budget_min || '',
                        budget_max: response.data.budget_max || '',
                        preferred_location: response.data.preferred_location || '',
                        room_type: response.data.room_type || 'private',
                        move_in_date: response.data.move_in_date || '',
                        lifestyle: response.data.lifestyle || 'moderate',
                        cleanliness: response.data.cleanliness || 'clean',
                        sleep_schedule: response.data.sleep_schedule || 'normal',
                        smoking: response.data.smoking || 'no',
                        pets: response.data.pets || 'no',
                        occupation: response.data.occupation || '',
                        age: response.data.age || '',
                        gender: response.data.gender || '',
                        bio: response.data.bio || ''
                    });
                    // If profile exists, also fetch matches and all profiles
                    try {
                        const [matchesRes, profilesRes] = await Promise.all([
                            axiosInstance.get('/roommates/matches'),
                            axiosInstance.get('/roommates/browse')
                        ]);
                        setMatches(matchesRes.data);
                        setAllProfiles(profilesRes.data);
                    } catch (err) {
                        console.error('Error fetching matches/profiles:', err);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const fetchMatches = async () => {
        try {
            const response = await axiosInstance.get('/roommates/matches');
            setMatches(response.data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    };

    const fetchAllProfiles = async () => {
        try {
            const response = await axiosInstance.get('/roommates/browse');
            setAllProfiles(response.data);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage('');
        try {
            await axiosInstance.post('/roommates/profile', formData);
            setMessage('Roommate profile saved successfully!');
            setProfile(formData);
            fetchMatches();
            fetchAllProfiles();
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage('Error saving profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const getMatchScoreColor = (score) => {
        if (score >= 6) return 'success';
        if (score >= 3) return 'warning';
        return 'default';
    };

    const getMatchScoreLabel = (score) => {
        if (score >= 6) return 'Excellent Match';
        if (score >= 4) return 'Good Match';
        if (score >= 2) return 'Fair Match';
        return 'Low Match';
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Roommate Finder
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Create your profile and find compatible roommates in Lavasa
            </Typography>

            <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{ mb: 3, mt: 2 }}
            >
                <Tab icon={<Person />} label="My Profile" />
                <Tab icon={<Favorite />} label={`Matches (${matches.length})`} disabled={!profile} />
                <Tab icon={<Search />} label="Browse All" disabled={!profile} />
            </Tabs>

            {message && (
                <Alert
                    severity={message.includes('Error') ? 'error' : 'success'}
                    sx={{ mb: 2 }}
                    onClose={() => setMessage('')}
                >
                    {message}
                </Alert>
            )}

            {/* Profile Tab */}
            {tabValue === 0 && (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {profile ? 'Update Your Roommate Profile' : 'Create Your Roommate Profile'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Minimum Budget (₹)"
                                name="budget_min"
                                type="number"
                                value={formData.budget_min}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Maximum Budget (₹)"
                                name="budget_max"
                                type="number"
                                value={formData.budget_max}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Preferred Location"
                                name="preferred_location"
                                value={formData.preferred_location}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Room Type</InputLabel>
                                <Select
                                    name="room_type"
                                    value={formData.room_type}
                                    label="Room Type"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="private">Private</MenuItem>
                                    <MenuItem value="shared">Shared</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Move-in Date"
                                name="move_in_date"
                                type="date"
                                value={formData.move_in_date}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Occupation"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    label="Gender"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Lifestyle</InputLabel>
                                <Select
                                    name="lifestyle"
                                    value={formData.lifestyle}
                                    label="Lifestyle"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="quiet">Quiet</MenuItem>
                                    <MenuItem value="moderate">Moderate</MenuItem>
                                    <MenuItem value="social">Social</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Preferences</Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Cleanliness</InputLabel>
                                <Select
                                    name="cleanliness"
                                    value={formData.cleanliness}
                                    label="Cleanliness"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="very_clean">Very Clean</MenuItem>
                                    <MenuItem value="clean">Clean</MenuItem>
                                    <MenuItem value="moderate">Moderate</MenuItem>
                                    <MenuItem value="relaxed">Relaxed</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Sleep Schedule</InputLabel>
                                <Select
                                    name="sleep_schedule"
                                    value={formData.sleep_schedule}
                                    label="Sleep Schedule"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="early_bird">Early Bird</MenuItem>
                                    <MenuItem value="normal">Normal</MenuItem>
                                    <MenuItem value="night_owl">Night Owl</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Smoking</InputLabel>
                                <Select
                                    name="smoking"
                                    value={formData.smoking}
                                    label="Smoking"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="no">No Smoking</MenuItem>
                                    <MenuItem value="outside">Outside Only</MenuItem>
                                    <MenuItem value="yes">Smoker</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Pets</InputLabel>
                                <Select
                                    name="pets"
                                    value={formData.pets}
                                    label="Pets"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="no">No Pets</MenuItem>
                                    <MenuItem value="has_pets">Has Pets</MenuItem>
                                    <MenuItem value="ok_with_pets">OK with Pets</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bio / About Me"
                                name="bio"
                                multiline
                                rows={3}
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell potential roommates about yourself..."
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSaveProfile}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Matches Tab */}
            {tabValue === 1 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Your Top Matches
                    </Typography>
                    {matches.length > 0 ? (
                        <Grid container spacing={2}>
                            {matches.map((match) => (
                                <Grid item xs={12} sm={6} md={4} key={match.id}>
                                    <Card elevation={3}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                                    {match.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6">{match.name}</Typography>
                                                    <Chip
                                                        label={getMatchScoreLabel(match.match_score)}
                                                        color={getMatchScoreColor(match.match_score)}
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                            <Divider sx={{ mb: 2 }} />
                                            {match.occupation && (
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Occupation:</strong> {match.occupation}
                                                </Typography>
                                            )}
                                            {match.age && (
                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Age:</strong> {match.age}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Budget:</strong> ₹{match.budget_min} - ₹{match.budget_max}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Location:</strong> {match.preferred_location || 'Any'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                <Chip icon={<NightsStay />} label={match.sleep_schedule} size="small" variant="outlined" />
                                                <Chip icon={<CleaningServices />} label={match.cleanliness} size="small" variant="outlined" />
                                                {match.smoking === 'no' && <Chip icon={<SmokeFree />} label="Non-smoker" size="small" variant="outlined" />}
                                                {match.pets !== 'no' && <Chip icon={<Pets />} label={match.pets} size="small" variant="outlined" />}
                                            </Box>
                                            {match.bio && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    "{match.bio}"
                                                </Typography>
                                            )}
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Contact: {match.email}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No matches found yet. Make sure your profile is complete and check back later!
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}

            {/* Browse All Tab */}
            {tabValue === 2 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        All Roommate Profiles
                    </Typography>
                    {allProfiles.length > 0 ? (
                        <Grid container spacing={2}>
                            {allProfiles.map((person) => (
                                <Grid item xs={12} sm={6} md={4} key={person.id}>
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    {person.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="h6">{person.name}</Typography>
                                            </Box>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Budget:</strong> ₹{person.budget_min} - ₹{person.budget_max}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Location:</strong> {person.preferred_location || 'Any'}
                                            </Typography>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Lifestyle:</strong> {person.lifestyle}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                                <Chip label={person.room_type} size="small" />
                                                <Chip label={person.sleep_schedule} size="small" />
                                                <Chip label={person.cleanliness} size="small" />
                                            </Box>
                                            {person.bio && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    "{person.bio}"
                                                </Typography>
                                            )}
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Contact: {person.email}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No roommate profiles available yet. Be the first to create one!
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default RoommateSearch;
