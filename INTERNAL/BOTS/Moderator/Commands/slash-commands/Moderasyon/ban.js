const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'ban',
            description: 'Kişiyi banlar',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'sebep',
                    description: 'Sebebi belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'süre',
                    description: 'Gün bazında Süreyi belirtiniz',
                    required: false
                }
            ],
            deferEphemeral: false,
            defaultPermission: false,
            guildIDs: [IDS.guild],
            permissions: {
              [IDS.guild]: [
                {
                  type: ApplicationCommandPermissionType.ROLE,
                  id: IDS.ban,
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
        if (!mentioned.bannable) return await ctx.send(`Bu kişiyi banlamak için yeterli yetkiye sahip değilim`, {
            ephemeral: true
        });
        let typo = "Temp";
        let duration = Object.values(ctx.options)[2];
        if (!Object.values(ctx.options)[2]) typo = "Perma";
        await client.extention.emit('Ban', guild, mentioned.user, ctx.user.id, Object.values(ctx.options)[1], typo, duration);
        const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısı başarıyla banlandı!`);
        await ctx.send({
            embeds: [responseEmbed]
        });
    }
}
