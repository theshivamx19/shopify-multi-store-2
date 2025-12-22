'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductOption extends Model {
        static associate(models) {
            // ProductOption belongs to Product
            ProductOption.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

            // ProductOption has many values
            ProductOption.hasMany(models.ProductOptionValue, {
                foreignKey: 'product_option_id',
                as: 'values'
            });

            // ProductOption has many variant option values
            ProductOption.hasMany(models.ProductVariantOptionValue, {
                foreignKey: 'product_option_id',
                as: 'variantOptionValues'
            });
        }
    }

    ProductOption.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Option name like Size, Color, Material'
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'ProductOption',
        tableName: 'product_options',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ProductOption;
};
