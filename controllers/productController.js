const { Product, ProductOption, ProductOptionValue, ProductVariant, ProductVariantOptionValue, ProductImage } = require('../models');
const db = require('../models');

// Create bulk products (1-50)
exports.createProducts = async (req, res, next) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'products array is required and must not be empty' });
        }

        if (products.length > 50) {
            return res.status(400).json({ error: 'Maximum 50 products allowed per request' });
        }

        const createdProducts = [];

        for (const productData of products) {
            // Create product
            const product = await Product.create({
                title: productData.title,
                description: productData.description,
                vendor: productData.vendor,
                product_type: productData.product_type,
                status: productData.status || 'active',
                tags: productData.tags
            }, { transaction });

            // Create product options if provided
            if (productData.options && productData.options.length > 0) {
                for (const optionData of productData.options) {
                    const option = await ProductOption.create({
                        product_id: product.id,
                        name: optionData.name,
                        position: optionData.position || 1
                    }, { transaction });

                    // Create option values
                    if (optionData.values && optionData.values.length > 0) {
                        const optionValues = optionData.values.map((value, index) => ({
                            product_option_id: option.id,
                            value: value,
                            position: index + 1
                        }));
                        await ProductOptionValue.bulkCreate(optionValues, { transaction });
                    }
                }
            }

            // Create product variants
            if (productData.variants && productData.variants.length > 0) {
                for (const variantData of productData.variants) {
                    const variant = await ProductVariant.create({
                        product_id: product.id,
                        title: variantData.title,
                        sku: variantData.sku,
                        barcode: variantData.barcode,
                        price: variantData.price,
                        compare_at_price: variantData.compare_at_price,
                        inventory_quantity: variantData.inventory_quantity || 0,
                        weight: variantData.weight,
                        weight_unit: variantData.weight_unit || 'kg',
                        position: variantData.position || 1
                    }, { transaction });

                    // Map variant to option values
                    if (variantData.optionValues && variantData.optionValues.length > 0) {
                        for (const optionValueMapping of variantData.optionValues) {
                            // Find the option by name
                            const option = await ProductOption.findOne({
                                where: {
                                    product_id: product.id,
                                    name: optionValueMapping.optionName
                                },
                                transaction
                            });

                            if (option) {
                                // Find the option value
                                const optionValue = await ProductOptionValue.findOne({
                                    where: {
                                        product_option_id: option.id,
                                        value: optionValueMapping.value
                                    },
                                    transaction
                                });

                                if (optionValue) {
                                    await ProductVariantOptionValue.create({
                                        product_variant_id: variant.id,
                                        product_option_id: option.id,
                                        product_option_value_id: optionValue.id
                                    }, { transaction });
                                }
                            }
                        }
                    }
                }
            }

            // Create product images
            if (productData.images && productData.images.length > 0) {
                const images = productData.images.map((img, index) => ({
                    product_id: product.id,
                    url: img.url,
                    alt_text: img.alt_text,
                    position: img.position || index + 1
                }));
                await ProductImage.bulkCreate(images, { transaction });
            }

            createdProducts.push(product.id);
        }

        await transaction.commit();

        // Optional: Trigger sync if requested
        let syncResults = null;
        if (req.query.sync === 'true') {
            const productSyncService = require('../services/productSyncService');
            syncResults = await productSyncService.bulkSyncProducts(createdProducts);
        }

        res.status(201).json({
            success: true,
            message: `${createdProducts.length} product(s) created successfully`,
            product_ids: createdProducts,
            sync: syncResults
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating products:', error);
        next(error);
    }
};

// Get products with pagination
exports.getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, vendor } = req.query;
        const offset = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (vendor) where.vendor = vendor;

        const { count, rows: products } = await Product.findAndCountAll({
            where,
            include: [
                {
                    model: ProductOption,
                    as: 'options',
                    include: [{ model: ProductOptionValue, as: 'values' }]
                },
                {
                    model: ProductVariant,
                    as: 'variants'
                },
                {
                    model: ProductImage,
                    as: 'images'
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            },
            products
        });
    } catch (error) {
        next(error);
    }
};

// Get product by ID with full details
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductOption,
                    as: 'options',
                    include: [{ model: ProductOptionValue, as: 'values' }]
                },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [
                        {
                            model: ProductVariantOptionValue,
                            as: 'optionValues',
                            include: [
                                { model: ProductOption, as: 'option' },
                                { model: ProductOptionValue, as: 'value' }
                            ]
                        }
                    ]
                },
                {
                    model: ProductImage,
                    as: 'images'
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// Update product
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { title, description, vendor, product_type, status, tags } = req.body;

        if (title) product.title = title;
        if (description !== undefined) product.description = description;
        if (vendor !== undefined) product.vendor = vendor;
        if (product_type !== undefined) product.product_type = product_type;
        if (status) product.status = status;
        if (tags !== undefined) product.tags = tags;

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        next(error);
    }
};

// Delete product (archive)
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.status = 'archived';
        await product.save();

        res.json({
            success: true,
            message: 'Product archived successfully'
        });
    } catch (error) {
        next(error);
    }
};
