const shopify = require('../config/shopify');
const axios = require('axios');

class ShopifyService {
    /**
     * Create a Shopify session from store credentials
     */
    createSession(store) {
        return shopify.session.customAppSession(store.shop_domain);
    }

    /**
     * Create GraphQL client for a store
     */
    createGraphQLClient(store) {
        const session = this.createSession(store);
        return new shopify.clients.Graphql({
            session: {
                ...session,
                accessToken: store.access_token
            }
        });
    }

    /**
     * Build GraphQL mutation for creating a product
     */
    buildProductCreateMutation(productData) {
        const { title, description, vendor, product_type, status, options, variants, images } = productData;

        // Build options array
        const optionsInput = options && options.length > 0
            ? options.map(opt => `"${opt.name}"`).join(', ')
            : '';

        // Build variants array
        const variantsInput = variants && variants.length > 0
            ? variants.map(variant => {
                const optionValues = variant.optionValues.map(ov => `"${ov.value}"`);
                return `{
            price: "${variant.price}",
            sku: "${variant.sku || ''}",
            inventoryQuantities: {
              availableQuantity: ${variant.inventory_quantity || 0},
              locationId: "gid://shopify/Location/LOCATION_ID_PLACEHOLDER"
            },
            optionValues: [${optionValues.join(', ')}]
          }`;
            }).join(',\n')
            : '';

        const mutation = `
      mutation createProduct {
        productCreate(
          input: {
            title: "${title}",
            descriptionHtml: "${description || ''}",
            vendor: "${vendor || ''}",
            productType: "${product_type || ''}",
            status: ${status ? status.toUpperCase() : 'ACTIVE'},
            options: [${optionsInput}],
            variants: [${variantsInput}]
          }
        ) {
          product {
            id
            title
            variants(first: 100) {
              edges {
                node {
                  id
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

        return mutation;
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

            const response = await client.query({ data: query });
            return response.body.data.locations.edges.map(edge => edge.node);
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw error;
        }
    }

    /**
     * Create product in Shopify using GraphQL
     */
    async createProductInShopify(store, productData) {
        try {
            const client = this.createGraphQLClient(store);

            // Get first active location if no location IDs provided
            const locations = await this.getLocations(store);
            const activeLocation = locations.find(loc => loc.isActive);

            if (!activeLocation) {
                throw new Error('No active location found for store');
            }

            // Build complete product input for GraphQL
            const { title, description, vendor, product_type, status, options, variants } = productData;

            const optionsFormatted = options.map(opt => opt.name);

            const variantsFormatted = variants.map(variant => ({
                price: variant.price.toString(),
                sku: variant.sku || '',
                inventoryQuantities: [{
                    availableQuantity: variant.inventory_quantity || 0,
                    locationId: activeLocation.id
                }],
                optionValues: variant.optionValues.map(ov => ({
                    optionName: ov.optionName,
                    name: ov.value
                }))
            }));

            const mutation = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              variants(first: 100) {
                edges {
                  node {
                    id
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
                input: {
                    title,
                    descriptionHtml: description || '',
                    vendor: vendor || '',
                    productType: product_type || '',
                    status: status ? status.toUpperCase() : 'ACTIVE',
                    options: optionsFormatted,
                    variants: variantsFormatted
                }
            };

            const response = await client.query({
                data: {
                    query: mutation,
                    variables
                }
            });

            if (response.body.data.productCreate.userErrors.length > 0) {
                throw new Error(JSON.stringify(response.body.data.productCreate.userErrors));
            }

            return response.body.data.productCreate.product;
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

            const response = await client.query({
                data: {
                    query: mutation,
                    variables: {
                        inventoryItemAdjustments: inventoryAdjustments
                    }
                }
            });

            return response.body.data;
        } catch (error) {
            console.error('Error setting inventory:', error);
            throw error;
        }
    }
}

module.exports = new ShopifyService();
