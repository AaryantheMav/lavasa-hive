// migration.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create backup directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Create backup with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `database-${timestamp}.sqlite`);

// Copy current database to backup
fs.copyFileSync('database.sqlite', backupFile);
console.log(`Backup created at: ${backupFile}`);

// First close any existing connections
const closeConnection = (db) => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        } else {
            resolve();
        }
    });
};

// Migration function
async function migrate() {
    let oldDb = null;
    let newDb = null;

    try {
        console.log('Starting migration...');

        // Connect to old database
        oldDb = new sqlite3.Database(backupFile);
        
        // Wait a moment to ensure file handles are released
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete existing database if it exists
        if (fs.existsSync('database.sqlite')) {
            await closeConnection(newDb);
            fs.unlinkSync('database.sqlite');
        }

        // Connect to new database
        newDb = new sqlite3.Database('database.sqlite');

        // Create schema
        await new Promise((resolve, reject) => {
            newDb.serialize(() => {
                // Users table
                newDb.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT,
                    email TEXT UNIQUE,
                    name TEXT,
                    phone TEXT,
                    bio TEXT,
                    profile_pic TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                // Listings table
                newDb.run(`CREATE TABLE IF NOT EXISTS listings (
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
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`);

                // Applications table
                newDb.run(`CREATE TABLE IF NOT EXISTS applications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    listing_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (listing_id) REFERENCES listings (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`);

                // Listing Images table
                newDb.run(`CREATE TABLE IF NOT EXISTS listing_images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    listing_id INTEGER,
                    image_path TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (listing_id) REFERENCES listings (id)
                )`);
                resolve();
            });
        });

        // Check and migrate each table
        const tableExists = async (tableName) => {
            return new Promise((resolve, reject) => {
                oldDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
                    if (err) reject(err);
                    else resolve(!!row);
                });
            });
        };

        // Migrate users
        if (await tableExists('users')) {
            const users = await new Promise((resolve, reject) => {
                oldDb.all('SELECT * FROM users', (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            console.log(`Found ${users.length} users to migrate...`);
            for (const user of users) {
                await new Promise((resolve, reject) => {
                    newDb.run(`INSERT OR REPLACE INTO users 
                        (id, username, password, email, name, phone, bio, profile_pic, created_at) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user.id, user.username, user.password, user.email, user.name, user.phone, user.bio, user.profile_pic, user.created_at],
                        err => err ? reject(err) : resolve()
                    );
                });
            }
            console.log(`Migrated ${users.length} users successfully`);
        }

        // Migrate listings
        if (await tableExists('listings')) {
            const listings = await new Promise((resolve, reject) => {
                oldDb.all('SELECT * FROM listings', (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            console.log(`Found ${listings.length} listings to migrate...`);
            for (const listing of listings) {
                await new Promise((resolve, reject) => {
                    newDb.run(`INSERT OR REPLACE INTO listings 
                        (id, user_id, location, rent_amount, room_type, available_date, roommates_needed, 
                        amenities, house_rules, contact_preferences, status, created_at) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [listing.id, listing.user_id, listing.location, listing.rent_amount, 
                        listing.room_type, listing.available_date, listing.roommates_needed,
                        listing.amenities, listing.house_rules, listing.contact_preferences, 
                        listing.status || 'active', listing.created_at],
                        err => err ? reject(err) : resolve()
                    );
                });
            }
            console.log(`Migrated ${listings.length} listings successfully`);
        }

        // Migrate applications
        if (await tableExists('applications')) {
            const applications = await new Promise((resolve, reject) => {
                oldDb.all('SELECT * FROM applications', (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            console.log(`Found ${applications.length} applications to migrate...`);
            for (const app of applications) {
                await new Promise((resolve, reject) => {
                    newDb.run(`INSERT OR REPLACE INTO applications 
                        (id, listing_id, user_id, status, created_at) 
                        VALUES (?, ?, ?, ?, ?)`,
                        [app.id, app.listing_id, app.user_id, app.status || 'pending', app.created_at],
                        err => err ? reject(err) : resolve()
                    );
                });
            }
            console.log(`Migrated ${applications.length} applications successfully`);
        }

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
        
        // Clean up
        await closeConnection(oldDb);
        await closeConnection(newDb);
        
        // Restore backup
        if (fs.existsSync('database.sqlite')) {
            fs.unlinkSync('database.sqlite');
        }
        fs.copyFileSync(backupFile, 'database.sqlite');
        console.log('Restored database from backup due to migration failure');
        
        process.exit(1);
    } finally {
        // Close connections
        await closeConnection(oldDb);
        await closeConnection(newDb);
    }
}

// Run migration
migrate().catch(console.error);