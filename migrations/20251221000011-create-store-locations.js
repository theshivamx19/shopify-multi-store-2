'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('store_locations', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
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
            shopify_location_id: {
                type: Sequelize.BIGINT,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        // Add unique constraint and index
        await queryInterface.addConstraint('store_locations', {
            fields: ['store_id', 'shopify_location_id'],
            type: 'unique',
            name: 'unique_store_location'
        });

        await queryInterface.addIndex('store_locations', ['store_id'], {
            name: 'idx_store_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('store_locations');
    }
};
