const { SlashCommand, CommandOptionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { checkDays, rain } = require('../../../../../HELPERS/functions');
const StatData = require('../../../../../MODELS/StatUses/stat_voice');
const InviteData = require('../../../../../MODELS/StatUses/stat_invite');
const RegData = require('../../../../../MODELS/Datalake/membership');
const { stripIndent } = require('common-tags');
const IDS = require('../../../../../BASE/personels.json');
const invites = require('../../../../../MODELS/StatUses/stat_invite');
const registry = require('../../../../../MODELS/Datalake/membership');
module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'toplist',
            description: 'Top statları gösterir',
            options: [
                {
                    type: CommandOptionType.STRING,
                    name: 'tür',
                    description: 'Statın türünü belirtiniz',
                    choices: [
                        {
                            name: 'davet',
                            value: 'invite'
                        },
                        {
                            name: 'kayıt',
                            value: 'registry'
                        }
                    ],
                    required: true
                }
            ],
            guildIDs: [IDS.guild],
            deferEphemeral: false,
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
        const emojis = await low(client.adapters('emojis'));
        const channels = await low(client.adapters('channels'));
        const type = Object.values(ctx.options)[0];
        const guild = client.guilds.cache.get(ctx.guildID);
        switch (type) {
            case 'invite':
                let docs = [];
                const models = await invites.find();
                const documents = models.filter(doc => doc.records.length > 10).sort(function (a, b) {
                    return a.records.length - b.records.length;
                }).reverse().slice(0, 9);
                for (let index = 0; index < documents.length; index++) {
                    const element = documents[index];
                    let fff = message.guild.members.cache.get(element._id);
                    if (fff) {
                        fff = fff.displayName;
                    } else {
                        fff = 'Bilinmiyor';
                    }
                    const shem = {
                        no: index + 1,
                        Kullanıcı: fff,
                        miktar: element.records.length,
                        net: element.records.filter(i => guild.members.cache.get(i.user)).length
                    }
                    docs.push(shem)
                }
                const embeddoc = stringTable.create(docs, {
                    headers: ['no', 'Kullanıcı', 'miktar', 'net']
                });
                const embed = new Discord.MessageEmbed().setTitle("INVITE TOP LIST").setDescription(`\`\`\`md\n${embeddoc}\`\`\``);
                return await ctx.send({
                    embeds: [embed]
                });

            case 'registry':
                const modelss = await invites.find();
                let mapp = {};
                modelss.forEach(doc => {
                    if (!mapp[doc.executor]) mapp[doc.executor] = 0;
                    mapp[doc.executor] = mapp[doc.executor] + 1;
                });
                const sorted = Object.keys(mapp).sort((a, b) => mapp[b] - mapp[a]);
                let docss = [];
                for (let index = 0; index < 10; index++) {
                    const shem = {
                        no: index + 1,
                        Kullanıcı: guild.members.cache.get(sorted[index]) ? guild.members.cache.get(sorted[index]).displayName : "Bilinmiyor",
                        miktar: mapp[sorted[index]],
                    }
                    docss.push(shem)
                }
                const embeddocc = stringTable.create(docss, {
                    headers: ['no', 'Kullanıcı', 'miktar']
                });
                const embedD = new Discord.MessageEmbed().setTitle("REGISTRY TOP LIST").setDescription(`\`\`\`md\n${embeddocc}\`\`\``);
                return await ctx.send({
                    embeds: [embedD]
                });

            default:
                break;
        }
    }
}
