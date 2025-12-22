const { shopifyApi, LogSeverity, ApiVersion } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

// Initialize Shopify API
const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    scopes: process.env.SHOPIFY_SCOPES?.split(',') || [
        'write_products',
        'read_products',
        'write_inventory',
        'read_inventory',
        'write_locations',
        'read_locations'
    ],
    hostName: process.env.HOST?.replace(/https?:\/\//, '') || 'localhost:8000',
    hostScheme: process.env.NODE_ENV === 'production' ? 'https' : 'http',
    apiVersion: '2025-01',
    isEmbeddedApp: false,
    logger: {
        level: process.env.NODE_ENV === 'development' ? LogSeverity.Debug : LogSeverity.Error
    }
});

module.exports = shopify;
