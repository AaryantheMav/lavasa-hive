import React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import { Home, Search, Person, Logout, Add } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Logo/Brand */}
                <Typography
                    variant="h6"
                    component={Link}
                    to="/home"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit'
                    }}
                >
                    LAVSA HIVE
                </Typography>

                {/* Navigation Links */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        color="inherit"
                        startIcon={<Home />}
                        component={Link}
                        to="/home"
                    >
                        Home
                    </Button>

                    <Button
                        color="inherit"
                        startIcon={<Search />}
                        component={Link}
                        to="/search"
                    >
                        Search
                    </Button>

                    <Button
                        color="inherit"
                        variant="outlined"
                        startIcon={<Add />}
                        component={Link}
                        to="/listings/new"
                    >
                        Post Room (₹10)
                    </Button>

                    {/* Profile Menu */}
                    <IconButton
                        size="large"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32 }} />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        onClick={handleClose}
                    >
                        <MenuItem component={Link} to="/profile">
                            <Person sx={{ mr: 1 }} /> Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;