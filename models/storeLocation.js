'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StoreLocation extends Model {
        static associate(models) {
            // StoreLocation belongs to Store
            StoreLocation.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });

            // StoreLocation has many variant inventory
            StoreLocation.hasMany(models.VariantInventory, {
                foreignKey: 'location_id',
                as: 'inventory'
            });
        }
    }

    StoreLocation.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        shopify_location_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'StoreLocation',
        tableName: 'store_locations',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return StoreLocation;
};
