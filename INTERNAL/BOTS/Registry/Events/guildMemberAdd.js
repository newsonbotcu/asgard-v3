const model = require('../../../MODELS/StatUses/Invites');
const cmutes = require('../../../MODELS/Moderation/ChatMuted');
const Jails = require('../../../MODELS/Moderation/Jails');
const regData = require('../../../MODELS/Datalake/Registered');
const low = require("lowdb");
const { checkDays, rain, comparedate } = require('../../../HELPERS/functions');
const { stripIndents } = require('common-tags');
const Task_current = require('../../../MODELS/Economy/Task_current');
const Task_done = require('../../../MODELS/Economy/Task_done');
const Points_config = require('../../../MODELS/Economy/Points_config');
const Points_profile = require('../../../MODELS/Economy/Points_profile');
class GuildMemberAdd {

    constructor(client) {
        this.client = client;
    }

    async run(member) {
        const client = this.client;
        if (member.guild.id !== client.config.server) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        if (member.user.bot) {
            const entry = await member.guild.fetchAuditLogs({ type: "BOT_ADD" }).then(logs => logs.entries.first());
            if (client.config.owner === entry.executor.id) {
                await member.roles.add(roles.get("bots").value());
            } else {
                await member.kick("Korundu");
                const exeMember = member.guild.members.cache.get(entry.executor.id);
                client.extention.emit("Ban", member.guild, exeMember, this.client.user.id, "KDE - Bot Ekleme", "Perma", 1);
            }
            return;
        }

        let davetci = {};
        let count = 0;
        if (member.guild.vanityURLCode) {
            let aNumber = 0;
            await member.guild.fetchVanityData().then(data => { aNumber = data.uses }).catch(console.error);
            if (utils.get("vanityUses").value() < aNumber) {
                await member.guild.fetchVanityData().then(data => { utils.update("vanityUses", n => data.uses).write(); }).catch(console.error());
                davetci = {
                    username: "ÖZEL URL"
                };
            }
        }
        await member.guild.fetchInvites().then(async gInvites => {
            const invData = client.invites[member.guild.id];
            let invite = gInvites.find(inv => inv.uses > invData.get(inv.code).uses) || invData.find(i => !gInvites.has(i.code));
            if (invite) {
                davetci = invite.inviter;
                const obj = {
                    user: member.user.id,
                    created: new Date()
                };
                let systeminv = await model.findOne({ _id: davetci.id });
                if (!systeminv) {
                    try {
                        let save = new model({ _id: davetci.id, records: [] });
                        await save.save();
                    } catch (error) {
                        console.log(error);
                    }
                }
                systeminv = await model.findOne({ _id: davetci.id });
                const dosyam = await systeminv.get('records');
                if (!dosyam.some(entry => entry.user === member.user.id)) await model.updateOne({ _id: davetci.id }, { $push: { records: obj } });
                count = dosyam.length + 1 || 1;
                const currentTasks = await Task_current.findOne({ _id: davetci.id });
                if (currentTasks) {
                    const invTask = currentTasks.tasks.find(task => task.type === "invite");
                    const inviteData = await model.findOne({ _id: davetci.id });
                    if (invTask) {
                        const comparedInvites = inviteData.invites.filter(invlog => comparedate(invlog.created) <= comparedate(invTask.created));
                        if (comparedInvites >= invTask.count) {
                            await Task_current.updateOne({ _id: davetci.id }, { $pull: { tasks: invTask } });
                            await Task_done.updateOne({ _id: davetci.id }, { $push: { tasks: invTask } });
                        }
                    }
                }

                const pointData = await Points_profile.findOne({ _id: davetci.id });
                if (pointData) {
                    const pointConfig = await Points_config.findOne({ _id: pointData.roleID });
                    if (pointData && !pointData.points.filter(point => point.type === "invite").find(point => point.invited === member.user.id)) await Points_profile.updateOne({ _id: davetci.id }, {
                        $push: {
                            points: {
                                type: "invite",
                                points: pointConfig.invite,
                                invited: member.user.id
                            }
                        }
                    });
                }


            }
        });
        let pointed = '✧';
        if (member.user.username.includes(client.config.tag)) {
            pointed = client.config.tag;
            await member.roles.add(roles.get("crew").value());
        }
        let mute = await cmutes.findOne({ _id: member.user.id });
        if (mute) {
            client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Muteli');
            await member.roles.add(roles.get("muted").value());
        }
        let registered = await regData.findOne({ _id: member.user.id });
        if (registered) await member.setNickname(`${pointed} ${registered.name} | ${registered.age}`);
        await member.guild.fetchInvites().then(guildInvites => { client.invites[member.guild.id] = guildInvites });
        if (utils.get("forbidden").value().some(tag => member.user.username.includes(tag))) {
            await member.roles.add(roles.get("forbidden").value());
            client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Yasaklı Tagda');
            const forbidMsg = `Aramıza katılman bizi onurlandırdı ${member} fakat ne yazık ki seni taşıdığın bir tagdan dolayı içeri alamayacağım.`;
            return member.guild.channels.cache.get("forbidden").send(forbidMsg);
        }
        let pJail = await Jails.findOne({ _id: member.user.id });
        if (pJail) {
            if ((pJail.reason === "YASAKLI TAG") && !utils.get("forbidden").value().some(tag => member.user.username.includes(tag))) {
                await pJails.deleteOne({ _id: member.user.id });
            } else {
                await member.roles.add(roles.get("prisoner").value());
                client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Cezalı');
                const forbidMsg = `Aramıza katılman bizi onurlandırdı ${member} fakat ne yazık ki seni cezalı olduğundan dolayı içeri alamayacağım.`;
                return member.guild.channels.cache.get(channels.get("prisoner").value()).send(forbidMsg);
            }
        }
        if (registered) {
            await member.roles.add(roles.get(registered.sex).value());
            await member.roles.add(roles.get("member").value());
            client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Kayıtlı');
            return;
        }
        if (checkDays(member.user.createdAt) < 7) {
            await member.roles.add(roles.get("suspicious").value());
            client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Şüpheli');
            const forbidMsg = `Aramıza katılman bizi onurlandırdı ${member} fakat ne yazık ki hesabın çok yeni olduğundan dolayı içeri alamayacağım.`;
            await member.guild.channels.cache.get("suspicious").send(forbidMsg);
            return;
        }
        await member.roles.add(roles.get("welcome").value());
        member.guild.channels.cache.get(channels.get("welcome").value()).send(stripIndents`
        💯 ASGARD KILL ZONE
        ${emojis.get("pando1").value()} Asgard'a hoş geldin ${member},
        Hesabın ${rain(clinet, checkDays(member.user.createdAt))} gün önce oluşturulmuştur.
        ${emojis.get("pando2").value()} Seni buraya getiren kişi: ${davetçi ? (davetçi.username || "Özel URL") : "Özel URL"}
        \`[Davet Sayısı: ${count ? count : 0}]\`
        ${emojis.get("pando2").value()} **Bifrost** isimli kanallardan birine girip kayıt olabilirsin.
        `);
        client.extention.emit('Logger', 'Registry', member.user.id, 'MEMBER_ADD', 'Yeni üye');
    }
}

module.exports = GuildMemberAdd;