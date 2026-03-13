const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const adminController = {
    // Get dashboard stats
    getDashboardStats: (req, res) => {
        try {
            const stats = {};

            db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
                if (err) return res.status(500).json({ message: 'Server Error' });
                stats.totalUsers = result.count;

                db.get('SELECT COUNT(*) as count FROM listings WHERE status = ?', ['active'], (err, result) => {
                    if (err) return res.status(500).json({ message: 'Server Error' });
                    stats.activeListings = result.count;

                    db.get('SELECT COUNT(*) as count FROM applications', [], (err, result) => {
                        if (err) return res.status(500).json({ message: 'Server Error' });
                        stats.totalApplications = result.count;

                        db.get('SELECT COUNT(*) as count FROM applications WHERE status = ?', ['pending'], (err, result) => {
                            if (err) return res.status(500).json({ message: 'Server Error' });
                            stats.pendingApplications = result.count;

                            res.json(stats);
                        });
                    });
                });
            });
        } catch (err) {
            console.error('Dashboard stats error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get all users
    getAllUsers: (req, res) => {
        try {
            db.all('SELECT id, username, email, name, phone, role, created_at FROM users ORDER BY created_at DESC', [], (err, users) => {
                if (err) {
                    console.error('Error fetching users:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                res.json(users);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Delete user
    deleteUser: (req, res) => {
        const userId = req.params.id;
        
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        try {
            db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
                if (err) {
                    console.error('Error deleting user:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json({ message: 'User deleted successfully' });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get all listings (including inactive)
    getAllListings: (req, res) => {
        try {
            const sql = `
                SELECT l.*, u.name as owner_name, u.email as owner_email
                FROM listings l
                JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC
            `;

            db.all(sql, [], (err, listings) => {
                if (err) {
                    console.error('Error fetching listings:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                res.json(listings);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Update listing status (activate/deactivate)
    updateListingStatus: (req, res) => {
        const { status } = req.body;
        const listingId = req.params.id;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        try {
            db.run('UPDATE listings SET status = ? WHERE id = ?', [status, listingId], function(err) {
                if (err) {
                    console.error('Error updating listing status:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: 'Listing not found' });
                }
                res.json({ message: 'Listing status updated successfully' });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Delete listing permanently
    deleteListing: (req, res) => {
        const listingId = req.params.id;

        try {
            // Delete images first
            db.run('DELETE FROM listing_images WHERE listing_id = ?', [listingId], (err) => {
                if (err) {
                    console.error('Error deleting listing images:', err);
                }

                // Delete applications
                db.run('DELETE FROM applications WHERE listing_id = ?', [listingId], (err) => {
                    if (err) {
                        console.error('Error deleting listing applications:', err);
                    }

                    // Delete listing
                    db.run('DELETE FROM listings WHERE id = ?', [listingId], function(err) {
                        if (err) {
                            console.error('Error deleting listing:', err);
                            return res.status(500).json({ message: 'Server Error' });
                        }
                        if (this.changes === 0) {
                            return res.status(404).json({ message: 'Listing not found' });
                        }
                        res.json({ message: 'Listing deleted successfully' });
                    });
                });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Verify admin login
    verifyAdmin: (req, res) => {
        res.json({ 
            message: 'Admin verified',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                name: req.user.name,
                role: req.user.role
            }
        });
    }
};

module.exports = adminController;
