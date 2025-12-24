const db = require('../models/index');

const productService = {
    getProductById: async (id) => {
        return await db.Product.findByPk(id);
    },
    getAllProducts: async () => {
        return await db.Product.findAll();
    },
    getProductsByIds: async (productIds) => {
        return await db.Product.findAll({
            where: {
                id: {
                    [Op.in]: productIds
                }
            }
        });
    }
}

module.exports = productService;