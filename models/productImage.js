'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        static associate(models) {
            // ProductImage belongs to Product
            ProductImage.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });

            // ProductImage belongs to many variants through variant_images
            ProductImage.belongsToMany(models.ProductVariant, {
                through: 'variant_images',
                foreignKey: 'image_id',
                otherKey: 'variant_id',
                as: 'variants'
            });
        }
    }

    ProductImage.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        alt_text: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        }
    }, {
        sequelize,
        modelName: 'ProductImage',
        tableName: 'product_images',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return ProductImage;
};
