'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class VariantImage extends Model {
        static associate(models) {
            // VariantImage belongs to ProductVariant
            VariantImage.belongsTo(models.ProductVariant, {
                foreignKey: 'variant_id',
                as: 'variant'
            });

            // VariantImage belongs to ProductImage
            VariantImage.belongsTo(models.ProductImage, {
                foreignKey: 'image_id',
                as: 'image'
            });
        }
    }

    VariantImage.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        variant_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        image_id: {
            type: DataTypes.BIGINT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'VariantImage',
        tableName: 'variant_images',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return VariantImage;
};
