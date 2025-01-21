// listingRoutes.js
const upload = require('../middleware/imageUpload');
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');

// @route   POST /api/listings
// @desc    Create a new listing
router.post('/', auth, listingController.createListing);

// @route   GET /api/listings
// @desc    Get all listings
router.get('/', listingController.getAllListings);

// @route   GET /api/listings/search
// @desc    Search listings
router.get('/search', listingController.searchListings);

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