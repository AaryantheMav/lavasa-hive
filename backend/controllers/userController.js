const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const userController = {
    // Register user
    register: async (req, res) => {
        const { username, password, email, name, phone } = req.body;
        console.log('Registration attempt:', { username, email, name, phone });
    
        try {
            db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, user) => {
                if (err) {
                    console.error('Database error during registration:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                if (user) {
                    console.log('User already exists:', user.username);
                    return res.status(400).json({ message: 'User already exists' });
                }
    
                try {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    console.log('Password hashed successfully');
    
                    const sql = 'INSERT INTO users (username, password, email, name, phone) VALUES (?, ?, ?, ?, ?)';
                    db.run(sql, [username, hashedPassword, email, name, phone], function(err) {
                        if (err) {
                            console.error('Error inserting user:', err);
                            return res.status(500).json({ message: 'Server Error' });
                        }
    
                        const token = jwt.sign(
                            { id: this.lastID },
                            process.env.JWT_SECRET,
                            { expiresIn: process.env.JWT_EXPIRE }
                        );
                        console.log('User registered successfully, ID:', this.lastID);
    
                        res.status(201).json({
                            message: 'User registered successfully',
                            token
                        });
                    });
                } catch (hashErr) {
                    console.error('Error hashing password:', hashErr);
                    return res.status(500).json({ message: 'Error creating user' });
                }
            });
        } catch (err) {
            console.error('Unexpected error during registration:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Login user
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            console.log('Backend received login attempt for:', username);

            db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
                if (err) {
                    console.error('Database error during login:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }

                console.log('User found:', user ? 'Yes' : 'No');

                if (!user) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                // Check password
                const isMatch = await bcrypt.compare(password, user.password);
                console.log('Password match:', isMatch ? 'Yes' : 'No');

                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid credentials' });
                }

                // Create token
                const token = jwt.sign(
                    { id: user.id },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE }
                );

                console.log('Token created successfully');
                res.json({
                    message: 'Logged in successfully',
                    token
                });
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        try {
            const user = req.user;
            delete user.password;
            res.json(user);
        } catch (err) {
            console.error('Get profile error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        const { name, email, phone, bio } = req.body;

        try {
            const sql = `
                UPDATE users 
                SET name = ?, email = ?, phone = ?, bio = ?
                WHERE id = ?
            `;

            db.run(sql, [name, email, phone, bio, req.user.id], (err) => {
                if (err) {
                    console.error('Database error during profile update:', err);
                    return res.status(500).json({ message: 'Server Error' });
                }
                res.json({ message: 'Profile updated successfully' });
            });
        } catch (err) {
            console.error('Update profile error:', err);
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

module.exports = userController;
