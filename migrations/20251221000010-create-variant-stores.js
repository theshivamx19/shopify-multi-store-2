'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('variant_stores', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            variant_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_variants',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            store_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_store_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            shopify_variant_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
                comment: 'CRITICAL: Shopify variant ID needed for updates'
            },
            shopify_inventory_item_id: {
                type: Sequelize.BIGINT,
                allowNull: true,
                comment: 'Shopify inventory item ID for inventory management'
            },
            sync_status: {
                type: Sequelize.ENUM('pending', 'synced', 'failed'),
                defaultValue: 'pending'
            },
            error_message: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            synced_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Add unique constraint and indexes
        await queryInterface.addConstraint('variant_stores', {
            fields: ['variant_id', 'store_id'],
            type: 'unique',
            name: 'unique_variant_store'
        });

        await queryInterface.addIndex('variant_stores', ['variant_id'], {
            name: 'idx_variant_id'
        });
        await queryInterface.addIndex('variant_stores', ['store_id'], {
            name: 'idx_store_id'
        });
        await queryInterface.addIndex('variant_stores', ['sync_status'], {
            name: 'idx_sync_status'
        });
        await queryInterface.addIndex('variant_stores', ['shopify_variant_id'], {
            name: 'idx_shopify_variant_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('variant_stores');
    }
};
