'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            // Product has many options
            Product.hasMany(models.ProductOption, {
                foreignKey: 'product_id',
                as: 'options'
            });

            // Product has many variants
            Product.hasMany(models.ProductVariant, {
                foreignKey: 'product_id',
                as: 'variants'
            });

            // Product has many images
            Product.hasMany(models.ProductImage, {
                foreignKey: 'product_id',
                as: 'images'
            });

            // Product has many product stores (sync tracking)
            Product.hasMany(models.ProductStore, {
                foreignKey: 'product_id',
                as: 'productStores'
            });
        }

        // Helper method to get full product with all relationships
        async getFullProduct() {
            return await Product.findByPk(this.id, {
                include: [
                    {
                        model: sequelize.models.ProductOption,
                        as: 'options',
                        include: [{
                            model: sequelize.models.ProductOptionValue,
                            as: 'values'
                        }]
                    },
                    {
                        model: sequelize.models.ProductVariant,
                        as: 'variants',
                        include: [{
                            model: sequelize.models.ProductVariantOptionValue,
                            as: 'optionValues',
                            include: [
                                { model: sequelize.models.ProductOption, as: 'option' },
                                { model: sequelize.models.ProductOptionValue, as: 'value' }
                            ]
                        }]
                    },
                    {
                        model: sequelize.models.ProductImage,
                        as: 'images'
                    }
                ]
            });
        }
    }

    Product.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        vendor: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        product_type: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'draft', 'archived'),
            defaultValue: 'active'
        },
        tags: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('tags');
                return rawValue ? rawValue.split(',').map(tag => tag.trim()) : [];
            },
            set(value) {
                this.setDataValue('tags', Array.isArray(value) ? value.join(',') : value);
            }
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Product;
};
