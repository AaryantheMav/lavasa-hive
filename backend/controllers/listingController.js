// listingController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const listingController = {
    // Get a single listing with images (increments view count)
    getListing(req, res) {
        try {
            // Increment view count
            db.run('UPDATE listings SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ? AND status = ?', [req.params.id, 'active']);

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

    // Get trending listings (sorted by view_count)
    getTrendingListings(req, res) {
        try {
            const sql = `
                SELECT l.*, u.name as owner_name, u.email as owner_email,
                       (SELECT image_path FROM listing_images WHERE listing_id = l.id LIMIT 1) as featured_image
                FROM listings l
                JOIN users u ON l.user_id = u.id
                WHERE l.status = 'active'
                ORDER BY l.view_count DESC
                LIMIT 10
            `;

            db.all(sql, [], (err, listings) => {
                if (err) {
                    return res.status(500).json({ message: 'Error fetching trending listings' });
                }
                res.json(listings);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get developer analytics
    getDeveloperAnalytics(req, res) {
        try {
            const userId = req.user.id;

            // Get total listings, views, applications for this developer
            const sql = `
                SELECT 
                    COUNT(l.id) as total_listings,
                    COALESCE(SUM(l.view_count), 0) as total_views,
                    (SELECT COUNT(*) FROM applications a 
                     JOIN listings ll ON a.listing_id = ll.id 
                     WHERE ll.user_id = ?) as total_applications
                FROM listings l
                WHERE l.user_id = ? AND l.status = 'active'
            `;

            db.get(sql, [userId, userId], (err, stats) => {
                if (err) {
                    console.error('Error fetching analytics:', err);
                    return res.status(500).json({ message: 'Error fetching analytics' });
                }

                // Get per-listing analytics
                const listingSql = `
                    SELECT l.id, l.location, l.rent_amount, l.room_type, 
                           l.view_count, l.created_at,
                           (SELECT COUNT(*) FROM applications a WHERE a.listing_id = l.id) as application_count,
                           (SELECT image_path FROM listing_images WHERE listing_id = l.id LIMIT 1) as featured_image
                    FROM listings l
                    WHERE l.user_id = ? AND l.status = 'active'
                    ORDER BY l.view_count DESC
                `;

                db.all(listingSql, [userId], (err, listings) => {
                    if (err) {
                        console.error('Error fetching listing analytics:', err);
                        return res.status(500).json({ message: 'Error fetching listing analytics' });
                    }

                    res.json({
                        stats: stats || { total_listings: 0, total_views: 0, total_applications: 0 },
                        listings: listings || []
                    });
                });
            });
        } catch (err) {
            console.error('Server Error:', err);
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

                // Insert image paths using parameterized queries
                const images = req.files.map(file => file.path.replace(/\\/g, '/'));
                const placeholders = images.map(() => '(?, ?)').join(',');
                const params = [];
                images.forEach(imgPath => {
                    params.push(req.params.id, imgPath);
                });
                
                const sql = `INSERT INTO listing_images (listing_id, image_path) VALUES ${placeholders}`;
                
                db.run(sql, params, (err) => {
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
        const { max_rent, location, room_type } = req.query;

        try {
            let conditions = ['l.status = ?'];
            let params = ['active'];

            if (max_rent) {
                conditions.push('l.rent_amount <= ?');
                params.push(parseFloat(max_rent));
            }
            if (location) {
                conditions.push('l.location LIKE ?');
                params.push(`%${location}%`);
            }
            if (room_type) {
                conditions.push('l.room_type = ?');
                params.push(room_type);
            }

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
                WHERE ${conditions.join(' AND ')}
                ORDER BY l.created_at DESC
            `;

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