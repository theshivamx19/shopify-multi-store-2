/**
 * Example: How to create products with images
 * 
 * This file demonstrates different ways to attach images to Shopify products
 * using the new media upload functionality.
 */

const shopifyService = require('./services/shopifyService');

// Example 1: Create product with external image URLs (SIMPLEST)
async function createProductWithExternalImages(store) {
    const productData = {
        title: "Cool T-Shirt",
        description: "An awesome t-shirt with great design",
        vendor: "My Brand",
        product_type: "Apparel",
        status: "active",
        options: [
            { name: "Size", values: ["S", "M", "L"] },
            { name: "Color", values: ["Red", "Blue"] }
        ],
        variants: [
            {
                optionValues: [
                    { optionName: "Size", value: "S" },
                    { optionName: "Color", value: "Red" }
                ],
                price: 29.99,
                sku: "TSHIRT-S-RED",
                inventory_quantity: 10
            },
            {
                optionValues: [
                    { optionName: "Size", value: "M" },
                    { optionName: "Color", value: "Red" }
                ],
                price: 29.99,
                sku: "TSHIRT-M-RED",
                inventory_quantity: 15
            }
        ],
        // 🎯 Images will be automatically attached after product creation
        images: [
            {
                url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png",
                alt: "Front view of t-shirt"
            },
            {
                url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png",
                alt: "Back view of t-shirt"
            }
        ]
    };

    try {
        const product = await shopifyService.createProductInShopify(store, productData);
        console.log('✅ Product created with images:', product.id);
        return product;
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Example 2: Add images to existing product
async function addImagesToExistingProduct(store, productId) {
    const mediaItems = [
        {
            url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png",
            alt: "Product front view",
            mediaContentType: "IMAGE"
        },
        {
            url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_medium.png",
            alt: "Product side view",
            mediaContentType: "IMAGE"
        }
    ];

    try {
        const result = await shopifyService.attachMediaToProduct(store, productId, mediaItems);
        console.log('✅ Images attached successfully');
        console.log('Media status:', result.media.map(m => ({
            type: m.mediaContentType,
            status: m.status
        })));
        return result;
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Example 3: Upload local file to Shopify (Advanced)
async function uploadLocalFileToProduct(store, productId, localFilePath) {
    const fs = require('fs');
    const path = require('path');

    try {
        // Step 1: Get file information
        const stats = fs.statSync(localFilePath);
        const filename = path.basename(localFilePath);
        const ext = path.extname(localFilePath).toLowerCase();

        // Determine MIME type based on extension
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';

        console.log(`📤 Uploading ${filename} (${stats.size} bytes)...`);

        // Step 2: Create staged upload URL
        const stagedTargets = await shopifyService.createStagedUploads(store, [
            {
                filename: filename,
                mimeType: mimeType,
                fileSize: stats.size,
                resource: "IMAGE"
            }
        ]);

        // Step 3: Upload the file
        const fileBuffer = fs.readFileSync(localFilePath);
        const resourceUrl = await shopifyService.uploadFileToStaged(
            stagedTargets[0],
            fileBuffer
        );

        console.log('✅ File uploaded to Shopify');

        // Step 4: Attach to product
        const result = await shopifyService.attachMediaToProduct(
            store,
            productId,
            [
                {
                    url: resourceUrl,
                    alt: `Product image - ${filename}`,
                    mediaContentType: "IMAGE"
                }
            ]
        );

        console.log('✅ Image attached to product');
        return result;
    } catch (error) {
        console.error('❌ Error uploading file:', error.message);
        throw error;
    }
}

// Example 4: Batch upload multiple local files
async function uploadMultipleLocalFiles(store, productId, filePaths) {
    const fs = require('fs');
    const path = require('path');

    try {
        // Prepare file info for all files
        const filesInfo = filePaths.map(filePath => {
            const stats = fs.statSync(filePath);
            const filename = path.basename(filePath);
            const ext = path.extname(filePath).toLowerCase();

            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp'
            };

            return {
                path: filePath,
                filename: filename,
                mimeType: mimeTypes[ext] || 'image/jpeg',
                fileSize: stats.size
            };
        });

        console.log(`📤 Uploading ${filesInfo.length} files...`);

        // Create staged uploads for all files
        const stagedTargets = await shopifyService.createStagedUploads(
            store,
            filesInfo.map(f => ({
                filename: f.filename,
                mimeType: f.mimeType,
                fileSize: f.fileSize,
                resource: "IMAGE"
            }))
        );

        // Upload all files
        const resourceUrls = [];
        for (let i = 0; i < filesInfo.length; i++) {
            const fileBuffer = fs.readFileSync(filesInfo[i].path);
            const resourceUrl = await shopifyService.uploadFileToStaged(
                stagedTargets[i],
                fileBuffer
            );
            resourceUrls.push(resourceUrl);
            console.log(`✅ Uploaded ${filesInfo[i].filename}`);
        }

        // Attach all images to product
        const mediaItems = resourceUrls.map((url, index) => ({
            url: url,
            alt: `Product image ${index + 1}`,
            mediaContentType: "IMAGE"
        }));

        const result = await shopifyService.attachMediaToProduct(
            store,
            productId,
            mediaItems
        );

        console.log(`✅ All ${filesInfo.length} images attached to product`);
        return result;
    } catch (error) {
        console.error('❌ Error uploading files:', error.message);
        throw error;
    }
}

// Export examples
module.exports = {
    createProductWithExternalImages,
    addImagesToExistingProduct,
    uploadLocalFileToProduct,
    uploadMultipleLocalFiles
};

// Usage example (uncomment to test):
/*
const Store = require('./models/Store');

async function test() {
  // Get your store from database
  const store = await Store.findOne({ where: { shop_domain: 'your-store.myshopify.com' } });
  
  // Example 1: Create product with images
  await createProductWithExternalImages(store);
  
  // Example 2: Add images to existing product
  await addImagesToExistingProduct(store, 'gid://shopify/Product/1234567890');
  
  // Example 3: Upload local file
  await uploadLocalFileToProduct(store, 'gid://shopify/Product/1234567890', './uploads/image.jpg');
  
  // Example 4: Upload multiple files
  await uploadMultipleLocalFiles(store, 'gid://shopify/Product/1234567890', [
    './uploads/image1.jpg',
    './uploads/image2.jpg',
    './uploads/image3.jpg'
  ]);
}

test().catch(console.error);
*/
