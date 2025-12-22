'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VariantStore extends Model {
        static associate(models) {
            // VariantStore belongs to ProductVariant
            VariantStore.belongsTo(models.ProductVariant, {
                foreignKey: 'variant_id',
                as: 'variant'
            });

            // VariantStore belongs to Store
            VariantStore.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });

            // VariantStore belongs to ProductStore
            VariantStore.belongsTo(models.ProductStore, {
                foreignKey: 'product_store_id',
                as: 'productStore'
            });

            // VariantStore has many variant inventory (optional - multi-location)
            VariantStore.hasMany(models.VariantInventory, {
                foreignKey: 'variant_store_id',
                as: 'inventory'
            });
        }
    }

    VariantStore.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        variant_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        product_store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        shopify_variant_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'CRITICAL: Shopify variant ID needed for updates'
        },
        shopify_inventory_item_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            comment: 'Shopify inventory item ID for inventory management'
        },
        sync_status: {
            type: DataTypes.ENUM('pending', 'synced', 'failed'),
            defaultValue: 'pending'
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        synced_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'VariantStore',
        tableName: 'variant_stores',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return VariantStore;
};
