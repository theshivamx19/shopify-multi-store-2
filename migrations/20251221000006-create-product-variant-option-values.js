'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_variant_option_values', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            product_variant_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_variants',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_option_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_options',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_option_value_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_option_values',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add unique constraint and indexes
        await queryInterface.addConstraint('product_variant_option_values', {
            fields: ['product_variant_id', 'product_option_id'],
            type: 'unique',
            name: 'unique_variant_option'
        });

        await queryInterface.addIndex('product_variant_option_values', ['product_variant_id'], {
            name: 'idx_product_variant_id'
        });
        await queryInterface.addIndex('product_variant_option_values', ['product_option_id'], {
            name: 'idx_product_option_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_variant_option_values');
    }
};
