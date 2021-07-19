const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const Task_duties = require("../../../../../MODELS/Economy/Task_duty");
const Task_current = require("../../../../../MODELS/Economy/Task_current");
const Task_done = require("../../../../../MODELS/Economy/Task_done");
const Task_profile = require("../../../../../MODELS/Economy/Task_profile");
class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "task_excuse",
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
        const profiles = await Task_profile.find();
        const excuseCount = profiles.map(p => p.excuses.length).reduce((a, c) => a + c, 0);
        const parent = guild.channels.cache.get(channels.get("excuse").value());

        const channel = await guild.channels.create(`mazeret-${excuseCount + 1}`, {
            type: 'text',
            topic: `${mentioned.displayName} (${mentioned.roles.highest})`,
            nsfw: false,
            parent: parent
        });
        await channel.updateOverwrite(mentioned.user.id, {
            VIEW_CHANNEL: true
        });
        const filter_1 = (msg) => msg.author.id === mentioned.user.id;
        const collector_1 = new Discord.MessageCollector(channel, filter_1, {
            time: 120000
        });
        let reason;
        let days;
        await channel.send(`Selam ${mentioned}!, mazeret sebebini öğrenebilir miyim?`);
        collector_1.on("collect", async (message) => {

        });



    }
}

module.exports = RolSeçim;