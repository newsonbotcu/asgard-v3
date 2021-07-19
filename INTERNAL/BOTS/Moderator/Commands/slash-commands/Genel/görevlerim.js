const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { stripIndent } = require('common-tags');
const IDS = require('../../../../../BASE/personels.json');
const Task_current = require('../../../../../MODELS/Economy/Task_current');

module.exports = class RegistryCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'görevlerim',
            description: 'Var olan görevlerinizi görüntüler',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
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
                        id: IDS.commands,
                        permission: true
                    },
                    {
                        type: ApplicationCommandPermissionType.ROLE,
                        id: IDS.all,
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
                usages: 1
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
        const TaskData = await Task_current.findOne({ _id: ctx.user.id });
        const ekipDatas = TaskData.tasks.map(task => stripIndent`
        Görev ID: \`${task._id}\`
        Görev Türü: \`${task.type}\`

        `).join("\n●▬▬▬▬▬▬▬●\n");
        const embed = new Discord.MessageEmbed().setDescription(ekipDatas).setTitle(guild.name).setThumbnail(guild.iconURL()).setColor('#7bf3e3');
        await ctx.send({
            embeds: [embed]
        });

    }
}