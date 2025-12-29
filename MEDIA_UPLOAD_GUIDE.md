# Shopify Product Media Upload Guide

This guide explains how to attach images and other media to your Shopify products using the newly added methods in `shopifyService.js`.

## Overview

Based on Shopify's official guidance, there are **two ways** to add media to products:

1. **Option A: External URLs** (Simpler) - Use images already hosted somewhere (CDN, S3, etc.)
2. **Option B: Upload Files** (Recommended for production) - Upload local files to Shopify first

## Prerequisites

Your Shopify app must have these scopes:
- ✅ `write_products` - To create products and attach media
- ✅ `read_products` - To fetch products/media later

## Option A: Using External Image URLs (Simplest)

If your images are already hosted online, you can attach them directly.

### Automatic Attachment During Product Creation

The easiest way is to include images when creating a product:

```javascript
const shopifyService = require('./services/shopifyService');

const productData = {
  title: "Cool T-Shirt",
  description: "An awesome t-shirt",
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
    }
    // ... more variants
  ],
  // 🎯 Add images here - they'll be automatically attached!
  images: [
    {
      url: "https://example.com/images/tshirt-front.jpg",
      alt: "Front view of t-shirt"
    },
    {
      url: "https://example.com/images/tshirt-back.jpg",
      alt: "Back view of t-shirt"
    }
  ]
};

// Create product - images will be attached automatically
const product = await shopifyService.createProductInShopify(store, productData);
console.log('Product created with images:', product.id);
```

### Manual Attachment to Existing Product

If you want to add images to an existing product:

```javascript
const productId = "gid://shopify/Product/1234567890";

const mediaItems = [
  {
    url: "https://example.com/image1.jpg",
    alt: "Product front view",
    mediaContentType: "IMAGE"
  },
  {
    url: "https://example.com/image2.jpg",
    alt: "Product side view",
    mediaContentType: "IMAGE"
  }
];

const result = await shopifyService.attachMediaToProduct(
  store,
  productId,
  mediaItems
);

console.log('Media attached:', result.media);
console.log('Media status:', result.media.map(m => m.status));
// Status can be: UPLOADED, PROCESSING, READY, FAILED
```

## Option B: Uploading Local Files (Advanced)

For uploading files from your server/app to Shopify, use the 3-step staged upload flow:

### Step 1: Create Staged Upload URLs

```javascript
const fs = require('fs');
const path = require('path');

// Prepare file information
const files = [
  {
    filename: "product-image.jpg",
    mimeType: "image/jpeg",
    fileSize: 345678, // Size in bytes (number, not string)
    resource: "IMAGE"
  }
];

// Get upload URLs from Shopify
const stagedTargets = await shopifyService.createStagedUploads(store, files);
console.log('Staged upload URL:', stagedTargets[0].url);
console.log('Resource URL (for later):', stagedTargets[0].resourceUrl);
```

### Step 2: Upload the File

```javascript
// Read your file
const filePath = path.join(__dirname, 'uploads', 'product-image.jpg');
const fileBuffer = fs.readFileSync(filePath);

// Upload to Shopify's staged URL
const resourceUrl = await shopifyService.uploadFileToStaged(
  stagedTargets[0],
  fileBuffer
);

console.log('File uploaded! Resource URL:', resourceUrl);
```

### Step 3: Attach to Product

```javascript
const productId = "gid://shopify/Product/1234567890";

// Use the resourceUrl from the upload
const mediaItems = [
  {
    url: resourceUrl, // This is the resourceUrl from step 2
    alt: "Product image",
    mediaContentType: "IMAGE"
  }
];

const result = await shopifyService.attachMediaToProduct(
  store,
  productId,
  mediaItems
);

console.log('Uploaded image attached to product!');
```

### Complete Upload Flow Example

```javascript
async function uploadAndAttachLocalImage(store, productId, localFilePath) {
  const fs = require('fs');
  const path = require('path');

  // Get file info
  const stats = fs.statSync(localFilePath);
  const filename = path.basename(localFilePath);
  
  // Step 1: Create staged upload
  const stagedTargets = await shopifyService.createStagedUploads(store, [
    {
      filename: filename,
      mimeType: "image/jpeg", // Adjust based on your file type
      fileSize: stats.size,
      resource: "IMAGE"
    }
  ]);

  // Step 2: Upload the file
  const fileBuffer = fs.readFileSync(localFilePath);
  const resourceUrl = await shopifyService.uploadFileToStaged(
    stagedTargets[0],
    fileBuffer
  );

  // Step 3: Attach to product
  const result = await shopifyService.attachMediaToProduct(
    store,
    productId,
    [
      {
        url: resourceUrl,
        alt: "Product image",
        mediaContentType: "IMAGE"
      }
    ]
  );

  return result;
}

// Usage
await uploadAndAttachLocalImage(
  store,
  "gid://shopify/Product/1234567890",
  "./uploads/my-product.jpg"
);
```

