const { ProductStore } = require('./models');

async function checkError() {
    try {
        const ps = await ProductStore.findOne({
            where: {
                product_id: 22,
                store_id: 2
            }
        });

        if (ps) {
            console.log('--- Product Store Record ---');
            console.log('Sync Status:', ps.sync_status);
            console.log('Error Message:', ps.error_message);
            console.log('----------------------------');
        } else {
            console.log('Record not found');
        }
    } catch (err) {
        console.error('Error querying DB:', err);
    }
}

checkError();
