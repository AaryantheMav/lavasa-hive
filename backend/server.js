const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();

// Import routes
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const roommateRoutes = require('./routes/roommateRoutes');

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Enhanced CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        return res.status(200).json({});
    }
    next();
});

app.use(cors({
    origin: [
        'https://lavasa-hive-frontend-git-main-aaryans-projects-d22955a0.vercel.app',
        'https://lavasa-hive-frontend.vercel.app',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Fixed the syntax error here
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Set static folder
app.use('/uploads', express.static('uploads'));

// Define PORT
const PORT = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const listingsDir = path.join(uploadsDir, 'listings');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(listingsDir)) {
    fs.mkdirSync(listingsDir);
}

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            name TEXT,
            phone TEXT,
            bio TEXT,
            profile_pic TEXT,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Add role column if it doesn't exist (migration for existing databases)
        db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Error adding role column:', err);
            }
        });

        // Listings table
        db.run(`CREATE TABLE IF NOT EXISTS listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            location TEXT,
            rent_amount REAL,
            room_type TEXT,
            available_date TEXT,
            roommates_needed INTEGER,
            amenities TEXT,
            house_rules TEXT,
            contact_preferences TEXT,
            status TEXT DEFAULT 'active',
            view_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Add view_count column if it doesn't exist (migration for existing databases)
        db.run(`ALTER TABLE listings ADD COLUMN view_count INTEGER DEFAULT 0`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Error adding view_count column:', err);
            }
        });

        // Updated Applications table
        db.run(`CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (listing_id) REFERENCES listings (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Listing Images table
        db.run(`CREATE TABLE IF NOT EXISTS listing_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            listing_id INTEGER,
            image_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (listing_id) REFERENCES listings (id)
        )`);

        // Payments table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            type TEXT,
            status TEXT,
            transaction_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        // Roommate Profiles table
        db.run(`CREATE TABLE IF NOT EXISTS roommate_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            budget_min REAL,
            budget_max REAL,
            preferred_location TEXT,
            room_type TEXT,
            move_in_date TEXT,
            lifestyle TEXT,
            cleanliness TEXT,
            sleep_schedule TEXT,
            smoking TEXT DEFAULT 'no',
            pets TEXT DEFAULT 'no',
            occupation TEXT,
            age INTEGER,
            gender TEXT,
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`);

        console.log('Database tables created successfully');
    });
}

// Make db accessible to route handlers
app.locals.db = db;

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// Basic route
app.get('/', (req, res) => {
    res.send('LAVSA HIVE API is running');
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/roommates', roommateRoutes);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});