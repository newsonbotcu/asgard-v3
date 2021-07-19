const low = require('lowdb')
const model = require('../../../../MODELS/Moderation/mod_vmute');
const { checkMins } = require('../../../../HELPERS/functions');
module.exports = class {

    constructor(client) {
        this.client = client
    }

    async run(client) {
        client = this.client;
        const guild = client.guilds.cache.get(client.config.server);
        const asd = await model.find();
        asd.forEach(async doc => {
            if (checkMins(doc.created) >= doc.duration) {
                if (guild.members.cache.get(doc._id) && guild.members.cache.get(doc._id).voice.channel) await guild.members.cache.get(doc._id).voice.setMute(false);
                await model.deleteOne({ _id: doc._id });
            }
        });
        client.logger.log('VMUTE OK');
        setInterval(async () => {
            const asdf = await model.find();
            asdf.forEach(async doc => {
                if (checkMins(doc.created) >= doc.duration) {
                    if (guild.members.cache.get(doc._id) && guild.members.cache.get(doc._id).voice.channel) await guild.members.cache.get(doc._id).voice.setMute(false);
                    await model.deleteOne({ _id: doc._id });
                }
            })
            client.logger.log('VMUTE OK');
        }, 1000 * 60);
    }
}