const shopifyService = require('./shopifyService');
const { Product, ProductOption, ProductOptionValue, ProductVariant, ProductVariantOptionValue, Store, ProductStore, VariantStore } = require('../models');
const db = require('../models');

class ProductSyncService {
    /**
     * Sync single product to single store
     */
    async syncProductToStore(product, store, locationIds = []) {
        try {
            console.log(`Syncing product ${product.id} to store ${store.shop_domain}`);

            // Load full product data with options and variants
            const fullProduct = await Product.findByPk(product.id, {
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
                    }
                ]
            });

            // Transform data for Shopify
            const productData = this.transformProductForShopify(fullProduct);

            // Create or update product_store record
            let productStore = await ProductStore.findOne({
                where: {
                    product_id: product.id,
                    store_id: store.id
                }
            });

            if (!productStore) {
                productStore = await ProductStore.create({
                    product_id: product.id,
                    store_id: store.id,
                    sync_status: 'pending'
                });
            } else {
                productStore.sync_status = 'pending';
                productStore.error_message = null;
                await productStore.save();
            }

            // Create product in Shopify
            const shopifyProduct = await shopifyService.createProductInShopify(store, productData);

            // Extract Shopify product ID
            const shopifyProductId = shopifyProduct.id.split('/').pop();

            // Update product_store with success
            productStore.shopify_product_id = shopifyProductId;
            productStore.sync_status = 'synced';
            productStore.synced_at = new Date();
            await productStore.save();

            // Create/update variant_stores for tracking
            const variantEdges = shopifyProduct.variants.edges;
            for (let i = 0; i < fullProduct.variants.length; i++) {
                const localVariant = fullProduct.variants[i];
                const shopifyVariantNode = variantEdges[i]?.node;

                if (shopifyVariantNode) {
                    const shopifyVariantId = shopifyVariantNode.id.split('/').pop();
                    const shopifyInventoryItemId = shopifyVariantNode.inventoryItem.id.split('/').pop();

                    await VariantStore.upsert({
                        variant_id: localVariant.id,
                        store_id: store.id,
                        product_store_id: productStore.id,
                        shopify_variant_id: shopifyVariantId,
                        shopify_inventory_item_id: shopifyInventoryItemId,
                        sync_status: 'synced',
                        synced_at: new Date()
                    });
                }
            }

            return {
                success: true,
                store_id: store.id,
                shop_domain: store.shop_domain,
                shopify_product_id: shopifyProductId
            };
        } catch (error) {
            console.error(`Error syncing to ${store.shop_domain}:`, error);

            // Update product_store with error
            const productStore = await ProductStore.findOne({
                where: {
                    product_id: product.id,
                    store_id: store.id
                }
            });

            if (productStore) {
                productStore.sync_status = 'failed';
                productStore.error_message = error.message;
                await productStore.save();
            }

            return {
                success: false,
                store_id: store.id,
                shop_domain: store.shop_domain,
                error: error.message
            };
        }
    }

    /**
     * Sync product to all active stores
     */
    async syncProductToAllStores(product, locationIds = []) {
        const activeStores = await Store.findAll({
            where: { is_active: true }
        });

        const results = [];
        for (const store of activeStores) {
            const result = await this.syncProductToStore(product, store, locationIds);
            results.push(result);
        }

        return results;
    }

    /**
     * Sync product to selected stores
     */
    async syncProductToSelectedStores(product, storeIds, locationIds = []) {
        const stores = await Store.findAll({
            where: {
                id: storeIds,
                is_active: true
            }
        });

        const results = [];
        for (const store of stores) {
            const result = await this.syncProductToStore(product, store, locationIds);
            results.push(result);
        }

        return results;
    }

    /**
     * Bulk sync multiple products
     */
    async bulkSyncProducts(productIds, storeIds = null, locationIds = []) {
        const products = await Product.findAll({
            where: { id: productIds }
        });

        const results = [];

        for (const product of products) {
            let productResults;

            if (storeIds && storeIds.length > 0) {
                productResults = await this.syncProductToSelectedStores(product, storeIds, locationIds);
            } else {
                productResults = await this.syncProductToAllStores(product, locationIds);
            }

            results.push({
                product_id: product.id,
                product_title: product.title,
                stores: productResults
            });
        }

        return results;
    }

    /**
     * Transform product data for Shopify GraphQL
     */
    transformProductForShopify(product) {
        const options = product.options.map(opt => ({
            name: opt.name,
            position: opt.position,
            values: opt.values.map(val => val.value)
        }));

        const variants = product.variants.map(variant => {
            const optionValues = variant.optionValues.map(optVal => ({
                optionName: optVal.option.name,
                value: optVal.value.value
            }));

            return {
                title: variant.title,
                sku: variant.sku,
                barcode: variant.barcode,
                price: variant.price,
                compare_at_price: variant.compare_at_price,
                inventory_quantity: variant.inventory_quantity,
                weight: variant.weight,
                weight_unit: variant.weight_unit,
                optionValues
            };
        });

        return {
            title: product.title,
            description: product.description,
            vendor: product.vendor,
            product_type: product.product_type,
            status: product.status,
            options,
            variants
        };
    }
}

module.exports = new ProductSyncService();
