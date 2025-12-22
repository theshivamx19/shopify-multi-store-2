const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Initiate Shopify OAuth flow
router.get('/install', storeController.initiateOAuth);

// OAuth callback
router.get('/callback', storeController.handleOAuthCallback);

module.exports = router;
