// routes/roommateRoutes.js
const express = require('express');
const router = express.Router();
const roommateController = require('../controllers/roommateController');
const auth = require('../middleware/auth');

// @route   POST /api/roommates/profile
// @desc    Create or update roommate profile
router.post('/profile', auth, roommateController.upsertProfile);

// @route   GET /api/roommates/profile
// @desc    Get my roommate profile
router.get('/profile', auth, roommateController.getMyProfile);

// @route   GET /api/roommates/matches
// @desc    Find matching roommates
router.get('/matches', auth, roommateController.findMatches);

// @route   GET /api/roommates/browse
// @desc    Browse all roommate profiles
router.get('/browse', auth, roommateController.browseProfiles);

module.exports = router;
