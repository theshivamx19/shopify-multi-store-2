const shopify = require('../config/shopify');
const axios = require('axios');

class ShopifyService {
  /**
   * Create GraphQL client for a store
   */
  createGraphQLClient(store) {
    // Create a proper GraphQL client with store credentials
    return new shopify.clients.Graphql({
      session: {
        shop: store.shop_domain,
        accessToken: store.access_token
      }
    });
  }

  /**
   * Add variants with media to an EXISTING product
   * Uses productVariantsBulkCreate - SINGLE CALL approach
   * as recommended by Shopify AI assistant
   */
  async addVariantsToProduct(store, productId, variantsData, images = [], productOptions = []) {
    try {
      const client = this.createGraphQLClient(store);

      // Get first active location
      const locations = await this.getLocations(store);
      const activeLocation = locations.find(loc => loc.isActive);

      if (!activeLocation) {
        throw new Error('No active location found for store');
      }

      // Create a map of option names to option IDs
      const optionNameToId = {};
      productOptions.forEach(opt => {
        optionNameToId[opt.name] = opt.id;
      });

      // Prepare media array from images
      const mediaInput = images && images.length > 0
        ? images.map(img => ({
          originalSource: img.src,
          alt: img.alt || '',
          mediaContentType: "IMAGE"
        }))
        : [];

      // Prepare variants with mediaSrc
      const variantsInput = variantsData.map(variant => {
        const variantInput = {
          optionValues: variant.optionValues.map(ov => ({
            optionId: optionNameToId[ov.optionName],  // Use optionId instead of optionName
            name: ov.value
          })),
          price: variant.price.toString(),
          compareAtPrice: variant.compare_at_price ? variant.compare_at_price.toString() : null,
          barcode: variant.barcode || null,
          inventoryPolicy: "DENY",
          inventoryQuantities: [{
            availableQuantity: variant.inventory_quantity || 0,
            locationId: activeLocation.id
          }],
          inventoryItem: {
            sku: variant.sku || '',
            tracked: true
          }
        };

        // Link variant to its image(s) using mediaSrc
        if (variant.image_src) {
          variantInput.mediaSrc = [variant.image_src];
        }

        return variantInput;
      });

      const mutation = `
        mutation ProductVariantsBulkCreateWithMedia(
          $productId: ID!,
          $media: [CreateMediaInput!],
          $variants: [ProductVariantsBulkInput!]!
        ) {
          productVariantsBulkCreate(productId: $productId, media: $media, variants: $variants) {
            product {
              id
              title
            }
            productVariants {
              id
              title
              sku
              media(first: 5) {
                edges {
                  node {
                    __typename
                    ... on MediaImage {
                      id
                      image {
                        url
                      }
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        productId,
        media: mediaInput,
        variants: variantsInput
      };

      console.log('=== Product Variants Bulk Create Debug ===');
      console.log('Product ID:', productId);
      console.log('Number of variants:', variantsInput.length);
      console.log('Variants input:', JSON.stringify(variantsInput, null, 2));
      console.log('==========================================');

      const response = await client.request(mutation, { variables });

      if (response.data.productVariantsBulkCreate.userErrors.length > 0) {
        throw new Error(JSON.stringify(response.data.productVariantsBulkCreate.userErrors));
      }

      return response.data.productVariantsBulkCreate;
    } catch (error) {
      console.error('Error adding variants to product:', error);
      throw error;
    }
  }

  /**
   * Fetch all locations for a store
   */
  async getLocations(store) {
    try {
      const client = this.createGraphQLClient(store);

      const query = `
        query getLocations {
          locations(first: 250) {
            edges {
              node {
                id
                name
                isActive
              }
            }
          }
        }
      `;

      const response = await client.request(query);
      return response.data.locations.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Create product in Shopify using GraphQL
   * Uses productSet mutation - Creates product with all options and variants in ONE call
   * This avoids the cyclic errors from productCreate + productVariantsBulkCreate approach
   */
  async createProductInShopify(store, productData) {
    try {
      const client = this.createGraphQLClient(store);

      const { title, description, vendor, product_type, status, options, variants, images } = productData;

      // Get first active location for inventory
      const locations = await this.getLocations(store);
      const activeLocation = locations.find(loc => loc.isActive);

      if (!activeLocation) {
        throw new Error('No active location found for store');
      }

      // Prepare variants for productSet - uses optionName (not optionId!)
      const variantsInput = variants.map(variant => ({
        optionValues: variant.optionValues.map(ov => ({
          optionName: ov.optionName,
          name: ov.value
        })),
        price: variant.price.toString(),
        compareAtPrice: variant.compare_at_price ? variant.compare_at_price.toString() : null,
        barcode: variant.barcode || null,
        inventoryPolicy: "DENY",
        inventoryQuantities: [{
          locationId: activeLocation.id,
          name: "available",  // productSet uses 'name' not 'availableQuantity'
          quantity: variant.inventory_quantity || 0
        }],
        inventoryItem: {
          sku: variant.sku || '',
          tracked: true
        }
      }));

      console.log('Creating product with productSet mutation');
      console.log('Options:', JSON.stringify(options, null, 2));
      console.log('Variants count:', variantsInput.length);

      const mutation = `
        mutation productSet($input: ProductSetInput!, $synchronous: Boolean!) {
          productSet(synchronous: $synchronous, input: $input) {
            product {
              id
              title
              options {
                id
                name
                position
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    inventoryItem {
                      id
                    }
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        synchronous: true,
        input: {
          title,
          descriptionHtml: description || '',
          vendor: vendor || '',
          productType: product_type || '',
          status: status ? status.toUpperCase() : 'ACTIVE',
          productOptions: options,
          variants: variantsInput
        }
      };
      console.log("Variables creation========================>")
      console.log(JSON.stringify(variables, null, 2), 'here are the variables ============>')
      const response = await client.request(mutation, { variables });

      if (response.data.productSet.userErrors.length > 0) {
        throw new Error(JSON.stringify(response.data.productSet.userErrors));
      }

      const product = response.data.productSet.product;
      console.log(`✅ Product created successfully with ${product.variants.edges.length} variants`);

      return product;
    } catch (error) {
      console.error('Error creating product in Shopify:', error);
      throw error;
    }
  }

  /**
   * Set inventory quantities for a variant
   */
  async setInventoryQuantities(store, inventoryItemId, locationIds, quantity) {
    try {
      const client = this.createGraphQLClient(store);

      // If no location IDs provided, get all active locations
      let targetLocationIds = locationIds;
      if (!targetLocationIds || targetLocationIds.length === 0) {
        const locations = await this.getLocations(store);
        targetLocationIds = locations.filter(loc => loc.isActive).map(loc => loc.id);
      }

      const inventoryAdjustments = targetLocationIds.map(locationId => ({
        inventoryItemId,
        locationId,
        delta: quantity
      }));

      const mutation = `
        mutation inventoryBulkAdjustQuantityAtLocation($inventoryItemAdjustments: [InventoryAdjustItemInput!]!) {
          inventoryBulkAdjustQuantityAtLocation(inventoryItemAdjustments: $inventoryItemAdjustments) {
            inventoryLevels {
              id
              available
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        inventoryItemAdjustments: inventoryAdjustments
      };

      const response = await client.request(mutation, { variables });

      return response.data;
    } catch (error) {
      console.error('Error setting inventory:', error);
      throw error;
    }
  }
}

module.exports = new ShopifyService();
