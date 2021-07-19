const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');

class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "oyun_secim",
            channel: "rol-al",
            accaptedPerms: [],
            cooldown: 10000,
            enabled: true,
            ownerOnly: false,
            rootOnly: false,
            onTest: false,
            adminOnly: false
        });
    }

    async run(ctx) {
        const client = this.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const emojis = await low(client.adapters('emojis'));
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = guild.members.cache.get(ctx.user.id);
        if (!ctx.data.data.values) return await mentioned.roles.remove(Object.keys(roles.value()).filter(key => key.startsWith("oyun_")).map(key => roles.get(key).value()));
        const roleIDs = ctx.data.data.values.map(v => roles.get(v).value());
        const rolArray = roleIDs.map(rID => guild.roles.cache.get(rID));
        await mentioned.roles.remove(Object.keys(roles.value()).filter(key => key.startsWith("oyun_")).map(key => roles.get(key).value()));
        await mentioned.roles.add(roleIDs);
        const responseEmbed = new Discord.MessageEmbed().setDescription(`Sana;\n ${rolArray.join('\n')}\nrollerini verdim.`);
    }
}

module.exports = RolSeçim;