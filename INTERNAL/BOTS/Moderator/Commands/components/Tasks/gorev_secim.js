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
            name: "gorev_secim",
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
        let strArray = [];
        for (let index = 0; index < ctx.data.data.values.length; index++) {
            const ctxValue = ctx.data.data.values[index];
            const Duty = await Task_duties.findOne({ roleID: myRol.id, type: ctxValue });
            const myProfile = await Task_profile.findOne({ _id: mentioned.user.id });
            const myOldDuties = await Task_done.findOne({ _id: mentioned.user.id });
            if (!Duty) {
                strArray.push(`Sahip olduğun rolde böyle bir görev yok: \`${ctxValue}\``);
            } else {
                const myDuty = myProfile.active.find(task => task.type === ctxValue);
                if (myProfile.done.some(task => task.type === ctxValue) || (myDuty && (myDuty.created < Date.now() - 15000))) {
                    strArray.push(`Zaten bu görevi edindin: \`${ctxValue}\``);
                } else if (myProfile.active.some(task => task.type === ctxValue) && (myDuty.created > Date.now() - 15000)) {
                    strArray.push(`Görev envanterinden sildim: \`${ctxValue}\``);
                    await Task_profile.updateOne({ _id: mentioned.user.id }, { $pull: { active: myDuty } });
                } else {
                    const yeniDuty = {
                        type: ctxValue,
                        count: Duty.count,
                        points: Duty.points,
                        role: myRol.id,
                        created: new Date()
                    }
                    strArray.push(`Görev envanterine eklendi: \`${ctxValue}\``);
                    await Task_profile.updateOne({ _id: mentioned.user.id }, { $push: { active: yeniDuty } });
                }
            }
        }
        const embed = new Discord.MessageEmbed().setDescription(strArray.join('\n')).setColor(myRol.hexColor);
        await ctx.send({
            embeds: [embed],
            ephemeral: true
        });

    }
}

module.exports = RolSeçim;