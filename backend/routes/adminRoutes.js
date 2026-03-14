const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// All admin routes require admin authentication
router.use(adminAuth);

// @route   GET /api/admin/verify
// @desc    Verify admin access
router.get('/verify', adminController.verifyAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
router.get('/dashboard', adminController.getDashboardStats);

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', adminController.getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', adminController.deleteUser);

// @route   GET /api/admin/listings
// @desc    Get all listings (including inactive)
router.get('/listings', adminController.getAllListings);

// @route   PUT /api/admin/listings/:id/status
// @desc    Update listing status
router.put('/listings/:id/status', adminController.updateListingStatus);

// @route   DELETE /api/admin/listings/:id
// @desc    Delete a listing permanently
router.delete('/listings/:id', adminController.deleteListing);

module.exports = router;
