// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// @route   POST /api/applications/listings/:listingId
// @desc    Submit application for a listing
router.post('/listings/:listingId', auth, applicationController.submitApplication);

// @route   GET /api/applications/me
// @desc    Get my applications
router.get('/me', auth, applicationController.getMyApplications);

// @route   GET /api/applications/listings/:listingId
// @desc    Get applications for a specific listing (only for listing owner)
router.get('/listings/:listingId', auth, applicationController.getListingApplications);

// @route   PUT /api/applications/:id
// @desc    Update application status
router.put('/:id', auth, applicationController.updateApplicationStatus);

module.exports = router;