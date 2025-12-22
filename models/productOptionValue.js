'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductOptionValue extends Model {
        static associate(models) {
            // ProductOptionValue belongs to ProductOption
            ProductOptionValue.belongsTo(models.ProductOption, {
                foreignKey: 'product_option_id',
                as: 'option'
            });

            // ProductOptionValue has many variant option values
            ProductOptionValue.hasMany(models.ProductVariantOptionValue, {
                foreignKey: 'product_option_value_id',
                as: 'variantOptionValues'
            });
        }
    }

    ProductOptionValue.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_option_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Option value like Small, Red, Cotton'
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'ProductOptionValue',
        tableName: 'product_option_values',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ProductOptionValue;
};
