const low = require('lowdb')
const model = require('../../../../MODELS/Moderation/mod_ban');
const { checkDays } = require('../../../../HELPERS/functions');
module.exports = class {

    constructor(client) {
        this.client = client
    }

    async run(client) {
        client = this.client;
        const guild = client.guilds.cache.get(client.config.server);
        const asd = await model.find();
        asd.filter(doc => doc.type === "temp").forEach(async doc => {
            if (checkDays(doc.created) >= doc.duration) {
                guild.members.unban(doc._id);
                await model.deleteOne({ _id: doc._id });
            }
        });
        client.logger.log('Banlar OK')
        setInterval(async () => {
            const asdf = await model.find()
            asdf.filter(doc => doc.type === "temp").forEach(async doc => {
                if (checkDays(doc.created) >= doc.duration) {
                    guild.members.unban(doc._id);
                    await model.deleteOne({ _id: doc._id });
                }
            })
            client.logger.log('Banlar OK')
        }, 1000 * 60 * 60);
    }
}