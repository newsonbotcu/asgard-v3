const low = require('lowdb');
const Discord = require("discord.js");
const afkdata = require('../../../../MODELS/Datalake/afk');
const Tagli = require('../../../../MODELS/Datalake/tagged');
const { comparedate, checkMins, checkHours } = require('../../../../HELPERS/functions');
const stat_msg = require('../../../../MODELS/StatUses/stat_msg');
const task_profile = require('../../../../MODELS/Economy/Task_profile');
module.exports = class {
    constructor(client) {
        this.client = client;
    }
    async run(message) {
        const client = this.client;
        if (message.guild && (message.guild.id !== client.config.server)) return;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        let myCooldown = client.spamwait[message.author.id];
        if (!myCooldown) {
            client.spamwait[message.author.id] = {};
            myCooldown = client.spamwait[message.author.id];
        };
        let mytime = myCooldown[message.content] || 0;
        if (mytime && (mytime > Date.now()) && !message.member.permissions.has("ADMINISTRATOR") && (message.channel.id !== '863118599026638868')) {
            let myCount = client.spamcounts[message.author.id];
            if (!myCount) {
                this.client.spamcounts[message.author.id] = {};
                myCount = this.client.spamcounts[message.author.id];
                //console.log(uCount);
            };
            let count = myCount[message.content] || 0;
            //console.log(uCount);
            if (count === 1) message.channel.send(`Spamlamaya devam edersen muteleneceksin! ${message.author}`);
            if (count === 3) {
                message.member.roles.add(roles.get("muted").value());
                message.channel.send(`${message.member} Spam yaptığın için mutelendin!`)
            }
            if (count >= 1) await message.delete();
            this.client.spamcounts[message.author.id][message.content] = count + 1;
        }
        this.client.spamwait[message.author.id][message.content] = Date.now() + 3000;
        let system = await afkdata.findOne({ _id: message.member.user.id });
        if (system) {
            message.channel.send(new Discord.MessageEmbed().setDescription(`Seni tekrardan görmek ne güzel ${message.member}!\n${system.inbox.length > 0 ? `${system.inbox.length} yeni mesajın var!\n●▬▬▬▬▬▬▬▬▬●\n${system.inbox.map(content => `[${message.guild.members.cache.get(content.userID) || "Bilinmiyor"}]: ${content.content} [🔗](${content.url})`).join('\n')}` : "Hiç yeni mesajın yok!"}`));
            await afkdata.deleteOne({ _id: message.member.user.id });
        }
        if (message.mentions.members.first()) {
            const afksindata = await afkdata.find();
            const afks = message.mentions.members.array().filter(m => afksindata.some(doc => doc._id === m.user.id));
            if (afks.length > 0) {
                await message.channel.send(new Discord.MessageEmbed().setDescription(afks.map(afk => `${afk} \`${afksindata.find(data => data._id === afk.user.id).reason}\` sebebiyle, **${checkHours(afksindata.find(data => data._id === afk.user.id).created)}** saattir AFK!`).join('\n')));
                await afks.forEach(async afk => {
                    await afkdata.updateOne({ _id: afk.user.id }, {
                        $push: {
                            inbox: {
                                content: message.content,
                                userID: message.author.id,
                                url: message.url
                            }
                        }
                    });
                });
            }
        }
        const elebaşı = ["discord.gg/", "discord.com/invite/", "discordapp.com/invite/", "discord.me/"];
        if (message.guild && elebaşı.some(link => message.content.includes(link))) {
            let anan = [];
            await message.guild.fetchInvites().then(async (invs) => {
                invs.forEach(async (inv) => {
                    anan.push(inv.code);
                });
                anan.push(utils.get("vanityURL").value());
                anan.push('')
            });
            for (let c = 0; c < elebaşı.length; c++) {
                const ele = elebaşı[c];
                if (message.content.includes(ele)) {
                    const mesaj = message.content.split(ele).slice(1).map(sth => sth.split(' ')[0]);
                    mesaj.forEach(async msg => {
                        if (!anan.some(kod => msg === kod) && !message.member.permissions.has("ADMINISTRATOR")) {
                            message.guild.members.ban(message.author.id, { days: 2, reason: 'REKLAM' });
                            await message.delete();
                        }
                    });
                }
            }
        }
        const msgStat = await stat_msg.findOne({ _id: message.author.id });
        if (!msgStat) {
            await stat_msg.create({
                _id: message.author.id,
                records: [
                    {
                        channel: message.channel.id,
                        content: message.content,
                        created: new Date()
                    }
                ]
            });
        } else {
            await stat_msg.updateOne({ _id: message.author.id }, {
                $push: {
                    records: {
                        channel: message.channel.id,
                        content: message.content,
                        created: new Date()
                    }
                }
            });
        }
        const messageXp = msgStat.records.length || 1;
        const profile = await task_profile.findOne({ _id: message.author.id });
        if (profile && profile.active.some(task => task.type === "message")) {
            const Task = profile.active.find(task => task.type === "message");
            if (messageXp >= Task.count) {
                await task_profile.updateOne({ _id: message.author.id }, { $pull: { active: Task } });
                await task_profile.updateOne({ _id: message.author.id }, { $push: { done: Task } });
            }
        }
        if (message.content === 'onay') {
            const tagData = await Tagli.find({ target: message.author.id });
            if (tagData && (tagData.length !== 0)) {
                const myTagData = tagData.sort((a, b) => comparedate(b.created) - comparedate(a.created))[0];
                if (myTagData && (checkMins(myTagData.created) < 3)) {
                    await Tagli.updateOne({ _id: message.author.id }, { $set: { claim: myTagData.executor } });
                    const msgTagged = await message.guild.channels.cache.get(myTagData.channelID).messages.fetch(myTagData._id);
                    await msgTagged.reactions.removeAll();
                    await message.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
                    await msgTagged.react(emojis.get("ok").value().split(':')[2].replace('>', ''));
                    const pointData = await Points_profile.findOne({ _id: myTagData.executor });
                    if (pointData) {
                        const pointConfig = await Points_config.findOne({ _id: pointData.roleID });
                        if (pointData && !pointData.points.filter(point => point.type === "tagged").find(point => point<target === message.author.id)) await Points_profile.updateOne({ _id: myTagData.executor }, {
                            $push: {
                                points: {
                                    type: "tagged",
                                    points: pointConfig.tagged,
                                    target: message.author.id
                                }
                            }
                        });
                    }
                }
            }
        }
    }
}