// listingRoutes.js
const upload = require('../middleware/imageUpload');
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');

// @route   POST /api/listings
// @desc    Create a new listing (developers only)
router.post('/', auth, (req, res, next) => {
    if (req.user.role !== 'developer') {
        return res.status(403).json({ message: 'Only developers can create listings' });
    }
    next();
}, listingController.createListing);

// @route   GET /api/listings
// @desc    Get all listings
router.get('/', listingController.getAllListings);

// @route   GET /api/listings/search
// @desc    Search listings
router.get('/search', listingController.searchListings);

// @route   GET /api/listings/trending
// @desc    Get trending listings
router.get('/trending', listingController.getTrendingListings);

// @route   GET /api/listings/analytics
// @desc    Get developer analytics (developers only)
router.get('/analytics', auth, (req, res, next) => {
    if (req.user.role !== 'developer') {
        return res.status(403).json({ message: 'Only developers can access analytics' });
    }
    next();
}, listingController.getDeveloperAnalytics);

// @route   GET /api/listings/:id
// @desc    Get a single listing
router.get('/:id', listingController.getListing);

// @route   PUT /api/listings/:id
// @desc    Update a listing
router.put('/:id', auth, listingController.updateListing);

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
router.delete('/:id', auth, listingController.deleteListing);

// @route   POST /api/listings/:id/images
// @desc    Upload images for a listing
router.post('/:id/images', auth, upload.array('images', 5), listingController.uploadImages);

module.exports = router;