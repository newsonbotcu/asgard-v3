const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'permver',
            description: 'Kişiye perm verir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'perm',
                    description: 'verilecek perm',
                    required: true,
                    choices: [
                        {
                            name: "Registry",
                            value: IDS.registry
                        },
                        {
                            name: "Ability",
                            value: IDS.ability
                        },
                        {
                            name: "Mute",
                            value: IDS.mute
                        },
                        {
                            name: "Jail",
                            value: IDS.jail
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
        const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136');
        if (!mentioned) return await ctx.send({
            embeds: [errEmbed]
        });
        const roleID = ctx.options["perm"];
        await mentioned.roles.add([roleID, IDS.commands]);
        const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısına <@&${roleID}> başarıyla verildi!`);
        await ctx.send({
            embeds: [responseEmbed]
        });
    }
}
