const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const GangDatas = require('../../../../../MODELS//Datalake/gang');
const IDS = require('../../../../../BASE/personels.json');
const { sayi } = require('../../../../../HELPERS/functions');

module.exports = class JailCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'ekip',
            description: 'Sunucu ekiplerini ayarlar',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'al',
                    description: 'Ekip açar',
                    options: [
                        {
                            type: CommandOptionType.STRING,
                            name: "isim",
                            description: "Ekip ismi",
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: "etiket",
                            description: "Ekip etiketi",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'çıkar',
                    description: 'Ekibi çıkarır',
                    options: [
                        {
                            type: CommandOptionType.ROLE,
                            name: "ekip",
                            description: "Ekip rolü",
                            required: true
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
                        type: ApplicationCommandPermissionType.USER,
                        id: "479293073549950997",
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

        switch (Object.keys(ctx.options)[0]) {
            case "al":

                const name = ctx.options["al"]["isim"];
                const tag = ctx.options["al"]["etiket"];
                if (!sayi(tag) || (!tag.length !== 4)) return await ctx.send("Tagı düzgün girmedin!");
                const ekipRol = await guild.roles.create({
                    data: {
                        name: `${name} #${tag}`,
                        hoist: false,
                        permissions: 0,
                        mentionable: false
                    }
                });
                const vChannel = await guild.channels.create(`${name} #${tag}`, {
                    type: "voice",
                    parent: channels.get("gang_cat").value(),
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            allow: [],
                            deny: ["CONNECT"]
                        },
                        {
                            id: ekipRol.id,
                            allow: ["CONNECT"],
                            deny: []
                        }
                    ]
                });
                const cChannel = await guild.channels.create(`${name}-chat`, {
                    type: "text",
                    parent: channels.get("gang_cat").value(),
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone.id,
                            allow: [],
                            deny: ["VIEW_CHANNEL"]
                        },
                        {
                            id: ekipRol.id,
                            allow: ["VIEW_CHANNEL"],
                            deny: []
                        }
                    ]
                });

                await GangDatas.create({
                    _id: name,
                    discriminator: `${tag}`,
                    roleID: ekipRol.id,
                    VchannelID: vChannel.id,
                    CchannelID: cChannel.id,
                    created: new Date()
                });
                await guild.members.cache.filter(m => m.user.username.toLowerCase().includes(name.toLowerCase)).forEach(async (m) => await m.roles.add(ekipRol.id));
                await guild.members.cache.filter(m => m.user.discriminator === `${tag}`).forEach(async (m) => await m.roles.add(ekipRol.id));
                const embedLol = new Discord.MessageEmbed().setDescription(`${name} #${tag} ekibi için her şeyi hazırladım!`);
                await ctx.send({
                    embeds: [embedLol]
                });
                break;

            case "çıkar":
                const data = await GangDatas.findOne({ roleID: ctx.options["çıkar"]["ekip"] });
                await guild.channels.cache.get(data.CchannelID).delete();
                await guild.channels.cache.get(data.VchannelID).delete();
                await guild.roles.cache.get(data.roleID).delete();
                await GangDatas.deleteOne({ _id: data._id });
                await ctx.send(`Hoşçakal ${data._id}...`);
                break;

            default:
                break;
        }
    }
}