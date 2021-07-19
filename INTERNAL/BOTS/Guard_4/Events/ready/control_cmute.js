const low = require('lowdb')
const model = require('../../../../MODELS/Moderation/mod_cmute');
const { checkMins } = require('../../../../HELPERS/functions');
module.exports = class {

    constructor(client) {
        this.client = client
    }

    async run(client) {
        client = this.client
        const roles = await low(client.adapters('roles'));
        const guild = client.guilds.cache.get(client.config.server);
        const asd = await model.find();
        asd.forEach(async doc => {
            if (checkMins(doc.created) >= doc.duration) {
                if (guild.members.cache.get(doc._id)) await guild.members.cache.get(doc._id).roles.remove(roles.get("muted").value());
                await model.deleteOne({ _id: doc._id });
            }
        });
        client.logger.log('CMUTE OK');
        setInterval(async () => {
            const asdf = await model.find();
            asdf.forEach(async doc => {
                if (checkMins(doc.created) >= doc.duration) {
                    if (guild.members.cache.get(doc._id)) await guild.members.cache.get(doc._id).roles.remove(roles.get("muted").value());
                    await model.deleteOne({ _id: doc._id });
                }
            })
            client.logger.log('CMUTE OK');
        }, 1000 * 60);
    }
}