const shopify = require('../config/shopify');
const { Store } = require('../models');

// Initiate OAuth flow
exports.initiateOAuth = async (req, res, next) => {
    try {
        const { shop } = req.query;
        console.log("shop", shop);

        if (!shop) {
            return res.status(400).json({ error: 'Shop parameter is required' });
        }

        // Sanitize shop domain
        const sanitizedShop = shopify.utils.sanitizeShop(shop, true);

        if (!sanitizedShop) {
            return res.status(400).json({ error: 'Invalid shop domain' });
        }

        // Generate nonce for state verification
        const nonce = require('crypto').randomBytes(16).toString('hex');
        req.session.nonce = nonce;
        req.session.shop = sanitizedShop;

        // Build authorization URL manually
        const authUrl = `https://${sanitizedShop}/admin/oauth/authorize?` +
            `client_id=${process.env.SHOPIFY_API_KEY}&` +
            `scope=${process.env.SHOPIFY_SCOPES}&` +
            `redirect_uri=${process.env.HOST}/auth/callback&` +
            `state=${nonce}`;

        console.log('Auth URL:', authUrl);
        res.redirect(authUrl);

    } catch (error) {
        console.error('OAuth initiation error:', error);
        next(error);
    }
};

// Handle OAuth callback
// Handle OAuth callback
exports.handleOAuthCallback = async (req, res, next) => {
    try {
        const { code, state, shop, hmac } = req.query;

        // Validate required parameters
        if (!code || !shop) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Verify state to prevent CSRF attacks
        // if (state !== req.session.nonce) {
        //     return res.status(403).json({
        //         error: 'Invalid state parameter'
        //     });
        // }

        // Verify shop matches session
        // const sanitizedShop = shopify.utils.sanitizeShop(shop, true);
        // if (sanitizedShop == req.session.shop) {
        //     return res.status(403).json({
        //         error: 'Shop mismatch'
        //     });
        // }

        // Verify HMAC signature
        // const queryParams = { ...req.query };
        // delete queryParams.hmac;

        // const isValid = shopify.utils.validateHmac(queryParams, hmac, process.env.SHOPIFY_API_SECRET);

        // if (!isValid) {
        //     return res.status(403).json({
        //         error: 'Invalid HMAC signature'
        //     });
        // }

        // Exchange code for access token
        const tokenResponse = await fetch(
            `https://${shop}/admin/oauth/access_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.SHOPIFY_API_KEY,
                    client_secret: process.env.SHOPIFY_API_SECRET,
                    code: code,
                }),
            }
        );

        if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for access token');
        }

        const tokenData = await tokenResponse.json();
        const { access_token, scope } = tokenData;

        // Save or update store in database
        const [store, created] = await Store.upsert({
            shop_domain: shop,
            access_token: access_token,
            scopes: scope,
            is_active: true
        }, {
            returning: true
        });

        console.log(`Store ${created ? 'created' : 'updated'}:`, shop);

        // Clear session data
        delete req.session.nonce;
        delete req.session.shop;

        res.json({
            success: true,
            message: `Store ${created ? 'connected' : 'updated'} successfully`,
            store: {
                id: store.id,
                shop_domain: store.shop_domain,
                is_active: store.is_active
            }
        });

    } catch (error) {
        console.error('OAuth callback error:', error);

        // Clear session on error
        delete req.session.nonce;
        delete req.session.shop;

        next(error);
    }
};


// Get all stores
exports.getStores = async (req, res, next) => {
    try {
        const { is_active } = req.query;
        const where = {};

        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        const stores = await Store.findAll({
            where,
            attributes: ['id', 'shop_domain', 'is_active', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count: stores.length,
            stores
        });
    } catch (error) {
        next(error);
    }
};

// Get single store
exports.getStoreById = async (req, res, next) => {
    try {
        const store = await Store.findByPk(req.params.id, {
            attributes: ['id', 'shop_domain', 'is_active', 'scopes', 'created_at', 'updated_at']
        });

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        res.json({
            success: true,
            store
        });
    } catch (error) {
        next(error);
    }
};

// Update store status
exports.updateStoreStatus = async (req, res, next) => {
    try {
        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({ error: 'is_active field is required' });
        }

        const store = await Store.findByPk(req.params.id);

        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        store.is_active = is_active;
        await store.save();

        res.json({
            success: true,
            message: `Store ${is_active ? 'activated' : 'deactivated'} successfully`,
            store: {
                id: store.id,
                shop_domain: store.shop_domain,
                is_active: store.is_active
            }
        });
    } catch (error) {
        next(error);
    }
};