## Media Types Supported

You can attach different types of media:

```javascript
// Image
{
  url: "https://example.com/image.jpg",
  alt: "Product image",
  mediaContentType: "IMAGE"
}

// Video (Shopify-hosted)
{
  url: "https://shopify-staged-uploads.../video.mp4",
  alt: "Product demo video",
  mediaContentType: "VIDEO"
}

// External Video (YouTube/Vimeo)
{
  url: "https://www.youtube.com/watch?v=VIDEO_ID",
  alt: "Product review",
  mediaContentType: "EXTERNAL_VIDEO"
}

// 3D Model
{
  url: "https://example.com/model.glb",
  alt: "3D product model",
  mediaContentType: "MODEL_3D"
}
```

## Media Status

After attaching media, check the `status` field:

- **UPLOADED** - File received, not yet processed
- **PROCESSING** - Still being processed by Shopify
- **READY** - Safe to display on storefront
- **FAILED** - Something went wrong

```javascript
const result = await shopifyService.attachMediaToProduct(store, productId, mediaItems);

result.media.forEach(media => {
  console.log(`Media ${media.id}: ${media.status}`);
  if (media.status === 'FAILED') {
    console.error('This media failed to process');
  }
});
```

## Error Handling

Always check for `mediaUserErrors`:

```javascript
try {
  const result = await shopifyService.attachMediaToProduct(store, productId, mediaItems);
  
  if (result.mediaUserErrors && result.mediaUserErrors.length > 0) {
    console.error('Media errors:', result.mediaUserErrors);
    // Handle specific errors
    result.mediaUserErrors.forEach(error => {
      console.error(`Field: ${error.field}, Message: ${error.message}`);
    });
  }
} catch (error) {
  console.error('Failed to attach media:', error);
}
```

## Common Issues & Tips

### 1. Invalid URL
**Error**: "originalSource is not a valid URL"
**Solution**: Ensure your URL is publicly accessible and properly formatted

### 2. File Too Large
**Error**: File size exceeds limits
**Solution**: 
- Images: Max 20MB
- Videos: Check Shopify's current limits
- Compress files before uploading

### 3. Wrong MIME Type
**Error**: Invalid file type
**Solution**: Use correct MIME types:
- JPEG: `image/jpeg`
- PNG: `image/png`
- GIF: `image/gif`
- MP4: `video/mp4`

### 4. Media Still Processing
**Issue**: Images don't show immediately
**Solution**: Media status will be `PROCESSING` initially. Wait a few seconds and query again.

### 5. Rate Limits
**Issue**: Too many uploads failing
**Solution**: Shopify has rate limits on media uploads. Batch your uploads and add delays between large batches.

## Fetching Media from a Product

To retrieve media later:

```javascript
const client = shopifyService.createGraphQLClient(store);

const query = `
  query getProductMedia($id: ID!) {
    product(id: $id) {
      title
      media(first: 10) {
        edges {
          node {
            alt
            mediaContentType
            status
            ... on MediaImage {
              id
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

const response = await client.request(query, {
  variables: { id: "gid://shopify/Product/1234567890" }
});

console.log('Product media:', response.data.product.media.edges);
```

## Best Practices

1. **Start with External URLs**: Test with external URLs first before implementing file uploads
2. **Log Errors**: Always log `mediaUserErrors` for debugging
3. **Check Status**: Monitor media status, especially for videos
4. **Alt Text**: Always provide descriptive alt text for accessibility
5. **Batch Operations**: If uploading many images, batch them to avoid rate limits
6. **Error Recovery**: Don't fail product creation if image attachment fails (already handled in the code)

## Integration with Your Current Workflow

Your current product creation already supports images! Just add the `images` array to your `productData`:

```javascript
// Your existing code
const productData = {
  title: "Product Name",
  // ... other fields
  images: [
    { url: "https://cdn.example.com/image1.jpg", alt: "Image 1" },
    { url: "https://cdn.example.com/image2.jpg", alt: "Image 2" }
  ]
};

// This will create the product AND attach images automatically
const product = await shopifyService.createProductInShopify(store, productData);
```

## References

- [Shopify: Manage Media for Products](https://shopify.dev/docs/apps/build/products/media)
- [productCreateMedia Mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreateMedia)
- [stagedUploadsCreate Mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/stagedUploadsCreate)
- [MediaStatus Enum](https://shopify.dev/docs/api/admin-graphql/latest/enums/MediaStatus)

---

**Need Help?** Check the console logs - all methods include detailed logging to help you debug issues.
