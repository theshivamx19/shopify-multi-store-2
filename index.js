const express = require('express');
const session = require('express-session');
require('dotenv').config();

const db = require('./models');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const syncRoutes = require('./routes/syncRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
    secret: process.env.SHOPIFY_API_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Shopify Multi-Store Product Sync API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            stores: '/api/stores',
            products: '/api/products',
            sync: '/api/sync'
        }
    });
});

app.use('/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sync', syncRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Database connection and server startup
db.sequelize
    .authenticate()
    .then(() => {
        console.log('✅ Database connection established successfully');

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Database: ${process.env.DB_NAME || 'shopify_multi_store'}`);
            console.log(`\n📚 API Endpoints:`);
            console.log(`   - OAuth Install: http://localhost:${PORT}/auth/install?shop=your-store.myshopify.com`);
            console.log(`   - Stores: http://localhost:${PORT}/api/stores`);
            console.log(`   - Products: http://localhost:${PORT}/api/products`);
            console.log(`   - Sync: http://localhost:${PORT}/api/sync`);
            console.log();
        });
    })
    .catch((error) => {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    });

module.exports = app;
