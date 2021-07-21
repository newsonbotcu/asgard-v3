const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class MuteCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'mute',
            description: 'Kişiyi Susturur',
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
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'süre',
                    description: 'Süreyi belirtiniz (dakika bazında)',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'sebep',
                    description: 'Sebebi belirtiniz',
                    required: true
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
            },
            throttling: {
                duration: 60,
                usages: 3
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
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        if (!Object.values(ctx.options)[1]) return await ctx.send(`Bir sebep girmelisin`, {
            ephemeral: true
        });
        if (guild.members.cache.get(ctx.user.id).roles.highest.rawPosition <= mentioned.roles.highest.rawPosition) return await ctx.send(`${emojis.get("missingPerms").value()} Bunu yapmak için yeterli yetkiye sahip değilsin`, {
            ephemeral: true
        });
        if (!mentioned.bannable) return await ctx.send(`Bu kişiyi mutelemek için yeterli yetkiye sahip değilim`, {
            ephemeral: true
        });
        switch (Object.values(ctx.options)[1]) {
            case "chat":
                await client.extention.emit('cMute', mentioned, ctx.user.id, Object.values(ctx.options)[3], Object.values(ctx.options)[2]);
                break;

            case "voice":
                await client.extention.emit('vMute', mentioned, ctx.user.id, Object.values(ctx.options)[3], Object.values(ctx.options)[2]);
                break;

            default:
                break;
        }
        const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısı başarıyla Susturuldu!`);
        await ctx.send({
            embeds: [responseEmbed]
        });
    }
}
