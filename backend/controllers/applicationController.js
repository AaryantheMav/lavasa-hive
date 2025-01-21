// controllers/applicationController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const applicationController = {
    // Submit application
    submitApplication: async (req, res) => {
        try {
            // Check if user has already applied
            db.get(
                'SELECT * FROM applications WHERE listing_id = ? AND user_id = ?',
                [req.params.listingId, req.user.id],
                (err, existing) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ message: 'Server Error' });
                    }
                    if (existing) {
                        return res.status(400).json({ message: 'Already applied to this listing' });
                    }

                    // Check if listing exists and is active
                    db.get('SELECT status FROM listings WHERE id = ?', [req.params.listingId], (err, listing) => {
                        if (err) {
                            console.error('Listing check error:', err);
                            return res.status(500).json({ message: 'Server Error' });
                        }
                        if (!listing) {
                            return res.status(404).json({ message: 'Listing not found' });
                        }
                        if (listing.status !== 'active') {
                            return res.status(400).json({ message: 'This listing is no longer active' });
                        }

                        // Create new application
                        const sql = `INSERT INTO applications (listing_id, user_id, status) VALUES (?, ?, 'pending')`;
                        db.run(sql, [req.params.listingId, req.user.id], function(err) {
                            if (err) {
                                console.error('Application creation error:', err);
                                return res.status(500).json({ message: 'Error submitting application' });
                            }
                            res.status(201).json({
                                message: 'Application submitted successfully',
                                applicationId: this.lastID
                            });
                        });
                    });
                }
            );
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get my applications
    getMyApplications: async (req, res) => {
        try {
            const sql = `
                SELECT a.*, l.location, l.rent_amount, l.room_type, u.name as owner_name
                FROM applications a
                JOIN listings l ON a.listing_id = l.id
                JOIN users u ON l.user_id = u.id
                WHERE a.user_id = ?
                ORDER BY a.created_at DESC
            `;

            db.all(sql, [req.user.id], (err, applications) => {
                if (err) {
                    console.error('Error fetching applications:', err);
                    return res.status(500).json({ message: 'Error fetching applications' });
                }
                res.json(applications);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get applications for my listing
    getListingApplications: async (req, res) => {
        try {
            const sql = `
                SELECT a.*, u.name as applicant_name, u.email as applicant_email, u.phone as applicant_phone
                FROM applications a
                JOIN users u ON a.user_id = u.id
                JOIN listings l ON a.listing_id = l.id
                WHERE l.id = ?
                ORDER BY a.created_at DESC
            `;

            db.all(sql, [req.params.listingId], (err, applications) => {
                if (err) {
                    console.error('Error fetching applications:', err);
                    return res.status(500).json({ message: 'Error fetching applications' });
                }
                res.json(applications);
            });
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Update application status
    updateApplicationStatus: async (req, res) => {
        const { status } = req.body;
        try {
            // Verify the status is valid
            const validStatuses = ['pending', 'accepted', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status' });
            }

            // Check if user owns the listing
            const checkSql = `
                SELECT l.user_id
                FROM applications a
                JOIN listings l ON a.listing_id = l.id
                WHERE a.id = ?
            `;

            db.get(checkSql, [req.params.id], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (!result) {
                    return res.status(404).json({ message: 'Application not found' });
                }
                if (result.user_id !== req.user.id) {
                    return res.status(403).json({ message: 'Not authorized' });
                }

                // Update status
                const updateSql = `UPDATE applications SET status = ? WHERE id = ?`;
                db.run(updateSql, [status, req.params.id], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating application' });
                    }
                    res.json({ message: 'Application status updated successfully' });
                });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

module.exports = applicationController;