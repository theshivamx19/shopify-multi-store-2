'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('variant_inventory', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            variant_store_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'variant_stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            location_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'store_locations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            available_quantity: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Add unique constraint and index
        await queryInterface.addConstraint('variant_inventory', {
            fields: ['variant_store_id', 'location_id'],
            type: 'unique',
            name: 'unique_variant_location'
        });

        await queryInterface.addIndex('variant_inventory', ['variant_store_id'], {
            name: 'idx_variant_store_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('variant_inventory');
    }
};
