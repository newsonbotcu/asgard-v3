const low = require('lowdb');
const Discord = require("discord.js");
const afkdata = require('../../../../MODELS/Datalake/afk');
const Tagli = require('../../../../MODELS/Datalake/tagged');
const { comparedate, checkMins, checkHours } = require('../../../../HELPERS/functions');
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
        if (message.member.roles.cache.has(roles.get("welcome").value()) && (message.content === "393") && ((message.channel.id === channels.get("welcome").value()) || (message.channel.id === channels.get("otb").value()))) {
            message.delete();
            await message.member.roles.remove(message.member.roles.cache.filter(r => r.id !== roles.get("booster").value()).array());
            await message.member.roles.add(roles.get("otb").value());
        }
        if (message.member.roles.cache.has(roles.get("welcome").value()) && (message.content === "393") && ((message.channel.id === channels.get("welcome").value()) || (message.channel.id === channels.get("otb").value()))) {
            message.delete();
            await message.member.roles.remove(message.member.roles.cache.filter(r => r.id !== roles.get("booster").value()).array());
            await message.member.roles.add(roles.get("otbmisafir").value());
        }
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
        /*
        const pointData = await Points_profile.findOne({ _id: message.author.id });
        if (pointData) {
            const pointConfig = await Points_config.findOne({ _id: pointData.role });
            if (pointData) await Points_profile.updateOne({ _id: message.author.id }, {
                $inc: { msgPoints: pointConfig.message }
            });
        }
        */
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
                        if (pointData && !pointData.points.filter(point => point.type === "tagged").find(point => point.target === message.author.id)) await Points_profile.updateOne({ _id: myTagData.executor }, {
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
        if (!message.content.startsWith(client.config.prefix)) return;
        if (message.author.bot) return;
        let command = message.content.split(' ')[0].slice(client.config.prefix.length);
        let cmd;
        let args = message.content.split(' ').slice(1);
        if (client.commands.has(command)) {
            cmd = client.commands.get(command);
        } else if (client.aliases.has(command)) {
            cmd = client.commands.get(client.aliases.get(command));
        } else return;
        const embed = new Discord.MessageEmbed();
        if (!cmd.config.enabled) return;
        if (cmd.config.dmCmd && (message.channel.type !== 'dm')) return message.channel.send(`${emojis.get("dmcmd").value()} Bu komut bir **DM** komutudur.`);
        if (cmd.config.ownerOnly && (message.author.id !== client.config.owner)) return message.channel.send(`${emojis.get("tantus").value()} Bu komutu sadece ${client.owner} kullanabilir.`);
        if (cmd.config.onTest && !utils.get("testers").value().includes(message.author.id) && (message.author.id !== client.config.owner)) return message.channel.send(`${emojis.get("ontest").value()} Bu komut henüz **test aşamasındadır**.`);
        if (cmd.config.rootOnly && !utils.get("mod").value().includes(message.author.id) && (message.author.id !== client.config.owner)) return message.channel.send(`${emojis.get("rootonly").value()} Bu komutu sadece **yardımcılar** kullanabilir.`);
        if (cmd.config.adminOnly && !message.member.permissions.has("MANAGE_ROLES") && (message.author.id !== client.config.owner)) return message.channel.send(`${emojis.get("moddonly").value()} Bu komutu sadece **yöneticiler** kullanabilir.`);
        if (cmd.info.cmdChannel & message.guild && message.guild.channels.cache.get(channels.get(cmd.info.cmdChannel).value()) && (message.channel.id !== channels.get(cmd.info.cmdChannel).value())) return message.channel.send(`${emojis.get("text").value()} Bu komutu ${message.guild.channels.cache.get(channels.get(cmd.info.cmdChannel).value())} kanalında kullanmayı dene!`);
        if (message.guild && !cmd.config.dmCmd) {
            const requiredRoles = cmd.info.accaptedPerms || [];
            let allowedRoles = [];
            await requiredRoles.forEach(rolValue => {
                allowedRoles.push(message.guild.roles.cache.get(roles.get(rolValue).value()));
            });
            let deyim = `Bu komutu kullanabilmek için ${allowedRoles[0]} rolüne sahip olmalısın!`;
            if (allowedRoles.length > 1) deyim = `Bu komutu kollanabilmek için aşağıdaki rollerden birisine sahip olmalısın:\n${allowedRoles.join(`\n`)}`;
            if ((allowedRoles.length >= 1) && !allowedRoles.some(role => message.member.roles.cache.has(role.id)) && !message.member.permissions.has("ADMINISTRATOR") && (message.author.id !== client.config.owner)) {
                return message.channel.send(embed.setDescription(deyim).setColor('#2f3136'));
            }
        }
        let uCooldown = client.cmdCoodown[message.author.id];
        if (!uCooldown) {
            client.cmdCoodown[message.author.id] = {};
            uCooldown = client.cmdCoodown[message.author.id];
        }
        let time = uCooldown[cmd.info.name] || 0;
        if (time && (time > Date.now())) return message.channel.send(`${emojis.get("dmcmd").value()} Komutu tekrar kullanabilmek için lütfen **${Math.ceil((time - Date.now()) / 1000)}** saniye bekle!`);

        client.logger.log(`[(${message.author.id})] ${message.author.username} ran command [${cmd.info.name}]`, "cmd");
        if ((command !== 'tag') && (message.channel.id === "857659757233700875") && !message.member.permissions.has("MANAGE_ROLES")) return;
        try {
            cmd.run(client, message, args);
        } catch (e) {
            console.log(e);
            return message.channel.send(`${emojis.get("error").value()} | Sanırım bir hata oluştu...`);
        }
    }
}