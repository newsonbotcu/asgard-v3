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
            name: 'sicil',
            description: 'Sicili gösterir',
            options: [
                {
                    type: CommandOptionType.USER,
                    name: 'kullanıcı',
                    description: 'Kullanıcıyı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'sayfa',
                    description: 'Sayfayı belirtiniz',
                    required: true
                },
                {
                    type: CommandOptionType.INTEGER,
                    name: 'no',
                    description: 'Sayfadaki numarayı belirtiniz',
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
        const DefaultEmbed = new Discord.MessageEmbed().setColor('#2f3136').setDescription(`\`\`\`md\n${embeddoc}\`\`\``).setTitle('SİCİL KONTROL');
        const doc = await sicil.findOne({ _id: mentioned.user.id });
        if (!doc) return await ctx.send(`Dosya bulunamadı!`);
        const scl = await doc.get("records").reverse().slice(20 * (Object.values(ctx.options)[1] - 1), 20 * Object.values(ctx.options)[1]);
        let asdf = [];
        for (let index = 0; index < scl.length; index++) {
            const element = scl[index];
            const shem = {
                no: index + 1,
                tür: `${element.punish} - ${element.type}`,
                gün: checkDays(element.created)
            };
            asdf.push(shem);
        }
        const embeddoc = stringTable.create(asdf, {
            headers: ['no', 'tür', 'gün']
        });
        if (!Object.values(ctx.options)[2]) return await ctx.send({
            embeds: [DefaultEmbed]
        });
        const ecrin = scl[Object.values(ctx.options)[2] - 1];
        const ecrinim = embed.setDescription(stripIndent`
        **Tür:** \`${ecrin.punish} - ${ecrin.type}\`
        **Sebep:**  \`${ecrin.reason}\`
        **Sorumlu:**  ${guild.members.cache.get(ecrin.executor) || "Bilinmiyor"}
        **Zaman:** \`${checkDays(ecrin.created)} gün önce\`
        **Süre:** \`${ecrin.duration}\`
        `).setTitle("Asgard EMNIYET");
        await ctx.send({
            embeds: [ecrinim]
        });




    }
}
