const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
const membership = require('../../../../../MODELS/Datalake/membership');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'şüpheaç',
            description: 'Kişinin şüphesini açar',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
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
                        id: IDS.manager,
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
                duration: 60000,
                usages: 4
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
        const guild = client.guilds.cache.get(ctx.guildID);
        const userID = Object.values(ctx.options)[0];
        const mentioned = guild.members.cache.get(userID);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        if (!mentioned.roles.cache.has(roles.get("suspicious").value())) return await ctx.send(`Bu kişi şüpheli değil.`, {
            ephemeral: true
        });
        await mentioned.roles.remove([roles.get("suspicious").value(), roles.get("denied").value()]);
        await mentioned.roles.add(roles.get("welcome").value());
        await ctx.send(`${mentioned} kullanıcısı başarıyla şüpheliden alındı!`);
        
    }
}
