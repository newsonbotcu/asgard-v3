const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const low = require('lowdb');
const Discord = require('discord.js');
const roleXp = require('../../../../../MODELS/Economy/xp_role');
const channelXp = require('../../../../../MODELS/Economy/xp_channel');
const IDS = require('../../../../../BASE/personels.json');

module.exports = class JailCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'xpset',
            description: 'xp sistemi ayarlama komutu',
            options: [
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'rank',
                    description: 'Rank ayarlayınız',
                    options: [
                        {
                            type: CommandOptionType.ROLE || CommandOptionType.STRING,
                            name: "rol",
                            description: "verilecek rol",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "limit",
                            description: "gerekli xp",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'gain',
                    description: 'Kanaldaki xpyi düzenleyin',
                    options: [
                        {
                            type: CommandOptionType.CHANNEL || CommandOptionType.STRING,
                            name: "kanal",
                            description: "Kanalı belirtiniz",
                            required: true
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "xp",
                            description: "Dakika başı verilecek xpyi giriniz",
                            required: true
                        }
                    ]
                },
                {
                    type: CommandOptionType.SUB_COMMAND,
                    name: 'extra',
                    description: 'Extra etkileri düzenleyin',
                    options: [
                        {
                            type: CommandOptionType.CHANNEL || CommandOptionType.STRING,
                            name: "kanal",
                            description: "Kanalı belirtiniz",
                            required: true
                        },
                        {
                            type: CommandOptionType.STRING,
                            name: "durum",
                            description: "Durumu belirtiniz",
                            required: true,
                            choices: [
                                {
                                    name: "Mikrofon kapalı",
                                    value: "selfMute"
                                },
                                {
                                    name: "AFK",
                                    value: "selfDeaf"
                                },
                                {
                                    name: "Sağırlaştırılmış",
                                    value: "serverDeaf"
                                },
                                {
                                    name: "Susturulmuş",
                                    value: "serverMute"
                                },
                                {
                                    name: "Yayında",
                                    value: "streaming"
                                },
                                {
                                    name: "Cam açık",
                                    value: "videoOn"
                                }
                            ]
                        },
                        {
                            type: CommandOptionType.INTEGER,
                            name: "xp",
                            description: "Xp'yi belirtiniz (- değer girilebilir.)",
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
                        id: '479293073549950997',
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
            case "rank":
                const roleData = await roleXp.findOne({ _id: Object.values(ctx.options)[0]['rol'] });
                if (!roleData) {
                    await roleXp.create({
                        _id: Object.values(ctx.options)[0]['rol'],
                        requiredXp: Object.values(ctx.options)[0]['limit']
                    });
                } else {
                    await roleXp.updateOne({ _id: Object.values(ctx.options)[0]['rol'] }, {
                        $set: {
                            requiredXp: Object.values(ctx.options)[0]['limit']
                        }
                    });
                }
                const rolesData = await roleXp.find();
                const embedLol = new Discord.MessageEmbed().setDescription(rolesData.map(data => `<@&${data._id}> : ${data.requiredXp} xp`));
                await ctx.send({
                    embeds: [embedLol]
                });
                break;

            case "gain":
                const channelData = await channelXp.findOne({ _id: Object.values(ctx.options)[0]['kanal'] });
                if (!channelData) {
                    const guildChannel = guild.channels.cache.get(Object.values(ctx.options)[0]['kanal']);
                    if (!guildChannel || (guildChannel.type !== 'category')) return await ctx.send(`Bir kategori girmelisin!`);
                    guild.channels.cache.filter(c => c.parentID === Object.values(ctx.options)[0]['kanal']).filter(c => c.type === "voice").forEach(async (channel) => {
                        await channelXp.create({
                            _id: channel.id,
                            digit: Object.values(ctx.options)[0]['xp'],
                            selfMute: 0,
                            serverMute: 0,
                            selfDeaf: 0,
                            serverDeaf: 0,
                            videoOn: 0,
                            streaming: 0
                        });
                    });
                } else {
                    await channelXp.updateOne({ _id: Object.values(ctx.options)[0]['kanal'] }, {
                        $set: {
                            digit: Object.values(ctx.options)[0]['xp']
                        }
                    });
                }
                await ctx.send(`${guild.channels.cache.filter(c => c.parentID === Object.values(ctx.options)[0]['kanal']).filter(c => c.type === "voice").array().length} kanal için ayarlandı!`);
                break;

            case "extra":
                const ghannel = guild.channels.cache.get(Object.values(ctx.options)[0]['kanal']);
                if (!ghannel || (ghannel.type !== 'category')) return await ctx.send(`Bir kategori girmelisin!`);
                guild.channels.cache.filter(c => c.parentID === Object.values(ctx.options)[0]['kanal']).filter(c => c.type === "voice").forEach(async (channel) => {
                    await channelXp.updateOne({ _id: channel.id }, {
                        $set: {
                            [Object.values(ctx.options)[0]['durum']]: Object.values(ctx.options)[0]['xp']
                        }
                    });
                });
                await ctx.send("Ayarlandı!");
                break;

            default:
                break;
        }
    }
}
