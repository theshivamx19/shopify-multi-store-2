const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// Sync product to all active stores
router.post('/products/:id/sync', syncController.syncToAllStores);

// Sync product to selected stores
router.post('/products/:id/sync/selective', syncController.syncToSelectedStores);

// Bulk sync multiple products
router.post('/products/bulk-sync', syncController.bulkSync);

// Get sync status for a product
router.get('/products/:id/sync-status', syncController.getSyncStatus);

module.exports = router;
