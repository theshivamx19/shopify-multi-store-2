'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductVariantOptionValue extends Model {
        static associate(models) {
            // ProductVariantOptionValue belongs to ProductVariant
            ProductVariantOptionValue.belongsTo(models.ProductVariant, {
                foreignKey: 'product_variant_id',
                as: 'variant'
            });

            // ProductVariantOptionValue belongs to ProductOption
            ProductVariantOptionValue.belongsTo(models.ProductOption, {
                foreignKey: 'product_option_id',
                as: 'option'
            });

            // ProductVariantOptionValue belongs to ProductOptionValue
            ProductVariantOptionValue.belongsTo(models.ProductOptionValue, {
                foreignKey: 'product_option_value_id',
                as: 'value'
            });
        }
    }

    ProductVariantOptionValue.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_variant_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        product_option_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        product_option_value_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'ProductVariantOptionValue',
        tableName: 'product_variant_option_values',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return ProductVariantOptionValue;
};
