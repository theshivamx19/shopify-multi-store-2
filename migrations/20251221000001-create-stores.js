'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stores', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT
            },
            shop_domain: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            access_token: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            scopes: {
                type: Sequelize.TEXT,
                allowNull: true
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

        // Add indexes
        await queryInterface.addIndex('stores', ['shop_domain'], {
            name: 'idx_shop_domain'
        });
        await queryInterface.addIndex('stores', ['is_active'], {
            name: 'idx_is_active'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('stores');
    }
};
