const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const task_profile = require("../../../../../MODELS/Economy/Task_profile");
const Task_roles = require("../../../../../MODELS/Economy/Task_roles");
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
        const myProfile = await task_profile.findOne({ _id: mentioned.user.id });
        if (!myProfile) return await ctx.send(`Henüz bir yetkili profiline sahip değilsin.`, {
            ephemeral: true
        });
        const myRol = guild.roles.cache.get(myProfile.role)
        let strArray = [];
        const ggtask = myProfile.active.filter(task => !ctx.data.data.values.includes(task.type));
        for (let index = 0; index < ggtask.length; index++) {
            const gbtask = ggtask[index];
            strArray.push(`Görev envanterinden sildim: \`${gbtask.type}\``);
            await task_profile.updateOne({ _id: mentioned.user.id }, { $pull: { active: gbtask } });
        }
        for (let index = 0; index < ctx.data.data.values.length; index++) {
            const ctxValue = ctx.data.data.values[index];
            const RoleData = await Task_roles.findOne({ _id: myRol.id });
            if (!RoleData) return await ctx.send(`Sahip olduğun rolde herhangi bir görev yok!`), {
                ephemeral: true
            };
            const Duty = RoleData.tasks.find(task => task.type === ctxValue);
            if (!Duty) {
                strArray.push(`Sahip olduğun rolde böyle bir görev yok: \`${ctxValue}\``);
            } else {
                if (myProfile.done.some(task => task.type === ctxValue)) {
                    strArray.push(`Zaten bu görevi edindin: \`${ctxValue}\``);
                } else {
                    const yeniDuty = {
                        type: ctxValue,
                        count: Duty.count,
                        points: Duty.points,
                        role: myRol.id,
                        created: new Date()
                    }
                    strArray.push(`Görev envanterine eklendi: \`${ctxValue}\``);
                    await task_profile.updateOne({ _id: mentioned.user.id }, { $push: { active: yeniDuty } });
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