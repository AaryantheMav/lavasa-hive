import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteClick = (user) => {
        setDeleteDialog({ open: true, user });
    };

    const handleDeleteConfirm = async () => {
        const user = deleteDialog.user;
        setDeleteDialog({ open: false, user: null });

        try {
            await axiosInstance.delete(`/admin/users/${user.id}`);
            setSuccess(`User "${user.username}" deleted successfully`);
            setError('');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
            setSuccess('');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Username</strong></TableCell>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Phone</strong></TableCell>
                            <TableCell><strong>Role</strong></TableCell>
                            <TableCell><strong>Joined</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.name || '-'}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>{user.phone || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role || 'user'}
                                        color={user.role === 'admin' ? 'error' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {user.role !== 'admin' && (
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                            title="Delete user"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete user "{deleteDialog.user?.username}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
