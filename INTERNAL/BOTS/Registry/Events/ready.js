const low = require('lowdb');
const wait = require('util').promisify(setTimeout);
const Memberz = require('../../../MODELS/Datalake/MemberRoles');

class Ready {

    constructor(client) {
        this.client = client;
    }

    async run(client) {

        client = this.client;
        const utiller = await low(this.client.adapters('utils'));
        const guild = client.guilds.cache.get(client.config.server);
        client.guild = guild;
        client.logger.log(`${client.user.tag}, ${client.users.cache.size} kişi için hizmet vermeye hazır!`, "ready");
        await client.user.setPresence({ activity: client.config.status, status: "idle" });
        client.owner = client.users.cache.get(client.config.owner);
        await wait(1000);
        await guild.fetchInvites().then(guildInvites => { client.invites[guild.id] = guildInvites });
        if (guild.vanityURLCode) {
            await guild.fetchVanityData().then(async (res) => {
                utiller.update("vanityUses", n => res.uses).write();
                console.log(res.uses);
            }).catch(console.error);
        }
        let adays = guild.members;
        await adays.cache.forEach(async (mem) => {
            let id = mem.id;
            let sexiboyz = [];
            let system = await Memberz.findOne({ _id: id });
            if (!system) {
                await mem.roles.cache.forEach(async (rol) => {
                    sexiboyz.push(rol.name);
                    await this.client.logger.log(` [ROL BULUNDU] : ${mem.user.username} => ${rol.name}`, "mngdb");
                });
                try {
                    let sex = new Memberz({ _id: id, roles: sexiboyz});
                    await sex.save();
                    await this.client.logger.log(` [KİTAPLIĞA EKLENDİ] : ${mem.user.username}`, "mngdb");
                } catch (error) {
                    throw error;
                }
            }
        });
        await this.client.logger.log(` [KAYITLAR TAMAMLANDI] `, "mngdb");

    }
}
module.exports = Ready;