const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { checkDays, rain } = require('../../../../../HELPERS/functions');
const StatData = require('../../../../../MODELS/StatUses/stat_voice');
const InviteData = require('../../../../../MODELS/StatUses/stat_invite');
const RegData = require('../../../../../MODELS/Datalake/membership');
const { stripIndent } = require('common-tags');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'stat',
            description: 'Statları gösterir',
            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'tür',
                    description: 'Statın türünü belirtiniz',
                    choices: [
                        {
                            name: 'davet',
                            value: 'invite'
                        },
                        {
                            name: 'kayıt',
                            value: 'registry'
                        },
                        {
                            name: 'ses',
                            value: 'voice'
                        }
                    ],
                    required: true
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'gün',
                    description: 'Kaç güne kadar statları görmek istersin?'
                },
                {
                    type: CommandOptionType.MENTIONABLE || CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Hangi kullanıcının statına bakacaksın?'
                }
            ],
            guildIDs: [IDS.guild],
            deferEphemeral: false,
            throttling: {
                duration: 60,
                usages: 1
            }
        });

        this.filePath = __filename;
    }

    async run(ctx) {
        const client = ctx.creator.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const userID = Object.values(ctx.options)[2] || ctx.member.user.id;
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        let days = Object.values(ctx.options)[1] || 7;
        const type = Object.values(ctx.options)[0];
        const guild = client.guilds.cache.get(ctx.guildID);
        switch (type) {
            case 'voice':
                const Data = await StatData.findOne({ _id: mentioned.user.id });
                if (!Data) return ctx.send(`${emojis.get("kullaniciyok").value()} Data bulunamadı.`);
                const records = Data.records.filter(r => checkDays(r.enter) < days);
                const responseEmbed = new Discord.MessageEmbed().setDescription(stripIndent`
                ${mentioned} kişisine ait ${days} günlük ses bilgileri:
                
                __**Public Ses İstatistikleri**__
                Toplam ses: \`${Math.floor(records.filter(r => r.channelType === "st_public").map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_public").map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Mikrofon kapalı: \`${Math.floor(records.filter(r => r.channelType === "st_public").filter(r => r.selfMute).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_public").filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kulaklık kapalı: \`${Math.floor(records.filter(r => r.channelType === "st_public").filter(r => r.selfDeaf).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_public").filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Yayın Açık: \`${Math.floor(records.filter(r => r.channelType === "st_public").filter(r => r.streaming).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_public").filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kamera Açık: \`${Math.floor(records.filter(r => r.channelType === "st_public").filter(r => r.videoOn).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_public").filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                ───────────────────
                __**Secret Ses İstatistikleri**__
                Toplam ses: \`${Math.floor(records.filter(r => r.channelType === "st_private").map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_private").map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Mikrofon kapalı: \`${Math.floor(records.filter(r => r.channelType === "st_private").filter(r => r.selfMute).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_private").filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kulaklık kapalı: \`${Math.floor(records.filter(r => r.channelType === "st_private").filter(r => r.selfDeaf).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_private").filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Yayın Açık: \`${Math.floor(records.filter(r => r.channelType === "st_private").filter(r => r.streaming).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_private").filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kamera Açık: \`${Math.floor(records.filter(r => r.channelType === "st_private").filter(r => r.videoOn).map(r => r.duration).length > 0 ? records.filter(r => r.channelType === "st_private").filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                ───────────────────
                __**Toplam Ses İstatistikleri**__
                Toplam ses: \`${Math.floor(records.map(r => r.duration).length > 0 ? records.map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Mikrofon kapalı: \`${Math.floor(records.filter(r => r.selfMute).map(r => r.duration).length > 0 ? records.filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kulaklık kapalı: \`${Math.floor(records.filter(r => r.selfDeaf).map(r => r.duration).length > 0 ? records.filter(r => r.selfMute).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Yayın Açık: \`${Math.floor(records.filter(r => r.streaming).map(r => r.duration).length > 0 ? records.filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                Kamera Açık: \`${Math.floor(records.filter(r => r.videoOn).map(r => r.duration).length > 0 ? records.filter(r => r.streaming).map(r => r.duration).reduce((a, b) => a + b) / 60000 : 0)} dakika\`
                `).setThumbnail(mentioned.user.displayAvatarURL({ type: 'gif' })).setColor(mentioned.displayHexColor).setTitle(guild.name);
                return await ctx.send({
                    embeds: [responseEmbed]
                }); 

            case 'invite':
                const DataInv = await InviteData.findOne({ _id: mentioned.user.id });
                if (!DataInv) return await ctx.send(`${emojis.get("kullaniciyok").value()} Data bulunamadı.`);
                const embed = new Discord.MessageEmbed().setColor('#2f3136').setDescription(stripIndent`
                Kullanıcı: **${mentioned.user.username}**
                Davet sayısı: ${DataInv.records.length}
                Sunucuda olan davet ettiği kişi sayısı: ${DataInv.records.filter(rec => message.guild.members.cache.get(rec.user)).length}
                `).setThumbnail(mentioned.user.displayAvatarURL({ type: 'gif' })).setColor(mentioned.displayHexColor).setTitle(guild.name);
                return await ctx.send({
                    embeds: [embed]
                });

            case 'registry':
                const datam = await RegData.find({ executor: mentioned.user.id });
                if (!datam) return ctx.send(`${emojis.get("kullaniciyok").value()} Data bulunamadı.`);

                const embedD = new Discord.MessageEmbed().setColor('#2f3136').setDescription(stripIndent`
                Kullanıcı: **${mentioned.user.username}**
                Kayıt sayısı: ${datam.length}
                Bugünkü kayıt sayısı: ${datam.filter(data => checkDays(data.created) <= 1).length} 
                Haftalık kayıt sayısı: ${datam.filter(data => checkDays(data.created) <= 7).length} 
                `).setThumbnail(mentioned.user.displayAvatarURL({ type: 'gif' })).setColor(mentioned.displayHexColor).setTitle(guild.name);

                return await ctx.send({
                    embeds: [embedD]
                });

            default:
                break;
        }
    }
}
