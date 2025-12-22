'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
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
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Variant title like Large / Red'
      },
      sku: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      barcode: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      compare_at_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      inventory_quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      weight_unit: {
        type: Sequelize.ENUM('kg', 'g', 'lb', 'oz'),
        defaultValue: 'kg'
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
    await queryInterface.addIndex('product_variants', ['product_id'], {
      name: 'idx_product_id'
    });
    await queryInterface.addIndex('product_variants', ['sku'], {
      name: 'idx_sku'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_variants');
  }
};
