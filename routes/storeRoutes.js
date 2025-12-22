const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// Get all stores
router.get('/', storeController.getStores);

// Get single store
router.get('/:id', storeController.getStoreById);

// Update store status
router.patch('/:id/status', storeController.updateStoreStatus);

module.exports = router;
