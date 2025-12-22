'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductVariant extends Model {
        static associate(models) {
            // ProductVariant belongs to Product
            ProductVariant.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

            // ProductVariant has many variant stores
            ProductVariant.hasMany(models.VariantStore, {
                foreignKey: 'variant_id',
                as: 'variantStores'
            });

            // ProductVariant has many variant option values
            ProductVariant.hasMany(models.ProductVariantOptionValue, {
                foreignKey: 'product_variant_id',
                as: 'optionValues'
            });

            // ProductVariant belongs to many images through variant_images
            ProductVariant.belongsToMany(models.ProductImage, {
                through: 'variant_images',
                foreignKey: 'variant_id',
                otherKey: 'image_id',
                as: 'images'
            });
        }
    }

    ProductVariant.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Variant title like Large / Red'
        },
        sku: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        barcode: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        compare_at_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        inventory_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        weight: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        weight_unit: {
            type: DataTypes.ENUM('kg', 'g', 'lb', 'oz'),
            defaultValue: 'kg'
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'ProductVariant',
        tableName: 'product_variants',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ProductVariant;
};
