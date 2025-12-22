'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            title: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            vendor: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            product_type: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('active', 'draft', 'archived'),
                defaultValue: 'active'
            },
            tags: {
                type: Sequelize.TEXT,
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

        // Add indexes
        await queryInterface.addIndex('products', ['status'], {
            name: 'idx_status'
        });
        await queryInterface.addIndex('products', ['vendor'], {
            name: 'idx_vendor'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};
