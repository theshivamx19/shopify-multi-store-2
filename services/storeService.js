const db = require('../models/index');

const storeService = {
    getAllStores: async () => {
        return await db.Store.findAll();
    },
    getStoreById: async (id) => {
        return await db.Store.findByPk(id);
    },
    getStoresByIds: async (storeIds) => {
        return await db.Store.findAll({
            where: {
                id: {
                    [Op.in]: storeIds
                }
            }
        });
    },
    createStore: async (store) => {
        return await db.Store.create(store);
    },
    updateStore: async (id, store) => {
        return await db.Store.update(store, {
            where: { id: id }
        });
    },
    deleteStore: async (id) => {
        return await db.Store.destroy({
            where: { id: id }
        });
    }
}

module.exports = storeService;
