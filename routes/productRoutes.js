const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Create product(s) - supports bulk (1-50 products)
router.post('/', productController.createProducts);

// Get all products
router.get('/', productController.getProducts);

// Get single product
router.get('/:id', productController.getProductById);

// Update product
router.put('/:id', productController.updateProduct);

// Delete product (soft delete)
router.delete('/:id', productController.deleteProduct);

module.exports = router;
