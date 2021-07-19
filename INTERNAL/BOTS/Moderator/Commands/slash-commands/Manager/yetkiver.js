const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const IDS = require('../../../../../BASE/personels.json');
const task_profile = require('../../../../../MODELS/Economy/Task_profile');
module.exports = class BanCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'yetkiver',
            description: 'Kişiye yetki verir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz.',
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
                usages: 6
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
        const exeMember = guild.members.cache.get(ctx.user.id);
        const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136');
        if (!mentioned) return await ctx.send({
            embeds: [errEmbed]
        });
        const profile = await task_profile.findOne({ _id: mentioned.user.id });
        if (profile) return await ctx.send(`Bu üye zaten yetkili!`, {
            ephemeral: true
        });
        const role = guild.roles.cache.get(roles.get("starter").value());
        await mentioned.roles.add(role.id);
        await task_profile.create({
            _id: mentioned.user.id,
            role: role.id,
            done: [],
            active: [],
            created: new Date(),
            started: new Date(),
            excuses: []
        });
        await ctx.send(`Profil başarıyla oluşturuldu.`);
    }
}
