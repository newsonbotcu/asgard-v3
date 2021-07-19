const model = require('../../../../MODELS/Temprorary/permit');
const { checkMins } = require('../../../../HELPERS/functions');
module.exports = class {
    constructor(client) {
        this.client = client
    }
    async run(client) {
        client = this.client;
        const asd = await model.find();
        asd.filter(doc => checkMins(doc.creadet) >= doc.duration).forEach(async doc => {
            await model.deleteOne({ id: doc._id });
        });
        client.logger.log('PERM OK');
        setInterval(async () => {
            const asdf = await model.find();
            asdf.filter(doc => checkMins(doc.creadet) >= doc.duration).forEach(async doc => {
                await model.deleteOne({ id: doc._id });
            });
            client.logger.log('PERM OK')
        }, 1000 * 30);
    }
}