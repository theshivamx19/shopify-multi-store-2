'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductStore extends Model {
        static associate(models) {
            // ProductStore belongs to Product
            ProductStore.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

            // ProductStore belongs to Store
            ProductStore.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });

            // ProductStore has many variant stores
            ProductStore.hasMany(models.VariantStore, {
                foreignKey: 'product_store_id',
                as: 'variantStores'
            });
        }
    }

    ProductStore.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        shopify_product_id: {
            type: DataTypes.BIGINT,
            allowNull: true
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
        modelName: 'ProductStore',
        tableName: 'product_stores',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ProductStore;
};
