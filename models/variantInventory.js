'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VariantInventory extends Model {
        static associate(models) {
            // VariantInventory belongs to VariantStore
            VariantInventory.belongsTo(models.VariantStore, {
                foreignKey: 'variant_store_id',
                as: 'variantStore'
            });

            // VariantInventory belongs to StoreLocation
            VariantInventory.belongsTo(models.StoreLocation, {
                foreignKey: 'location_id',
                as: 'location'
            });
        }
    }

    VariantInventory.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        variant_store_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        location_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        available_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        modelName: 'VariantInventory',
        tableName: 'variant_inventory',
        underscored: true,
        timestamps: true,
        createdAt: false,
        updatedAt: 'updated_at'
    });

    return VariantInventory;
};
