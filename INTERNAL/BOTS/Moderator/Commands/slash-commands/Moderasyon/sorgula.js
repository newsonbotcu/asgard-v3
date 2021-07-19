const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const sicil = require('../../../../../MODELS/StatUses/stat_crime');
const stringTable = require('string-table');
const { checkDays } = require('../../../../../HELPERS/functions');
const { stripIndent } = require("common-tags");
const IDS = require('../../../../../BASE/personels.json');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'sorgula',
            description: 'Var olan bir cezayı sorgulatır.',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.STRING,
                    name: 'ceza',
                    description: 'Cezayı belirtiniz',
                    choices: [
                        {
                            name: "Jail",
                            value: "jail"
                        },
                        {
                            name: "Chat Mute",
                            value: "cmute"
                        },
                        {
                            name: "Voce Mute",
                            value: "vmute"
                        }
                    ],
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
                        id: IDS.commands,
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
        const guild = client.guilds.cache.get(ctx.guildID);
        const mentioned = client.guilds.cache.get(ctx.guildID).members.cache.get(userID);
        const errEmbed = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Kullanıcı bulunamadı!`).setColor('#2f3136')
        if (!mentioned) return await ctx.send({
            embeds: [errEmbed]
        });
        const Datas = require(`../../../../../MODELS/Moderation/mod_${Object.values(ctx.options["ceza"])[0]}`);
        switch (Object.values(ctx.options["ceza"])[0]) {
            case "jail":
                
                break;
        
            default:
                break;
        }



    }
}
