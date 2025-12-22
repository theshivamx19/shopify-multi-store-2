'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_images', {
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
            url: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            alt_text: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            position: {
                type: Sequelize.INTEGER,
                defaultValue: 1
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

        // Add index
        await queryInterface.addIndex('product_images', ['product_id'], {
            name: 'idx_product_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_images');
    }
};
