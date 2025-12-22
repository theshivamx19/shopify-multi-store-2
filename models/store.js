'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Store extends Model {
        static associate(models) {
            // Store has many product stores
            Store.hasMany(models.ProductStore, {
                foreignKey: 'store_id',
                as: 'productStores'
            });

            // Store has many variant stores
            Store.hasMany(models.VariantStore, {
                foreignKey: 'store_id',
                as: 'variantStores'
            });

            // Store has many locations (optional - for multi-location)
            Store.hasMany(models.StoreLocation, {
                foreignKey: 'store_id',
                as: 'locations'
            });
        }
    }

    Store.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        shop_domain: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        access_token: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        scopes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Store',
        tableName: 'stores',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        scopes: {
            active: {
                where: { is_active: true }
            }
        }
    });

    return Store;
};
