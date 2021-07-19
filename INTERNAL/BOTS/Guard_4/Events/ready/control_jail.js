const low = require('lowdb')
const model = require('../../../../MODELS/Moderation/mod_jail');
const { checkDays } = require('../../../../HELPERS/functions');
module.exports = class {

    constructor(client) {
        this.client = client
    }

    async run(client) {
        client = this.client;
        const roles = await low(client.adapters('roles'));
        const guild = client.guilds.cache.get(client.config.server);
        const asd = await model.find();
        asd.filter(doc => doc.type === "temp").forEach(async doc => {
            if (checkDays(doc.created) >= doc.duration) {
                if (guild.members.cache.get(doc._id)) {
                    await guild.members.cache.get(doc._id).roles.add(doc.roles.map(rname => guild.roles.cache.find(role => role.name === rname) || roles.get("member").value()));
                    await guild.members.cache.get(doc._id).roles.remove(roles.get("prisoner").value());
                }
                await model.deleteOne({ _id: doc._id })
            }
        });
        client.logger.log('JAIL OK');
        setInterval(async () => {
            const asdf = await model.find({ type: "temp" });
            asdf.forEach(async doc => {
                if (checkDays(doc.created) >= doc.duration) {
                    if (guild.members.cache.get(doc._id)) {
                        await guild.members.cache.get(doc._id).roles.add(doc.roles.map(rname => guild.roles.cache.find(role => role.name === rname) || roles.get("member").value()));
                        await guild.members.cache.get(doc._id).roles.remove(roles.get("prisoner").value());
                    }
                    await model.deleteOne({ _id: doc._id })
                }
            })
            client.logger.log('JAIL OK');
        }, 1000 * 60);
    }
}