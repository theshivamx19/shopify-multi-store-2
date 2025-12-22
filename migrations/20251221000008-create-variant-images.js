'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('variant_images', {
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
            image_id: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'product_images',
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

        // Add unique constraint and index
        await queryInterface.addConstraint('variant_images', {
            fields: ['variant_id', 'image_id'],
            type: 'unique',
            name: 'unique_variant_image'
        });

        await queryInterface.addIndex('variant_images', ['variant_id'], {
            name: 'idx_variant_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('variant_images');
    }
};
