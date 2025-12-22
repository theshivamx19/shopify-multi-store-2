'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_stores', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            product_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'products',
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
            shopify_product_id: {
                type: Sequelize.BIGINT,
                allowNull: true
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
        await queryInterface.addConstraint('product_stores', {
            fields: ['product_id', 'store_id'],
            type: 'unique',
            name: 'unique_product_store'
        });

        await queryInterface.addIndex('product_stores', ['product_id'], {
            name: 'idx_product_id'
        });
        await queryInterface.addIndex('product_stores', ['store_id'], {
            name: 'idx_store_id'
        });
        await queryInterface.addIndex('product_stores', ['sync_status'], {
            name: 'idx_sync_status'
        });
        await queryInterface.addIndex('product_stores', ['shopify_product_id'], {
            name: 'idx_shopify_product_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_stores');
    }
};
