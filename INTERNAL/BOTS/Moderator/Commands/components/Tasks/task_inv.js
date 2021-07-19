const Component = require("../../../Base/Component");
const Discord = require('discord.js');
const low = require('lowdb');
const Task_roles = require("../../../../../MODELS/Economy/Task_roles");
const membership = require("../../../../../MODELS/Datalake/membership");
const stat_msg = require("../../../../../MODELS/StatUses/stat_msg");
const stat_voice = require("../../../../../MODELS/StatUses/stat_voice");
const tagged = require("../../../../../MODELS/Datalake/tagged");
const personel = require("../../../../../MODELS/Datalake/personel");
const invite = require("../../../../../MODELS/Datalake/invite");
const { checkHours, comparedate } = require("../../../../../HELPERS/functions");
const Task_profile = require("../../../../../MODELS/Economy/Task_profile");
const { stripIndent } = require("common-tags");
class RolSeçim extends Component {
    constructor(client) {
        super(client, {
            name: "task_inv",
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
        const profile = await Task_profile.findOne({ _id: mentioned.user.id });
        const myRol = guild.roles.cache.get(profile.role);
        const startRol = guild.roles.cache.get(roles.get("starter").value());
        const hoistroller = guild.roles.cache
            .filter(r => r.rawPosition > startRol.rawPosition + 2)
            .filter(r => r.hoist)
            .filter(r => r.id !== roles.get("booster").value())
            .sort((a, b) => a.rawPosition - b.rawPosition).array().reverse();
        const rawrol = mentioned.roles.cache.filter(r => r.hoist).sort((a, b) => a.rawPosition - b.rawPosition).array().reverse()[0];
        const nextRol = hoistroller.reverse().find(r => r.rawPosition > rawrol.rawPosition);
        const Duties = profile.active;
        const myOldDuties = profile.done;
        const RoleData = await Task_roles.findOne({ _id: profile.role });

        if (!RoleData) return await ctx.send(`Sahip olduğun bir yetki bulunamadı!`, {
            ephemeral: true
        });


        function bar(point, maxPoint) {
            const deger = Math.trunc(point * 5 / maxPoint);
            let str = "";
            for (let index = 2; index < 4; index++) {
                if ((deger / index) >= 1) {
                    str = str + emojis.get("ortabar_dolu").value()
                } else {
                    str = str + emojis.get("ortabar").value()
                }
            }
            if (deger === 0) {
                str = `${emojis.get("solbar").value()}${str}${emojis.get("sagbar").value()}`
            } else if (deger === 5) {
                str = `${emojis.get("solbar_dolu").value()}${str}${emojis.get("sagbar_dolu").value()}`
            } else {
                str = `${emojis.get("solbar_dolu").value()}${str}${emojis.get("sagbar").value()}`
            }
            return str;
        }
        const strArrayCur = [];
        for (let index = 0; index < Duties.length; index++) {
            const curTask = Duties[index];
            switch (curTask.type) {
                case "invite":
                    const Invites = await invite.find({ claim: mentioned.user.id });
                    const invitePoints = Invites.filter(doc => comparedate(doc.created) < comparedate(curTask.created)).length;
                    strArrayCur.push(`${bar(invitePoints, curTask.count)}${emojis.get("task_invite").value()} Davet: \`${invitePoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                case "registry":
                    const Registries = await membership.find({ executor: mentioned.user.id });
                    const registryPoints = Registries.filter(data => comparedate(data.created) < comparedate(curTask.created)).length;
                    strArrayCur.push(`${bar(registryPoints, curTask.count)}${emojis.get("task_registry").value()} Kayıt: \`${registryPoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                case "tagged":
                    const Taggeds = await tagged.find({ claim: mentioned.user.id });
                    const taggedPoints = Taggeds.filter(doc => comparedate(doc.created) < comparedate(curTask.created)).length;
                    strArrayCur.push(`${bar(taggedPoints, curTask.count)}${emojis.get("task_tagged").value()} Taglı: \`${taggedPoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                case "auth":
                    const Personels = await personel.find({ claim: mentioned.user.id });
                    const personelPoints = Personels.filter(doc => comparedate(doc.created) < comparedate(curTask.created)).length;
                    strArrayCur.push(`${bar(personelPoints, curTask.count)}${emojis.get("task_auth").value()} Yetkili: \`${personelPoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                case "voicexp":
                    const voiceXp = await stat_voice.findOne({ _id: mentioned.user.id });
                    const voicePoints = voiceXp.records.filter(data => comparedate(data.created) < comparedate(curTask.created)).map(data => data.xp).reduce((a, c) => a + c, 0);
                    strArrayCur.push(`${bar(voicePoints, curTask.count)}${emojis.get("task_auth").value()} Ses: \`${voicePoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                case "message":
                    const messageXp = await stat_msg.findOne({ _id: mentioned.user.id });
                    const msgPoints = messageXp.records.filter(data => comparedate(data.created) < comparedate(curTask.created)).length;
                    strArrayCur.push(`${bar(msgPoints, curTask.count)}${emojis.get("task_auth").value()} Mesaj: \`${msgPoints}/${curTask.count}\`(${curTask.points} puan)`);
                    break;

                default:
                    break;
            }
        }

        const strArrayDone = [];
        for (let index = 0; index < myOldDuties.length; index++) {
            const oldTask = myOldDuties[index];
            switch (oldTask.type) {
                case "invite":
                    const Invites = await invite.find({ claim: mentioned.user.id });
                    const invitePoints = Invites.filter(doc => comparedate(doc.created) < comparedate(oldTask.created)).length;
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_invite").value()} Davet: \`${invitePoints}/${oldTask.count}\`(+${oldTask.points} puan)`);
                    break;

                case "registry":
                    const Registries = await membership.find({ executor: mentioned.user.id });
                    const registryPoints = Registries.filter(data => comparedate(data.created) < comparedate(oldTask.created)).length;
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_registry").value()} Kayıt: \`${registryPoints}/${oldTask.count}\`(${oldTask.points} puan)`);
                    break;

                case "tagged":
                    const Taggeds = await tagged.find({ claim: mentioned.user.id });
                    const taggedPoints = Taggeds.filter(doc => comparedate(doc.created) < comparedate(oldTask.created)).length;
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_tagged").value()} Taglı: \`${taggedPoints}/${oldTask.count}\`(${oldTask.points} puan)`);
                    break;

                case "auth":
                    const Personels = await personel.find({ claim: mentioned.user.id });
                    const personelPoints = Personels.filter(doc => comparedate(doc.created) < comparedate(oldTask.created)).length;
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_auth").value()} Yetkili: \`${personelPoints}/${oldTask.count}\`(${oldTask.points} puan)`);
                    break;

                case "voicexp":
                    const voiceXp = await stat_voice.findOne({ _id: mentioned.user.id });
                    const voicePoints = voiceXp.records.filter(data => comparedate(data.created) < comparedate(oldTask.created)).map(data => data.xp).reduce((a, c) => a + c, 0);
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_auth").value()} Ses: \`${voicePoints}/${oldTask.count}\`(${oldTask.points} puan)`);
                    break;

                case "message":
                    const messageXp = await stat_msg.findOne({ _id: mentioned.user.id });
                    const msgPoints = messageXp.records.filter(data => comparedate(data.created) < comparedate(oldTask.created)).length;
                    strArrayDone.push(`${emojis.get("point_done").value()}${emojis.get("task_auth").value()} Mesaj: \`${msgPoints}/${oldTask.count}\`(${oldTask.points} puan)`);
                    break;

                case "bonus":
                    strArrayDone.push(`${emojis.get("point_bonus").value()} Bonus: **${oldTask.points} puan**`);
                    break;
                default:
                    break;
            }
        }

        const embed = new Discord.MessageEmbed().setDescription(stripIndent`
        **Asgard** puan bilgileri
        ${mentioned} kullanıcısının puan bilgileri
        Yetkisi: ${myRol}
        ●▬▬▬▬▬▬▬▬▬▬●
        ${emojis.get("tasks_active").value()} Aktif görevler:
        ${strArrayCur.join('\n')}
        ●▬▬▬▬▬▬▬▬▬▬●
        ${emojis.get("tasks_done").value()} Bitmiş görevler:
        ${strArrayDone.join('\n')}
        ${bar(myOldDuties.map(task => task.points).reduce((a, c) => a + c, 0), RoleData.passPoint)} Toplam puan: \`${myOldDuties.map(task => task.points).reduce((a, c) => a + c, 0)}/${RoleData.passPoint}\`
        ${emojis.get("point_time").value()} ${nextRol} rolüne yükselmek için ${RoleData.expiresIn - checkHours(profile.started)} saatin var!
        `);
        await ctx.send({
            embeds: [embed],
            ephemeral: true
        });

    }
}

module.exports = RolSeçim;