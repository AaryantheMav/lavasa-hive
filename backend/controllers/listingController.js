// listingController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const listingController = {
    // Get a single listing with images
    getListing(req, res) {
        try {
            const sql = `
                SELECT l.*, u.name as owner_name, u.email as owner_email,
                       GROUP_CONCAT(li.image_path) as image_paths,
                       GROUP_CONCAT(li.id) as image_ids
                FROM listings l
                JOIN users u ON l.user_id = u.id
                LEFT JOIN listing_images li ON l.id = li.listing_id
                WHERE l.id = ? AND l.status = 'active'
                GROUP BY l.id
            `;

            db.get(sql, [req.params.id], (err, listing) => {
                if (err) {
                    console.error('Error fetching listing:', err);
                    return res.status(500).json({ message: 'Error fetching listing' });
                }
                if (!listing) {
                    return res.status(404).json({ message: 'Listing not found' });
                }

                // Process images
                const images = [];
                if (listing.image_paths) {
                    const paths = listing.image_paths.split(',');
                    const ids = listing.image_ids.split(',');
                    for (let i = 0; i < paths.length; i++) {
                        images.push({
                            id: ids[i],
                            image_path: paths[i]
                        });
                    }
                }

                // Clean up listing object
                delete listing.image_paths;
                delete listing.image_ids;
                listing.images = images;

                // Convert amenities string to array if needed
                if (listing.amenities && typeof listing.amenities === 'string') {
                    listing.amenities = listing.amenities.split(',').map(a => a.trim());
                }

                res.json(listing);
            });
        } catch (err) {
            console.error('Server Error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get all listings with images
    getAllListings(req, res) {
        try {
            const sql = `
                SELECT l.*, u.name as owner_name, u.email as owner_email,
                       (SELECT image_path FROM listing_images WHERE listing_id = l.id LIMIT 1) as featured_image
                FROM listings l
                JOIN users u ON l.user_id = u.id
                WHERE l.status = 'active'
                ORDER BY l.created_at DESC
            `;

            db.all(sql, [], (err, listings) => {
                if (err) {
                    return res.status(500).json({ message: 'Error fetching listings' });
                }
                res.json(listings);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Create a new listing
    createListing(req, res) {
        const {
            location,
            rent_amount,
            room_type,
            available_date,
            roommates_needed,
            amenities,
            house_rules,
            contact_preferences
        } = req.body;

        try {
            // Convert amenities array to string if it's an array
            const amenitiesString = Array.isArray(amenities) ? amenities.join(',') : amenities;

            const sql = `
                INSERT INTO listings (
                    user_id, location, rent_amount, room_type,
                    available_date, roommates_needed, amenities,
                    house_rules, contact_preferences
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(sql, [
                req.user.id,
                location,
                rent_amount,
                room_type,
                available_date,
                roommates_needed,
                amenitiesString,
                house_rules,
                contact_preferences
            ], function(err) {
                if (err) {
                    console.error('Error creating listing:', err);
                    return res.status(500).json({ message: 'Error creating listing' });
                }
                res.status(201).json({
                    message: 'Listing created successfully',
                    listingId: this.lastID
                });
            });
        } catch (err) {
            console.error('Server Error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // The new updateListing method
    updateListing(req, res) {
        const {
            location,
            rent_amount,
            room_type,
            available_date,
            roommates_needed,
            amenities,
            house_rules,
            contact_preferences
        } = req.body;

        try {
            // Check if user owns the listing
            db.get('SELECT user_id FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (!listing) {
                    return res.status(404).json({ message: 'Listing not found' });
                }
                if (listing.user_id !== req.user.id) {
                    return res.status(403).json({ message: 'Not authorized' });
                }

                // Convert amenities array to string if it's an array
                const amenitiesString = Array.isArray(amenities) ? amenities.join(',') : amenities;

                const sql = `
                    UPDATE listings 
                    SET location = ?,
                        rent_amount = ?,
                        room_type = ?,
                        available_date = ?,
                        roommates_needed = ?,
                        amenities = ?,
                        house_rules = ?,
                        contact_preferences = ?
                    WHERE id = ?
                `;

                db.run(sql, [
                    location,
                    rent_amount,
                    room_type,
                    available_date,
                    roommates_needed,
                    amenitiesString,
                    house_rules,
                    contact_preferences,
                    req.params.id
                ], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error updating listing' });
                    }
                    res.json({ message: 'Listing updated successfully' });
                });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Upload images for a listing
    uploadImages(req, res) {
        try {
            // Check if user owns the listing
            db.get('SELECT user_id FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (!listing) {
                    return res.status(404).json({ message: 'Listing not found' });
                }
                if (listing.user_id !== req.user.id) {
                    return res.status(403).json({ message: 'Not authorized' });
                }

                // Insert image paths into database
                const images = req.files.map(file => file.path.replace(/\\/g, '/')); // Convert Windows paths
                const values = images.map(path => `(${req.params.id}, '${path}')`).join(',');
                
                const sql = `INSERT INTO listing_images (listing_id, image_path) VALUES ${values}`;
                
                db.run(sql, [], (err) => {
                    if (err) {
                        console.error('Database Error:', err);
                        return res.status(500).json({ message: 'Error saving image paths' });
                    }
                    res.json({
                        message: 'Images uploaded successfully',
                        images: images
                    });
                });
            });
        } catch (err) {
            console.error('Server Error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Delete a listing and its images
    deleteListing(req, res) {
        try {
            // Check if user owns the listing
            db.get('SELECT user_id FROM listings WHERE id = ?', [req.params.id], (err, listing) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (!listing) {
                    return res.status(404).json({ message: 'Listing not found' });
                }
                if (listing.user_id !== req.user.id) {
                    return res.status(403).json({ message: 'Not authorized' });
                }

                // Update status to inactive
                db.run('UPDATE listings SET status = ? WHERE id = ?', ['inactive', req.params.id], (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Error deleting listing' });
                    }
                    res.json({ message: 'Listing deleted successfully' });
                });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Search listings
    searchListings(req, res) {
        const { max_rent } = req.query;

        try {
            const sql = `
                SELECT l.*, 
                       u.name as owner_name,
                       u.email as owner_email,
                       (SELECT image_path FROM listing_images 
                        WHERE listing_id = l.id 
                        ORDER BY created_at DESC 
                        LIMIT 1) as featured_image
                FROM listings l
                JOIN users u ON l.user_id = u.id
                WHERE l.status = 'active'
                ${max_rent ? 'AND l.rent_amount <= ?' : ''}
                ORDER BY l.created_at DESC
            `;

            const params = max_rent ? [parseFloat(max_rent)] : [];

            db.all(sql, params, (err, listings) => {
                if (err) {
                    console.error('Search error:', err);
                    return res.status(500).json({ message: 'Error searching listings' });
                }

                // Process listings to ensure proper data format
                const processedListings = listings.map(listing => ({
                    ...listing,
                    featured_image: listing.featured_image || null
                }));

                res.json(processedListings);
            });
        } catch (err) {
            console.error('Server error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

module.exports = listingController;