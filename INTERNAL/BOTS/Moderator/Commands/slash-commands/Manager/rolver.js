const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'rolver',
            description: 'Kişiye rol verir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'rol',
                    description: 'verilecek rol',
                    required: true,
                    choices: [
                        {
                            name: "Streamer",
                            value: "role_streamer"
                        },
                        {
                            name: "Sponsor",
                            value: "role_sponsor"
                        },
                        {
                            name: "Vip",
                            value: "role_vip"
                        },
                        {
                            name: "Ressam",
                            value: "role_ressam"
                        },
                        {
                            name: "Şair",
                            value: "role_poet"
                        },
                        {
                            name: "Yazılım",
                            value: "role_developer"
                        },
                        {
                            name: "Tasarım",
                            value: "role_designer"
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
                  id: IDS.ability,
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
        const guild = client.guilds.cache.get(ctx.guildID);
        const userID = Object.values(ctx.options)[0];
        const mentioned = guild.members.cache.get(userID);
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        const roleID = roles.get(ctx.options["rol"]).value();
        await mentioned.roles.add(roleID);
        const responseEmbed = new Discord.MessageEmbed().setDescription(`${mentioned} kullanıcısına <@&${roleID}> başarıyla verildi!`);
        await ctx.send({
            embeds: [responseEmbed]
        });
    }
}
