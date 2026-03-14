const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const adminAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Server Error' });
            }
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin only.' });
            }
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = adminAuth;
