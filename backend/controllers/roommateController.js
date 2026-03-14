// controllers/roommateController.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const roommateController = {
    // Create or update roommate profile
    upsertProfile(req, res) {
        const {
            budget_min, budget_max, preferred_location, room_type,
            move_in_date, lifestyle, cleanliness, sleep_schedule,
            smoking, pets, occupation, age, gender, bio
        } = req.body;

        try {
            // Check if profile exists
            db.get('SELECT id FROM roommate_profiles WHERE user_id = ?', [req.user.id], (err, existing) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }

                if (existing) {
                    // Update existing profile
                    const sql = `
                        UPDATE roommate_profiles SET
                            budget_min = ?, budget_max = ?, preferred_location = ?,
                            room_type = ?, move_in_date = ?, lifestyle = ?,
                            cleanliness = ?, sleep_schedule = ?, smoking = ?,
                            pets = ?, occupation = ?, age = ?, gender = ?, bio = ?
                        WHERE user_id = ?
                    `;
                    db.run(sql, [
                        budget_min, budget_max, preferred_location, room_type,
                        move_in_date, lifestyle, cleanliness, sleep_schedule,
                        smoking, pets, occupation, age, gender, bio, req.user.id
                    ], (err) => {
                        if (err) {
                            console.error('Error updating profile:', err);
                            return res.status(500).json({ message: 'Error updating profile' });
                        }
                        res.json({ message: 'Roommate profile updated successfully' });
                    });
                } else {
                    // Create new profile
                    const sql = `
                        INSERT INTO roommate_profiles (
                            user_id, budget_min, budget_max, preferred_location,
                            room_type, move_in_date, lifestyle, cleanliness,
                            sleep_schedule, smoking, pets, occupation, age, gender, bio
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    db.run(sql, [
                        req.user.id, budget_min, budget_max, preferred_location,
                        room_type, move_in_date, lifestyle, cleanliness,
                        sleep_schedule, smoking, pets, occupation, age, gender, bio
                    ], function(err) {
                        if (err) {
                            console.error('Error creating profile:', err);
                            return res.status(500).json({ message: 'Error creating profile' });
                        }
                        res.status(201).json({ message: 'Roommate profile created successfully', id: this.lastID });
                    });
                }
            });
        } catch (err) {
            console.error('Server Error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get my roommate profile
    getMyProfile(req, res) {
        try {
            db.get(
                'SELECT rp.*, u.name, u.email, u.phone FROM roommate_profiles rp JOIN users u ON rp.user_id = u.id WHERE rp.user_id = ?',
                [req.user.id],
                (err, profile) => {
                    if (err) {
                        console.error('Error fetching profile:', err);
                        return res.status(500).json({ message: 'Error fetching profile' });
                    }
                    res.json(profile || null);
                }
            );
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Find matching roommates
    findMatches(req, res) {
        try {
            // First get current user's profile
            db.get('SELECT * FROM roommate_profiles WHERE user_id = ?', [req.user.id], (err, myProfile) => {
                if (err) {
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (!myProfile) {
                    return res.status(400).json({ message: 'Please create a roommate profile first' });
                }

                // Find compatible profiles based on overlapping budget and preferences
                const sql = `
                    SELECT rp.*, u.name,
                        CASE
                            WHEN rp.lifestyle = ? THEN 1 ELSE 0
                        END +
                        CASE
                            WHEN rp.cleanliness = ? THEN 1 ELSE 0
                        END +
                        CASE
                            WHEN rp.sleep_schedule = ? THEN 1 ELSE 0
                        END +
                        CASE
                            WHEN rp.smoking = ? THEN 1 ELSE 0
                        END +
                        CASE
                            WHEN rp.pets = ? THEN 1 ELSE 0
                        END +
                        CASE
                            WHEN rp.preferred_location = ? THEN 2 ELSE 0
                        END +
                        CASE
                            WHEN rp.room_type = ? THEN 1 ELSE 0
                        END as match_score
                    FROM roommate_profiles rp
                    JOIN users u ON rp.user_id = u.id
                    WHERE rp.user_id != ?
                    AND rp.budget_min <= ?
                    AND rp.budget_max >= ?
                    ORDER BY match_score DESC
                    LIMIT 20
                `;

                db.all(sql, [
                    myProfile.lifestyle,
                    myProfile.cleanliness,
                    myProfile.sleep_schedule,
                    myProfile.smoking,
                    myProfile.pets,
                    myProfile.preferred_location,
                    myProfile.room_type,
                    req.user.id,
                    myProfile.budget_max,
                    myProfile.budget_min
                ], (err, matches) => {
                    if (err) {
                        console.error('Error finding matches:', err);
                        return res.status(500).json({ message: 'Error finding matches' });
                    }
                    res.json(matches || []);
                });
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Browse all roommate profiles
    browseProfiles(req, res) {
        try {
            const sql = `
                SELECT rp.*, u.name
                FROM roommate_profiles rp
                JOIN users u ON rp.user_id = u.id
                WHERE rp.user_id != ?
                ORDER BY rp.created_at DESC
            `;

            db.all(sql, [req.user.id], (err, profiles) => {
                if (err) {
                    console.error('Error browsing profiles:', err);
                    return res.status(500).json({ message: 'Error fetching profiles' });
                }
                res.json(profiles || []);
            });
        } catch (err) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

module.exports = roommateController;
