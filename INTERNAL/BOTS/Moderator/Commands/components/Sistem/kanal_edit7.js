const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const private_channels = require("../../../../../MODELS/Temprorary/private_channels");

class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "kanal_edit_7",
            channel: "kanal-edit",
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

        const channelData = await private_channels.findOne({ owner: ctx.user.id });
        if (!channelData) return ctx.send("Size ait herhangi bir kanal bulunmamaktadır.", {
            ephemeral: true
        });
        await guild.channels.cache.get(channelData._id).setUserLimit(7);
        await ctx.send("Kanal limiti 7 kullanıcı olarak ayarlandı.", {
            ephemeral: true
        });

    }
}

module.exports = RolSeçim;