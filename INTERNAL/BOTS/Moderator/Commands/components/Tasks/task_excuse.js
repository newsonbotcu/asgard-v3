const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const Task_duties = require("../../../../../MODELS/Economy/Task_duty");
const Task_current = require("../../../../../MODELS/Economy/Task_current");
const Task_done = require("../../../../../MODELS/Economy/Task_done");
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
        const startRol = guild.roles.cache.get(roles.get("starter").value());
        const hoistroller = guild.roles.cache
            .filter(r => r.rawPosition > startRol.rawPosition + 2)
            .filter(r => r.hoist)
            .filter(r => r.id !== roles.get("booster").value())
            .sort((a, b) => a.rawPosition - b.rawPosition).array().reverse();
        const rawrol = mentioned.roles.cache.filter(r => r.hoist).sort((a, b) => a.rawPosition - b.rawPosition).array().reverse()[0];
        const myRol = hoistroller.find(r => r.rawPosition === rawrol.rawPosition);
        const myDuties = await Task_current.findOne({ roleID: myRol.id });
        


    }
}

module.exports = RolSeçim;