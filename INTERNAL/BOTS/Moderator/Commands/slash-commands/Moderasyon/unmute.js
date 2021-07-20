const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const vMute = require('../../../../../MODELS/Moderation/mod_vmute');
const cMute = require('../../../../../MODELS/Moderation/mod_cmute');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class MuteCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'unmute',
            description: 'Kişinin varolan susturulmasını kaldırır.',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'tür',
                    description: 'Türünü belirtiniz',
                    required: true,
                    choices: [
                        {
                            name: "Chat",
                            value: "chat"
                        },
                        {
                            name: "Voice",
                            value: "voice"
                        }
                    ]
                }
            ],
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
                [IDS.guild]: [
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.mute,
                        permission: true
                    },
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.owner,
                        permission: true
                    },
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.root,
                        permission: true
                    }
                ]
            }
        });

        this.filePath = __filename;
    }

    async run(ctx) {
        const client = ctx.creator.client;
        const utils = await low(client.adapters('utils'));
        const roles = await low(client.adapters('roles'));
        const channels = await low(client.adapters('channels'));
        const emojis = await low(client.adapters('emojis'));
        const userID = Object.values(ctx.options)[0];
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        const guild = client.guilds.cache.get(ctx.guildID);
        switch (Object.values(ctx.options)[1]) {
            case "chat":
                const cData = await cMute.findOne({ _id: mentioned.user.id });
                const cError = new Discord.MessageEmbed().setDescription(`${emojis.get("notfound").value()} Kayıt Bulunamadı`);
                if (!cData) return await ctx.send({
                    embeds: [cError]
                });
                const cErr = new Discord.MessageEmbed().setDescription(`${emojis.get("missingPerms").value()} Bunu yapabilmek için yeterli yetkiye sahip değilsin!`);
                if (guild.members.cache.get(cData.executor).roles.highest.rawPosition > guild.members.cache.get(ctx.user.id).roles.highest.rawPosition) return await ctx.send({
                    embeds: [cErr]
                });
                await cMute.deleteOne({ _id: mentioned.user.id });
                await mentioned.roles.remove(roles.get("muted").value());
                break;

            case "voice":
                const vData = await vMute.findOne({ _id: mentioned.user.id });
                const vError = new Discord.MessageEmbed().setDescription(`${emojis.get("notfound").value()} Kayıt Bulunamadı`);
                if (!vData) return await ctx.send({
                    embeds: [vError]
                });
                const vErr = new Discord.MessageEmbed().setDescription(`${emojis.get("missingPerms").value()} Bunu yapabilmek için yeterli yetkiye sahip değilsin!`);
                if (guild.members.cache.get(vData.executor).roles.highest.rawPosition > guild.members.cache.get(ctx.user.id).roles.highest.rawPosition) return await ctx.send({
                    embeds: [vErr]
                });
                await vMute.deleteOne({ _id: mentioned.user.id });
                if (mentioned.voice && mentioned.voice.channel) await mentioned.voice.setMute(false);
                break;

            default:
                break;
        }
        const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısının susturulması kaldırıldı.`);
        await ctx.send({
            embeds: [responseEmbed]
        });
    }
}
