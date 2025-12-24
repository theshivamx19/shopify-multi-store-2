const productSyncService = require('../services/productSyncService');
const { Product, Store, ProductStore } = require('../models');

// Sync product to all active stores
exports.syncToAllStores = async (req, res, next) => {
    try {
        const { id: productId } = req.params;
        const { locationIds = [] } = req.body;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const results = await productSyncService.syncProductToAllStores(product, locationIds);

        res.json({
            success: true,
            message: 'Product sync initiated for all active stores',
            results
        });
    } catch (error) {
        next(error);
    }
};

// Sync product to selected stores
exports.syncToSelectedStores = async (req, res, next) => {
    try {
        const { id: productId } = req.params;
        const { storeIds, locationIds = [] } = req.body;

        if (!storeIds || !Array.isArray(storeIds) || storeIds.length === 0) {
            return res.status(400).json({ error: 'storeIds array is required' });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const results = await productSyncService.syncProductToSelectedStores(product, storeIds, locationIds);

        res.json({
            success: true,
            message: `Product sync initiated for ${storeIds.length} store(s)`,
            results
        });
    } catch (error) {
        next(error);
    }
};

// Bulk sync multiple products
exports.bulkSync = async (req, res, next) => {
    try {
        const { productIds, storeIds, locationIds = [] } = req.body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'productIds array is required' });
        }

        const results = await productSyncService.bulkSyncProducts(productIds, storeIds, locationIds);

        res.json({
            success: true,
            message: `Bulk sync initiated for ${productIds.length} product(s)`,
            results
        });
    } catch (error) {
        next(error.message);
    }
};

// Get sync status for a product
exports.getSyncStatus = async (req, res, next) => {
    try {
        const { id: productId } = req.params;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const syncStatus = await ProductStore.findAll({
            where: { product_id: productId },
            include: [
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'shop_domain', 'is_active']
                }
            ],
            order: [['updated_at', 'DESC']]
        });

        res.json({
            success: true,
            product_id: productId,
            sync_status: syncStatus
        });
    } catch (error) {
        next(error);
    }
};
