'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_options', {
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
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Option name like Size, Color, Material'
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

        // Add indexes
        await queryInterface.addIndex('product_options', ['product_id'], {
            name: 'idx_product_id'
        });
        await queryInterface.addIndex('product_options', ['position'], {
            name: 'idx_position'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('product_options');
    }
};
