'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_option_values', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
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
            value: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Option value like Small, Red, Cotton'
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
        await queryInterface.addIndex('product_option_values', ['product_option_id'], {
            name: 'idx_product_option_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_option_values');
    }
};
