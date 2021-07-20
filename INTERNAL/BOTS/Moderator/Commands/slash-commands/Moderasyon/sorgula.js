const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const { checkDays, checkMins } = require('../../../../../HELPERS/functions');
const { stripIndent } = require("common-tags");
const IDS = require('../../../../../BASE/personels.json');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'sorgula',
            description: 'Var olan bir cezayı sorgulatır.',
            options: [
                {
                    type: CommandOptionType.INTEGER,
                    name: 'kullanıcı-id',
                    description: "Kullanıcının ID'sini belirtiniz",
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
                            name: "Voice Mute",
                            value: "vmute"
                        },
                        {
                            name: "Ban",
                            value: "ban"
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
        if (!mentioned) return await ctx.send(`Kullanıcı bulunamadı`, {
            ephemeral: true
        });
        const errEmbed2 = new Discord.MessageEmbed().setDescription(`${emojis.get("kullaniciyok").value()} Data bulunamadı!`).setColor('#2f3136');
        const Datas = require(`../../../../../MODELS/Moderation/mod_${Object.values(ctx.options["ceza"])[0]}`);
        const sorguData = await Datas.findOne({ _id: userID });
        if (!sorguData && Object.values(ctx.options["ceza"])[0] !== "ban") return ctx.send({
            embeds: [errEmbed2]
        });
        const embed = new Discord.MessageEmbed();
        switch (Object.values(ctx.options["ceza"])[0]) {
            case "jail":
                embed.setTitle("Jail Bilgisi").setDescription(stripIndent`
                ${emojis.get("user").value()} **Kullanıcı:** ${guild.members.cache.get(userID) || `Sunucuda değil (${userID})`}
                ${emojis.get("reason").value()} **Jail sebebi:** ${sorguData.reason}
                ${emojis.get("id").value()} **Kullanıcı ID'si:** ${userID}
                \`Komutu Kullanan:\` ${guild.members.cache.get(sorguData.executor) || `Sunucuda değil (${sorguData.executor})`}
                \`Jail türü:\` ${sorguData.type}
                \`Açılacağı tarih:\` ${(sorguData.type === "temp") ? `${sorguData.duration - checkDays(sorguData.created)} gün sonra` : "Açılmayacak"}
                `).setColor('#2f3136').setFooter("Asgard ❤️ Tantoony");
                break;
            case "ban":
                const banInfo = await message.guild.fetchBan(userID);
                embed.setTitle("Ban Bilgisi").setDescription(stripIndent`
                ${emojis.get("user").value()} **Kullanıcı:** ${banInfo.user.tag}
                ${emojis.get("reason").value()} **Banlanma sebebi:** ${banInfo.reason}
                ${emojis.get("id").value()} **Kullanıcı ID'si:** ${banInfo.user.id}
                \`Komut sebebi:\` ${sorguData ? sorguData.reason : "Komut kullanılmamış"}
                \`Komutu Kullanan:\` ${guild.members.cache.get(sorguData ? sorguData.executor : "123") ? guild.members.cache.get(sorguData.executor) : `Sunucuda değil (${sorguData ? sorguData.executor : "Bulunamadı"})`}
                \`Ban türü:\` ${sorguData ? sorguData.type : "Perma"}
                \`Açılacağı tarih:\` ${(sorguData.type === "temp") ? `${sorguData.duration - checkDays(sorguData.created)} gün sonra` : "Açılmayacak"}
                `).setColor('#2f3136').setFooter("Asgard ❤️ Tantoony");
                break;
            case "vmute":
                embed.setTitle("Mute Bilgisi").setDescription(stripIndent`
                ${emojis.get("user").value()} **Kullanıcı:** ${guild.members.cache.get(userID) || `Sunucuda değil (${userID})`}
                ${emojis.get("reason").value()} **Mute sebebi:** ${sorguData.reason}
                ${emojis.get("id").value()} **Kullanıcı ID'si:** ${userID}
                \`Komutu Kullanan:\` ${guild.members.cache.get(sorguData.executor) || `Sunucuda değil (${sorguData.executor})`}
                \`Açılacağı tarih:\` ${`${sorguData.duration - checkMins(sorguData.created)} dakika sonra`}
                `).setColor('#2f3136').setFooter("Asgard ❤️ Tantoony");
                break;
            case "cmute":
                embed.setTitle("Mute Bilgisi").setDescription(stripIndent`
                ${emojis.get("user").value()} **Kullanıcı:** ${guild.members.cache.get(userID) || `Sunucuda değil (${userID})`}
                ${emojis.get("reason").value()} **Mute sebebi:** ${sorguData.reason}
                ${emojis.get("id").value()} **Kullanıcı ID'si:** ${userID}
                \`Komutu Kullanan:\` ${guild.members.cache.get(sorguData.executor) || `Sunucuda değil (${sorguData.executor})`}
                \`Açılacağı tarih:\` ${`${sorguData.duration - checkMins(sorguData.created)} dakika sonra`}
                `).setColor('#2f3136').setFooter("Asgard ❤️ Tantoony");
                break;
            default:
                break;
        }
        await ctx.send({
            embeds: [embed]
        });



    }
}
