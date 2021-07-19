const Roles = require("../../../MODELS/Datalake/backup_role");

class Ready {

    constructor(client) {
        this.client = client;
    }

    async run(client) {
        client = this.client;
        const guild = client.guilds.cache.get(client.config.server);
        client.logger.log(`${client.user.tag}, ${client.users.cache.size} kişi için hizmet vermeye hazır!`, "ready");
        await client.user.setPresence({ activity: client.config.status, status: "idle" });
        client.owner = client.users.cache.get(client.config.owner);
        const roles = guild.roles.cache.array();
        for (let index = 0; index < roles.length; index++) {
            const role = roles[index];
            const roleData = await Roles.findOne({ _id: role.id });
            if (!roleData) {
                const newData = new Roles({
                    _id: role.id,
                    name: role.name,
                    color: role.hexColor,
                    hoist: role.hoist,
                    mentionable: role.mentionable,
                    rawPosition: role.rawPosition,
                    bitfield: role.permissions
                });
                await newData.save();
            }
        }
    }
}
module.exports = Ready;